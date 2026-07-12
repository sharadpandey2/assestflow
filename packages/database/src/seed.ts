import { db } from "./db";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

const PASSWORD_HASH = "$2b$10$tJ0.OsgoZg8eg0qEiprcbeLL0kw0oO1nsOYCHZ60Fxlhq3v4x9axq"; // password123

async function main() {
  console.log("🌱 Cleaning database tables...");

  // Delete records in reverse dependency order to avoid FK constraint errors
  await db.delete(schema.bookings);
  await db.delete(schema.allocations);
  await db.delete(schema.transferRequests);
  await db.delete(schema.maintenanceRequests);
  await db.delete(schema.auditRecords);
  await db.delete(schema.auditAuditors);
  await db.delete(schema.auditCycles);
  await db.delete(schema.notifications);
  await db.delete(schema.assets);
  
  // Set heads to null in departments to break circular reference with users
  await db.update(schema.departments).set({ headId: null });
  await db.delete(schema.users);
  await db.delete(schema.departments);
  await db.delete(schema.categories);

  console.log("🌱 Seeding database from scratch...");

  // 1. Seed Categories
  console.log("Seeding categories...");
  const categoriesToInsert = [
    {
      name: "Electronics",
      customFieldsSchema: [
        { name: "Warranty Period (Months)", type: "number", required: true },
        { name: "Model Number", type: "text", required: false },
      ],
    },
    {
      name: "Furniture",
      customFieldsSchema: [{ name: "Material", type: "text", required: false }],
    },
    {
      name: "Vehicles",
      customFieldsSchema: [
        { name: "License Plate", type: "text", required: true },
        { name: "Fuel Type", type: "text", required: false },
      ],
    },
    {
      name: "Shared Spaces",
      customFieldsSchema: [{ name: "Capacity", type: "number", required: true }],
    },
  ];

  const insertedCats = await db.insert(schema.categories).values(categoriesToInsert).returning();
  const catsMap: Record<string, string> = {};
  insertedCats.forEach((c) => {
    catsMap[c.name] = c.id;
  });

  // 2. Seed Temporary Admin for Department Creation
  console.log("Seeding temporary admin and departments...");
  const [tempAdmin] = await db
    .insert(schema.users)
    .values({
      name: "Admin Temp",
      email: "admin.temp@assetflow.com",
      passwordHash: PASSWORD_HASH,
      role: "Admin",
      status: "Active",
    })
    .returning();

  // Insert Departments
  const insertedDepts = await db
    .insert(schema.departments)
    .values([
      { name: "IT Department", headId: tempAdmin.id, status: "Active" },
      { name: "Operations", headId: tempAdmin.id, status: "Active" },
      { name: "Marketing", headId: tempAdmin.id, status: "Active" },
      { name: "Human Resources", headId: tempAdmin.id, status: "Active" },
    ])
    .returning();

  const deptsMap: Record<string, string> = {};
  insertedDepts.forEach((d) => {
    deptsMap[d.name] = d.id;
  });

  // Set heads to null to break constraint reference before deleting tempAdmin
  await db.update(schema.departments).set({ headId: null });
  // Delete temp admin
  await db.delete(schema.users).where(eq(schema.users.id, tempAdmin.id));

  // Insert Real Users
  console.log("Seeding real users...");
  const usersToInsert = [
    { name: "Abhinav Tyagi", email: "admin@assetflow.com", role: "Admin" as const, deptName: "Operations" },
    { name: "Priya Shah", email: "priya.shah@assetflow.com", role: "Department Head" as const, deptName: "IT Department" },
    { name: "Raj Patel", email: "raj.patel@assetflow.com", role: "Department Head" as const, deptName: "Operations" },
    { name: "Sarah Connor", email: "sarah.c@assetflow.com", role: "Asset Manager" as const, deptName: "Operations" },
    { name: "Sneha Rao", email: "sneha.rao@assetflow.com", role: "Department Head" as const, deptName: "Marketing" },
    { name: "Amit Verma", email: "amit.verma@assetflow.com", role: "Department Head" as const, deptName: "Human Resources" },
    { name: "Raj Malhotra", email: "raj.m@assetflow.com", role: "Employee" as const, deptName: "IT Department" },
    { name: "Priya Sen", email: "priya.sen@assetflow.com", role: "Employee" as const, deptName: "Marketing" },
  ];

  const usersMap: Record<string, string> = {};
  for (const u of usersToInsert) {
    const [insertedUser] = await db
      .insert(schema.users)
      .values({
        name: u.name,
        email: u.email,
        passwordHash: PASSWORD_HASH,
        role: u.role,
        departmentId: deptsMap[u.deptName],
        status: "Active",
      })
      .returning();
    usersMap[u.name] = insertedUser.id;
  }

  // Update correct Department Heads
  console.log("Linking department heads...");
  await db.update(schema.departments).set({ headId: usersMap["Priya Shah"] }).where(eq(schema.departments.id, deptsMap["IT Department"]));
  await db.update(schema.departments).set({ headId: usersMap["Raj Patel"] }).where(eq(schema.departments.id, deptsMap["Operations"]));
  await db.update(schema.departments).set({ headId: usersMap["Sneha Rao"] }).where(eq(schema.departments.id, deptsMap["Marketing"]));
  await db.update(schema.departments).set({ headId: usersMap["Amit Verma"] }).where(eq(schema.departments.id, deptsMap["Human Resources"]));

  // 3. Seed Assets
  console.log("Seeding assets...");
  const assetsToInsert = [
    {
      assetTag: "AF-0114",
      name: "MacBook Pro M3",
      categoryId: catsMap["Electronics"],
      serialNumber: "SN-LPT-9821",
      acquisitionDate: "2025-01-15",
      acquisitionCost: "1800",
      condition: "Excellent",
      location: "IT Storage - Floor 3",
      isSharedBookable: false,
      status: "Allocated" as const,
      customAttributes: { "Warranty Period (Months)": "36", "Model Number": "A2941" },
    },
    {
      assetTag: "AF-0115",
      name: "MacBook Air M2",
      categoryId: catsMap["Electronics"],
      serialNumber: "SN-LPT-9822",
      acquisitionDate: "2025-03-10",
      acquisitionCost: "1200",
      condition: "Good",
      location: "IT Storage - Floor 3",
      isSharedBookable: false,
      status: "Available" as const,
      customAttributes: { "Warranty Period (Months)": "12", "Model Number": "A2681" },
    },
    {
      assetTag: "AF-0099",
      name: "Dell Latitude 5440",
      categoryId: catsMap["Electronics"],
      serialNumber: "SN-DELL-552",
      acquisitionDate: "2024-06-20",
      acquisitionCost: "1000",
      condition: "Fair",
      location: "Floor 2 West Wing",
      isSharedBookable: false,
      status: "Allocated" as const,
      customAttributes: { "Warranty Period (Months)": "36" },
    },
    {
      assetTag: "AF-0081",
      name: "Sony Alpha A7 IV",
      categoryId: catsMap["Electronics"],
      serialNumber: "SN-SONY-773",
      acquisitionDate: "2024-02-12",
      acquisitionCost: "2500",
      condition: "Good",
      location: "Marketing Studio",
      isSharedBookable: false,
      status: "Allocated" as const,
      customAttributes: { "Warranty Period (Months)": "24" },
    },
    {
      assetTag: "AF-0062",
      name: "Epson EH-TW6250 Projector",
      categoryId: catsMap["Electronics"],
      serialNumber: "SN-EPSON-002",
      acquisitionDate: "2023-11-05",
      acquisitionCost: "800",
      condition: "Good",
      location: "Conference Room A",
      isSharedBookable: true,
      status: "Available" as const,
      customAttributes: { "Warranty Period (Months)": "12" },
    },
    {
      assetTag: "ROOM-B2",
      name: "Meeting Room B2",
      categoryId: catsMap["Shared Spaces"],
      serialNumber: "ROOM-B2",
      acquisitionDate: "2022-01-01",
      acquisitionCost: "0",
      condition: "Excellent",
      location: "Floor 1 East Wing",
      isSharedBookable: true,
      status: "Available" as const,
      customAttributes: { Capacity: "10" },
    },
    {
      assetTag: "ROOM-CONFA",
      name: "Boardroom Conference Room A",
      categoryId: catsMap["Shared Spaces"],
      serialNumber: "ROOM-CONFA",
      acquisitionDate: "2022-01-01",
      acquisitionCost: "0",
      condition: "Excellent",
      location: "Floor 2 Executive Wing",
      isSharedBookable: true,
      status: "Available" as const,
      customAttributes: { Capacity: "25" },
    },
    {
      assetTag: "AF-0220",
      name: "Company Tesla Model Y",
      categoryId: catsMap["Vehicles"],
      serialNumber: "5YJYGDED8NF000",
      acquisitionDate: "2024-05-18",
      acquisitionCost: "45000",
      condition: "Excellent",
      location: "Underground Garage",
      isSharedBookable: true,
      status: "Available" as const,
      customAttributes: { "License Plate": "DL3C-QA-9999", "Fuel Type": "Electric" },
    },
  ];

  const insertedAssets = await db.insert(schema.assets).values(assetsToInsert).returning();
  const assetsMap: Record<string, string> = {};
  insertedAssets.forEach((a) => {
    assetsMap[a.assetTag] = a.id;
  });

  // 4. Seed Allocations
  console.log("Seeding custody allocations...");
  await db.insert(schema.allocations).values([
    {
      assetId: assetsMap["AF-0114"],
      assigneeType: "User" as const,
      assigneeId: usersMap["Priya Shah"],
      assignedById: usersMap["Sarah Connor"] || usersMap["Abhinav Tyagi"],
      expectedReturnDate: "2026-07-10", // Overdue
      status: "Active" as const,
    },
    {
      assetId: assetsMap["AF-0099"],
      assigneeType: "User" as const,
      assigneeId: usersMap["Raj Malhotra"],
      assignedById: usersMap["Sarah Connor"] || usersMap["Abhinav Tyagi"],
      expectedReturnDate: "2026-07-09", // Overdue
      status: "Active" as const,
    },
    {
      assetId: assetsMap["AF-0081"],
      assigneeType: "User" as const,
      assigneeId: usersMap["Priya Sen"],
      assignedById: usersMap["Sarah Connor"] || usersMap["Abhinav Tyagi"],
      expectedReturnDate: "2026-07-05", // Overdue
      status: "Active" as const,
    },
  ]);

  // 5. Seed Bookings
  console.log("Seeding resource bookings...");
  await db.insert(schema.bookings).values([
    {
      assetId: assetsMap["ROOM-B2"],
      bookerId: usersMap["Priya Shah"],
      startTime: new Date("2026-07-12T14:00:00Z"),
      endTime: new Date("2026-07-12T15:00:00Z"),
      status: "Upcoming" as const,
    },
    {
      assetId: assetsMap["AF-0220"],
      bookerId: usersMap["Sneha Rao"],
      startTime: new Date("2026-07-13T09:00:00Z"),
      endTime: new Date("2026-07-13T17:00:00Z"),
      status: "Upcoming" as const,
    },
  ]);

  // 6. Seed Maintenance
  console.log("Seeding maintenance request...");
  await db.insert(schema.maintenanceRequests).values({
    assetId: assetsMap["AF-0062"],
    requesterId: usersMap["Raj Malhotra"],
    issueDescription: "Lamp brightness dimmed drastically, requires filter cleaning and bulb check.",
    priority: "Medium" as const,
    status: "Resolved" as const,
    assignedTechnician: "TechAssist Services",
    approvedById: usersMap["Sarah Connor"] || usersMap["Abhinav Tyagi"],
    resolvedAt: new Date("2026-07-08T16:30:00Z"),
  });

  console.log("🌱 Database seeding completed successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
