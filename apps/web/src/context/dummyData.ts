import { Department, Employee, AssetCategory, Asset, AssetAllocation, ResourceBooking, MaintenanceRequest, ActivityLog, SystemNotification, TransferRequest } from "./AppContext";

// Initial Dummy Data
export const INITIAL_DEPARTMENTS: Department[] = [
  { id: "dept-1", name: "IT Department", headId: "emp-2", status: "Active" },
  { id: "dept-2", name: "Operations", headId: "emp-3", status: "Active" },
  { id: "dept-3", name: "Marketing", headId: "emp-5", status: "Active" },
  { id: "dept-4", name: "Human Resources", headId: "emp-6", status: "Active" },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: "emp-1", name: "Abhinav Tyagi", email: "admin@assetflow.com", departmentId: "dept-2", role: "Admin", status: "Active", password: "password123" },
  { id: "emp-2", name: "Aditi Tyagi", email: "tyagiaditi027@gmail.com", departmentId: "dept-2", role: "Admin", status: "Active", password: "password123" },
  { id: "emp-3", name: "Priya Shah", email: "priya.shah@assetflow.com", departmentId: "dept-1", role: "Employee", status: "Active", password: "password123" },
  { id: "emp-4", name: "Rahul Verma", email: "rahul.v@assetflow.com", departmentId: "dept-3", role: "Department Head", status: "Active", password: "password123" },
  { id: "emp-5", name: "Sneha Reddy", email: "sneha.reddy@assetflow.com", departmentId: "dept-4", role: "Asset Manager", status: "Active", password: "password123" },
  { id: "emp-6", name: "Amit Kumar", email: "amit.k@assetflow.com", departmentId: "dept-1", role: "Employee", status: "Inactive", password: "password123" },
  { id: "emp-7", name: "Raj Malhotra", email: "raj.m@assetflow.com", departmentId: "dept-1", role: "Employee", status: "Active", password: "password123" },
  { id: "emp-8", name: "Priya Sen", email: "priya.sen@assetflow.com", departmentId: "dept-3", role: "Employee", status: "Active", password: "password123" },
  { id: "emp-9", name: "Sarah Connor", email: "sarah.connor@assetflow.com", departmentId: "dept-2", role: "Employee", status: "Active", password: "password123" },
];

export const INITIAL_CATEGORIES: AssetCategory[] = [
  {
    id: "cat-1",
    name: "Electronics",
    fields: [
      { name: "Warranty Period (Months)", type: "number", required: true },
      { name: "Model Number", type: "text", required: false },
    ],
  },
  {
    id: "cat-2",
    name: "Furniture",
    fields: [{ name: "Material", type: "text", required: false }],
  },
  {
    id: "cat-3",
    name: "Vehicles",
    fields: [
      { name: "License Plate", type: "text", required: true },
      { name: "Fuel Type", type: "text", required: false },
    ],
  },
  {
    id: "cat-4",
    name: "Shared Spaces",
    fields: [{ name: "Capacity", type: "number", required: true }],
  },
];

export const INITIAL_ASSETS: Asset[] = [
  {
    id: "AF-0114",
    name: "MacBook Pro M3",
    categoryId: "cat-1",
    serialNumber: "SN-LPT-9821",
    acquisitionDate: "2025-01-15",
    acquisitionCost: 1800,
    condition: "Excellent",
    location: "IT Storage - Floor 3",
    isSharedBookable: false,
    status: "Allocated",
    customData: { "Warranty Period (Months)": "36", "Model Number": "A2941" },
  },
  {
    id: "AF-0115",
    name: "MacBook Air M2",
    categoryId: "cat-1",
    serialNumber: "SN-LPT-9822",
    acquisitionDate: "2025-03-10",
    acquisitionCost: 1200,
    condition: "Good",
    location: "IT Storage - Floor 3",
    isSharedBookable: false,
    status: "Available",
    customData: { "Warranty Period (Months)": "12", "Model Number": "A2681" },
  },
  {
    id: "AF-0099",
    name: "Dell Latitude 5440",
    categoryId: "cat-1",
    serialNumber: "SN-DELL-552",
    acquisitionDate: "2024-06-20",
    acquisitionCost: 1000,
    condition: "Fair",
    location: "Floor 2 West Wing",
    isSharedBookable: false,
    status: "Allocated",
    customData: { "Warranty Period (Months)": "36" },
  },
  {
    id: "AF-0081",
    name: "Sony Alpha A7 IV",
    categoryId: "cat-1",
    serialNumber: "SN-SONY-773",
    acquisitionDate: "2024-02-12",
    acquisitionCost: 2500,
    condition: "Good",
    location: "Marketing Studio",
    isSharedBookable: false,
    status: "Allocated",
    customData: { "Warranty Period (Months)": "24" },
  },
  {
    id: "AF-0062",
    name: "Epson EH-TW6250 Projector",
    categoryId: "cat-1",
    serialNumber: "SN-EPSON-002",
    acquisitionDate: "2023-11-05",
    acquisitionCost: 800,
    condition: "Good",
    location: "Conference Room A",
    isSharedBookable: true,
    status: "Available",
    customData: { "Warranty Period (Months)": "12" },
  },
  {
    id: "RM-B2",
    name: "Meeting Room B2",
    categoryId: "cat-4",
    serialNumber: "ROOM-B2",
    acquisitionDate: "2022-01-01",
    acquisitionCost: 0,
    condition: "Excellent",
    location: "Floor 1 East Wing",
    isSharedBookable: true,
    status: "Available",
    customData: { Capacity: "10" },
  },
  {
    id: "RM-CONF-A",
    name: "Boardroom Conference Room A",
    categoryId: "cat-4",
    serialNumber: "ROOM-CONFA",
    acquisitionDate: "2022-01-01",
    acquisitionCost: 0,
    condition: "Excellent",
    location: "Floor 2 Executive Wing",
    isSharedBookable: true,
    status: "Available",
    customData: { Capacity: "25" },
  },
  {
    id: "AF-0220",
    name: "Company Tesla Model Y",
    categoryId: "cat-3",
    serialNumber: "5YJYGDED8NF000",
    acquisitionDate: "2024-05-18",
    acquisitionCost: 45000,
    condition: "Excellent",
    location: "Underground Garage",
    isSharedBookable: true,
    status: "Available",
    customData: { "License Plate": "DL3C-QA-9999", "Fuel Type": "Electric" },
  },
];

export const INITIAL_ALLOCATIONS: AssetAllocation[] = [
  {
    id: "alloc-1",
    assetId: "AF-0114",
    allocatedToType: "Employee",
    targetId: "emp-2", // Priya Shah
    allocationDate: "2026-06-01",
    expectedReturnDate: "2026-07-10", // Overdue!
    status: "Active",
  },
  {
    id: "alloc-2",
    assetId: "AF-0099",
    allocatedToType: "Employee",
    targetId: "emp-7", // Raj Malhotra
    allocationDate: "2026-06-10",
    expectedReturnDate: "2026-07-09", // Overdue!
    status: "Active",
  },
  {
    id: "alloc-3",
    assetId: "AF-0081",
    allocatedToType: "Employee",
    targetId: "emp-8", // Priya Sen
    allocationDate: "2026-05-15",
    expectedReturnDate: "2026-07-05", // Overdue!
    status: "Active",
  },
];

export const INITIAL_BOOKINGS: ResourceBooking[] = [
  {
    id: "book-1",
    assetId: "RM-B2",
    bookedById: "emp-2", // Priya Shah
    bookedForDepartmentId: "dept-1",
    startTime: "2026-07-12T14:00",
    endTime: "2026-07-12T15:00",
    status: "Upcoming",
  },
  {
    id: "book-2",
    assetId: "AF-0220",
    bookedById: "emp-5", // Sneha Rao
    bookedForDepartmentId: "dept-3",
    startTime: "2026-07-13T09:00",
    endTime: "2026-07-13T17:00",
    status: "Upcoming",
  },
];

export const INITIAL_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: "maint-1",
    assetId: "AF-0062",
    raisedById: "emp-7",
    description: "Lamp brightness dimmed drastically, requires filter cleaning and bulb check.",
    priority: "Medium",
    status: "Resolved",
    assignedTechnician: "TechAssist Services",
    createdAt: "2026-07-05T11:00",
  },
];

export const INITIAL_ACTIVITY: ActivityLog[] = [
  {
    id: "act-1",
    actorName: "Sarah Connor",
    action: "Asset Allocation",
    details: "Laptop AF-0114 - allocated to Priya Shah - IT Dept",
    createdAt: "2026-06-01T10:00",
  },
  {
    id: "act-2",
    actorName: "Priya Shah",
    action: "Resource Booking",
    details: "Room B2 - booking confirmed - 2:00 to 3:00 PM",
    createdAt: "2026-07-12T09:00",
  },
  {
    id: "act-3",
    actorName: "TechAssist Services",
    action: "Maintenance Resolved",
    details: "Projector AF-0062 - maintenance resolved",
    createdAt: "2026-07-08T16:30",
  },
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-1",
    title: "Overdue Return Alert",
    message: "Laptop AF-0114 allocated to Priya Shah was due back on 2026-07-10.",
    type: "warning",
    createdAt: "2026-07-11T08:00",
    read: false,
  },
  {
    id: "notif-2",
    title: "Maintenance Completed",
    message: "Maintenance request for Projector AF-0062 has been resolved.",
    type: "success",
    createdAt: "2026-07-08T16:30",
    read: true,
  },
];

export const INITIAL_TRANSFERS: TransferRequest[] = [
  {
    id: "trans-1",
    assetId: "AF-0114",
    fromType: "Employee",
    fromId: "emp-2", // Priya Shah
    toType: "Employee",
    toId: "emp-9", // Let's pretend Sarah Connor is emp-9, or just any ID
    requestedById: "emp-1",
    status: "Pending",
    createdAt: "2026-07-12T10:00:00Z"
  }
];
