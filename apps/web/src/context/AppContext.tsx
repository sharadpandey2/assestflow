"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "Admin" | "Asset Manager" | "Department Head" | "Employee";

export interface Employee {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  role: Role;
  status: "Active" | "Inactive";
}

export interface Department {
  id: string;
  name: string;
  headId: string; // Employee ID
  parentDepartmentId?: string; // For hierarchy
  status: "Active" | "Inactive";
}

export interface AssetCategory {
  id: string;
  name: string;
  fields: { name: string; type: string; required: boolean }[]; // category-specific fields
}

export type AssetStatus =
  | "Available"
  | "Allocated"
  | "Reserved"
  | "Under Maintenance"
  | "Lost"
  | "Retired"
  | "Disposed";

export interface Asset {
  id: string; // e.g., "AF-0001"
  name: string;
  categoryId: string;
  serialNumber: string;
  acquisitionDate: string;
  acquisitionCost: number;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  location: string;
  photoUrl?: string;
  isSharedBookable: boolean;
  status: AssetStatus;
  customData: Record<string, string>; // Category specific inputs
}

export interface AssetAllocation {
  id: string;
  assetId: string;
  allocatedToType: "Employee" | "Department";
  targetId: string; // Employee ID or Department ID
  allocationDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  conditionOnReturn?: string;
  returnNotes?: string;
  status: "Active" | "Returned" | "Transferred";
}

export interface TransferRequest {
  id: string;
  assetId: string;
  fromType: "Employee" | "Department";
  fromId: string;
  toType: "Employee" | "Department";
  toId: string; // Destination Employee/Department ID
  requestedById: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

export interface ResourceBooking {
  id: string;
  assetId: string; // The bookable resource
  bookedById: string;
  bookedForDepartmentId?: string;
  startTime: string; // ISO string or datetime local
  endTime: string; // ISO string or datetime local
  status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
}

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  raisedById: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  photoUrl?: string;
  status: "Pending" | "Approved" | "Rejected" | "Technician Assigned" | "In Progress" | "Resolved";
  assignedTechnician?: string;
  createdAt: string;
}

export interface AuditCycle {
  id: string;
  name: string;
  scopeType: "Department" | "Location" | "Global";
  scopeValue: string; // Department ID or Location string
  startDate: string;
  endDate: string;
  status: "Active" | "Closed";
  auditorIds: string[]; // Assigned auditor employee IDs
  records: Record<string, { status: "Verified" | "Missing" | "Damaged"; notes: string; auditedAt: string; auditedBy: string }>; // assetId -> audit details
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  createdAt: string;
  read: boolean;
}

export interface ActivityLog {
  id: string;
  actorName: string;
  action: string;
  details: string;
  createdAt: string;
}

interface AppContextType {
  currentUser: Employee;
  setCurrentUser: (emp: Employee) => void;
  employees: Employee[];
  departments: Department[];
  categories: AssetCategory[];
  assets: Asset[];
  allocations: AssetAllocation[];
  transferRequests: TransferRequest[];
  bookings: ResourceBooking[];
  maintenanceRequests: MaintenanceRequest[];
  auditCycles: AuditCycle[];
  notifications: SystemNotification[];
  activityLogs: ActivityLog[];

  // Actions
  addDepartment: (dept: Omit<Department, "id">) => void;
  editDepartment: (id: string, dept: Partial<Department>) => void;
  addCategory: (cat: Omit<AssetCategory, "id">) => void;
  editCategory: (id: string, cat: Partial<AssetCategory>) => void;
  addEmployee: (emp: Omit<Employee, "id">) => void;
  editEmployee: (id: string, emp: Partial<Employee>) => void;
  promoteEmployee: (id: string, role: Role) => void;
  registerAsset: (asset: Omit<Asset, "id" | "status">) => void;
  editAsset: (id: string, asset: Partial<Asset>) => void;
  allocateAsset: (assetId: string, type: "Employee" | "Department", targetId: string, expectedReturnDate?: string) => { success: boolean; error?: string };
  requestTransfer: (assetId: string, toType: "Employee" | "Department", toId: string) => void;
  approveTransfer: (transferId: string) => void;
  rejectTransfer: (transferId: string) => void;
  returnAsset: (allocationId: string, condition: string, notes: string) => void;
  createBooking: (booking: Omit<ResourceBooking, "id" | "status">) => { success: boolean; error?: string };
  cancelBooking: (bookingId: string) => void;
  raiseMaintenance: (request: Omit<MaintenanceRequest, "id" | "status" | "createdAt">) => void;
  updateMaintenanceStatus: (requestId: string, status: MaintenanceRequest["status"], technician?: string) => void;
  createAuditCycle: (audit: Omit<AuditCycle, "id" | "status" | "records">) => void;
  submitAuditRecord: (cycleId: string, assetId: string, status: "Verified" | "Missing" | "Damaged", notes: string) => void;
  closeAuditCycle: (cycleId: string) => void;
  addNotification: (title: string, message: string, type: SystemNotification["type"]) => void;
  markNotificationsRead: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Dummy Data
const INITIAL_DEPARTMENTS: Department[] = [
  { id: "dept-1", name: "IT Department", headId: "emp-2", status: "Active" },
  { id: "dept-2", name: "Operations", headId: "emp-3", status: "Active" },
  { id: "dept-3", name: "Marketing", headId: "emp-5", status: "Active" },
  { id: "dept-4", name: "Human Resources", headId: "emp-6", status: "Active" },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: "emp-1", name: "Abhinav Tyagi", email: "admin@assetflow.com", departmentId: "dept-2", role: "Admin", status: "Active" },
  { id: "emp-2", name: "Priya Shah", email: "priya.shah@assetflow.com", departmentId: "dept-1", role: "Department Head", status: "Active" },
  { id: "emp-3", name: "Raj Patel", email: "raj.patel@assetflow.com", departmentId: "dept-2", role: "Department Head", status: "Active" },
  { id: "emp-4", name: "Sarah Connor", email: "sarah.c@assetflow.com", departmentId: "dept-2", role: "Asset Manager", status: "Active" },
  { id: "emp-5", name: "Sneha Rao", email: "sneha.rao@assetflow.com", departmentId: "dept-3", role: "Department Head", status: "Active" },
  { id: "emp-6", name: "Amit Verma", email: "amit.verma@assetflow.com", departmentId: "dept-4", role: "Department Head", status: "Active" },
  { id: "emp-7", name: "Raj Malhotra", email: "raj.m@assetflow.com", departmentId: "dept-1", role: "Employee", status: "Active" },
  { id: "emp-8", name: "Priya Sen", email: "priya.sen@assetflow.com", departmentId: "dept-3", role: "Employee", status: "Active" },
];

const INITIAL_CATEGORIES: AssetCategory[] = [
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

const INITIAL_ASSETS: Asset[] = [
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

const INITIAL_ALLOCATIONS: AssetAllocation[] = [
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

const INITIAL_BOOKINGS: ResourceBooking[] = [
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

const INITIAL_MAINTENANCE: MaintenanceRequest[] = [
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

const INITIAL_ACTIVITY: ActivityLog[] = [
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

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
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

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Employee>(INITIAL_EMPLOYEES[0]); // Default: Abhinav Tyagi (Admin)
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [categories, setCategories] = useState<AssetCategory[]>(INITIAL_CATEGORIES);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [allocations, setAllocations] = useState<AssetAllocation[]>(INITIAL_ALLOCATIONS);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [bookings, setBookings] = useState<ResourceBooking[]>(INITIAL_BOOKINGS);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(INITIAL_MAINTENANCE);
  const [auditCycles, setAuditCycles] = useState<AuditCycle[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY);

  // Load from localStorage on mount
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("af_user");
      const storedEmployees = localStorage.getItem("af_employees");
      const storedDepts = localStorage.getItem("af_departments");
      const storedCats = localStorage.getItem("af_categories");
      const storedAssets = localStorage.getItem("af_assets");
      const storedAllocs = localStorage.getItem("af_allocations");
      const storedTransfers = localStorage.getItem("af_transfers");
      const storedBookings = localStorage.getItem("af_bookings");
      const storedMaint = localStorage.getItem("af_maintenance");
      const storedAudits = localStorage.getItem("af_audits");
      const storedNotifs = localStorage.getItem("af_notifications");
      const storedLogs = localStorage.getItem("af_logs");

      if (storedUser) setCurrentUser(JSON.parse(storedUser));
      if (storedEmployees) setEmployees(JSON.parse(storedEmployees));
      if (storedDepts) setDepartments(JSON.parse(storedDepts));
      if (storedCats) setCategories(JSON.parse(storedCats));
      if (storedAssets) setAssets(JSON.parse(storedAssets));
      if (storedAllocs) setAllocations(JSON.parse(storedAllocs));
      if (storedTransfers) setTransferRequests(JSON.parse(storedTransfers));
      if (storedBookings) setBookings(JSON.parse(storedBookings));
      if (storedMaint) setMaintenanceRequests(JSON.parse(storedMaint));
      if (storedAudits) setAuditCycles(JSON.parse(storedAudits));
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
      if (storedLogs) setActivityLogs(JSON.parse(storedLogs));
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Save changes to localStorage
  const saveState = (key: string, val: unknown) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(val));
    }
  };

  const handleSetCurrentUser = (user: Employee) => {
    setCurrentUser(user);
    saveState("af_user", user);
  };

  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      actorName: currentUser.name,
      action,
      details,
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => {
      const updated = [newLog, ...prev];
      saveState("af_logs", updated);
      return updated;
    });
  };

  const addNotification = (title: string, message: string, type: SystemNotification["type"]) => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      saveState("af_notifications", updated);
      return updated;
    });
  };

  // ----------------------------------------------------
  // Department Management
  // ----------------------------------------------------
  const addDepartment = (dept: Omit<Department, "id">) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
    };
    setDepartments((prev) => {
      const updated = [...prev, newDept];
      saveState("af_departments", updated);
      return updated;
    });
    logActivity("Create Department", `Created department "${newDept.name}"`);
  };

  const editDepartment = (id: string, data: Partial<Department>) => {
    setDepartments((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, ...data } : d));
      saveState("af_departments", updated);
      return updated;
    });
    logActivity("Edit Department", `Modified department settings for ID ${id}`);
  };

  // ----------------------------------------------------
  // Category Management
  // ----------------------------------------------------
  const addCategory = (cat: Omit<AssetCategory, "id">) => {
    const newCat: AssetCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => {
      const updated = [...prev, newCat];
      saveState("af_categories", updated);
      return updated;
    });
    logActivity("Create Category", `Created category "${newCat.name}"`);
  };

  const editCategory = (id: string, data: Partial<AssetCategory>) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...data } : c));
      saveState("af_categories", updated);
      return updated;
    });
    logActivity("Edit Category", `Modified category settings for ID ${id}`);
  };

  // ----------------------------------------------------
  // Employee Directory
  // ----------------------------------------------------
  const addEmployee = (emp: Omit<Employee, "id">) => {
    const newEmp: Employee = {
      ...emp,
      id: `emp-${Date.now()}`,
    };
    setEmployees((prev) => {
      const updated = [...prev, newEmp];
      saveState("af_employees", updated);
      return updated;
    });
    logActivity("Add Employee", `Registered new employee "${newEmp.name}" (${newEmp.email})`);
  };

  const editEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...data } : e));
      saveState("af_employees", updated);
      return updated;
    });
    logActivity("Edit Employee", `Modified employee settings for ID ${id}`);
  };

  const promoteEmployee = (id: string, role: Role) => {
    setEmployees((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, role } : e));
      saveState("af_employees", updated);
      return updated;
    });
    logActivity("Promote Employee", `Promoted employee ID ${id} to ${role}`);
    addNotification("User Role Promoted", `Employee ID ${id} is now promoted to ${role}`, "info");
  };

  // ----------------------------------------------------
  // Asset Management
  // ----------------------------------------------------
  const registerAsset = (assetData: Omit<Asset, "id" | "status">) => {
    // Generate simple tag: AF-0XXXX
    const nextNum = assets.length + 120; // offset to make it look realistic
    const nextTag = `AF-0${nextNum}`;
    const newAsset: Asset = {
      ...assetData,
      id: nextTag,
      status: "Available",
    };
    setAssets((prev) => {
      const updated = [...prev, newAsset];
      saveState("af_assets", updated);
      return updated;
    });
    logActivity("Register Asset", `Registered asset ${newAsset.id} - ${newAsset.name}`);
  };

  const editAsset = (id: string, data: Partial<Asset>) => {
    setAssets((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...data } : a));
      saveState("af_assets", updated);
      return updated;
    });
  };

  // ----------------------------------------------------
  // Allocation & Conflict Logic
  // ----------------------------------------------------
  const allocateAsset = (
    assetId: string,
    type: "Employee" | "Department",
    targetId: string,
    expectedReturnDate?: string
  ): { success: boolean; error?: string } => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return { success: false, error: "Asset not found." };

    // Check conflict: Cannot allocate if status is not Available
    if (asset.status !== "Available") {
      // Find current holder
      const activeAlloc = allocations.find((al) => al.assetId === assetId && al.status === "Active");
      let holderName = "another user/department";
      if (activeAlloc) {
        if (activeAlloc.allocatedToType === "Employee") {
          holderName = employees.find((e) => e.id === activeAlloc.targetId)?.name || holderName;
        } else {
          holderName = departments.find((d) => d.id === activeAlloc.targetId)?.name || holderName;
        }
      }
      return {
        success: false,
        error: `Conflict: This asset is currently held by "${holderName}". Please request a Transfer instead.`,
      };
    }

    const newAlloc: AssetAllocation = {
      id: `alloc-${Date.now()}`,
      assetId,
      allocatedToType: type,
      targetId,
      allocationDate: new Date().toISOString().split("T")[0],
      expectedReturnDate,
      status: "Active",
    };

    setAllocations((prev) => {
      const updated = [...prev, newAlloc];
      saveState("af_allocations", updated);
      return updated;
    });

    // Update Asset Status to Allocated
    setAssets((prev) => {
      const updated = prev.map((a) => (a.id === assetId ? { ...a, status: "Allocated" as const } : a));
      saveState("af_assets", updated);
      return updated;
    });

    const targetName =
      type === "Employee"
        ? employees.find((e) => e.id === targetId)?.name
        : departments.find((d) => d.id === targetId)?.name;

    logActivity("Asset Allocation", `Allocated ${assetId} (${asset.name}) to ${type} "${targetName}"`);
    addNotification("Asset Assigned", `Asset ${assetId} has been successfully assigned to ${targetName}.`, "success");

    return { success: true };
  };

  const requestTransfer = (assetId: string, toType: "Employee" | "Department", toId: string) => {
    const activeAlloc = allocations.find((al) => al.assetId === assetId && al.status === "Active");
    if (!activeAlloc) return;

    const newReq: TransferRequest = {
      id: `trans-${Date.now()}`,
      assetId,
      fromType: activeAlloc.allocatedToType,
      fromId: activeAlloc.targetId,
      toType,
      toId,
      requestedById: currentUser.id,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    setTransferRequests((prev) => {
      const updated = [...prev, newReq];
      saveState("af_transfers", updated);
      return updated;
    });

    const assetName = assets.find((a) => a.id === assetId)?.name || assetId;
    logActivity("Transfer Requested", `Requested transfer for asset "${assetName}" to ${toType}`);
    addNotification("Transfer Request Submitted", `Transfer request submitted for ${assetName}.`, "info");
  };

  const approveTransfer = (transferId: string) => {
    const req = transferRequests.find((t) => t.id === transferId);
    if (!req) return;

    // Mark request approved
    setTransferRequests((prev) => {
      const updated = prev.map((t) => (t.id === transferId ? { ...t, status: "Approved" as const } : t));
      saveState("af_transfers", updated);
      return updated;
    });

    // Terminate old allocation
    setAllocations((prev) => {
      const updated = prev.map((al) =>
        al.assetId === req.assetId && al.status === "Active"
          ? { ...al, status: "Returned" as const, actualReturnDate: new Date().toISOString().split("T")[0] }
          : al
      );
      return updated;
    });

    // Create new allocation
    const newAlloc: AssetAllocation = {
      id: `alloc-${Date.now()}`,
      assetId: req.assetId,
      allocatedToType: req.toType,
      targetId: req.toId,
      allocationDate: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    setAllocations((prev) => {
      const updated = [...prev, newAlloc];
      saveState("af_allocations", updated);
      return updated;
    });

    const assetName = assets.find((a) => a.id === req.assetId)?.name || req.assetId;
    const destName =
      req.toType === "Employee"
        ? employees.find((e) => e.id === req.toId)?.name
        : departments.find((d) => d.id === req.toId)?.name;

    logActivity("Transfer Approved", `Approved transfer of ${req.assetId} to ${destName}`);
    addNotification("Transfer Approved", `Asset ${assetName} transfer approved and reallocated to ${destName}.`, "success");
  };

  const rejectTransfer = (transferId: string) => {
    setTransferRequests((prev) => {
      const updated = prev.map((t) => (t.id === transferId ? { ...t, status: "Rejected" as const } : t));
      saveState("af_transfers", updated);
      return updated;
    });
    logActivity("Transfer Rejected", `Rejected transfer request ${transferId}`);
  };

  const returnAsset = (allocationId: string, condition: string, notes: string) => {
    const alloc = allocations.find((al) => al.id === allocationId);
    if (!alloc) return;

    // Terminate allocation
    setAllocations((prev) => {
      const updated = prev.map((al) =>
        al.id === allocationId
          ? {
              ...al,
              status: "Returned" as const,
              actualReturnDate: new Date().toISOString().split("T")[0],
              conditionOnReturn: condition,
              returnNotes: notes,
            }
          : al
      );
      saveState("af_allocations", updated);
      return updated;
    });

    // Revert Asset to Available and update condition
    setAssets((prev) => {
      const updated = prev.map((a) =>
        a.id === alloc.assetId
          ? { ...a, status: "Available" as const, condition: condition as "Excellent" | "Good" | "Fair" | "Poor" }
          : a
      );
      saveState("af_assets", updated);
      return updated;
    });

    logActivity("Asset Returned", `Asset ${alloc.assetId} returned. Condition: ${condition}`);
    addNotification("Asset Returned", `Asset ${alloc.assetId} is back in inventory as Available.`, "success");
  };

  // ----------------------------------------------------
  // Shared Resource Booking & Overlap Check
  // ----------------------------------------------------
  const createBooking = (bookingData: Omit<ResourceBooking, "id" | "status">): { success: boolean; error?: string } => {
    const start = new Date(bookingData.startTime);
    const end = new Date(bookingData.endTime);

    // Overlap validation
    const hasOverlap = bookings.some((b) => {
      if (b.assetId !== bookingData.assetId || b.status === "Cancelled") return false;
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return start < bEnd && end > bStart;
    });

    if (hasOverlap) {
      return {
        success: false,
        error: "Conflict: This resource is already booked during the selected time slot.",
      };
    }

    const newBooking: ResourceBooking = {
      ...bookingData,
      id: `book-${Date.now()}`,
      status: "Upcoming",
    };

    setBookings((prev) => {
      const updated = [...prev, newBooking];
      saveState("af_bookings", updated);
      return updated;
    });

    const resName = assets.find((a) => a.id === bookingData.assetId)?.name || bookingData.assetId;
    logActivity("Resource Booked", `Booked "${resName}" from ${bookingData.startTime} to ${bookingData.endTime}`);
    addNotification("Booking Confirmed", `Reservation confirmed for ${resName}.`, "success");

    return { success: true };
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) => {
      const updated = prev.map((b) => (b.id === bookingId ? { ...b, status: "Cancelled" as const } : b));
      saveState("af_bookings", updated);
      return updated;
    });
    logActivity("Booking Cancelled", `Cancelled booking ID ${bookingId}`);
  };

  // ----------------------------------------------------
  // Maintenance requests
  // ----------------------------------------------------
  const raiseMaintenance = (maintData: Omit<MaintenanceRequest, "id" | "status" | "createdAt">) => {
    const newReq: MaintenanceRequest = {
      ...maintData,
      id: `maint-${Date.now()}`,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    setMaintenanceRequests((prev) => {
      const updated = [newReq, ...prev];
      saveState("af_maintenance", updated);
      return updated;
    });

    const assetName = assets.find((a) => a.id === maintData.assetId)?.name || maintData.assetId;
    logActivity("Maintenance Raised", `Requested repairs for ${maintData.assetId} - Priority: ${maintData.priority}`);
    addNotification("Maintenance Request Raised", `Issue reported for ${assetName}. Pending approval.`, "info");
  };

  const updateMaintenanceStatus = (requestId: string, status: MaintenanceRequest["status"], technician?: string) => {
    let affectedAssetId = "";

    setMaintenanceRequests((prev) => {
      const updated = prev.map((req) => {
        if (req.id === requestId) {
          affectedAssetId = req.assetId;
          return {
            ...req,
            status,
            ...(technician ? { assignedTechnician: technician } : {}),
          };
        }
        return req;
      });
      saveState("af_maintenance", updated);
      return updated;
    });

    // Handle automated Asset status updates
    if (affectedAssetId) {
      if (status === "Approved") {
        setAssets((prev) => {
          const updated = prev.map((a) =>
            a.id === affectedAssetId ? { ...a, status: "Under Maintenance" as const } : a
          );
          saveState("af_assets", updated);
          return updated;
        });
      } else if (status === "Resolved") {
        setAssets((prev) => {
          const updated = prev.map((a) =>
            a.id === affectedAssetId ? { ...a, status: "Available" as const } : a
          );
          saveState("af_assets", updated);
          return updated;
        });
      }
    }

    logActivity("Maintenance Updated", `Request ${requestId} status updated to ${status}`);
    addNotification("Maintenance Request Update", `Repair request status updated to ${status}.`, "info");
  };

  // ----------------------------------------------------
  // Audit Verification Cycles
  // ----------------------------------------------------
  const createAuditCycle = (auditData: Omit<AuditCycle, "id" | "status" | "records">) => {
    const newCycle: AuditCycle = {
      ...auditData,
      id: `audit-${Date.now()}`,
      status: "Active",
      records: {},
    };

    setAuditCycles((prev) => {
      const updated = [newCycle, ...prev];
      saveState("af_audits", updated);
      return updated;
    });

    logActivity("Audit Cycle Started", `Launched audit cycle: "${auditData.name}"`);
    addNotification("Audit Cycle Initiated", `Audit "${auditData.name}" is now live.`, "info");
  };

  const submitAuditRecord = (
    cycleId: string,
    assetId: string,
    verification: "Verified" | "Missing" | "Damaged",
    notes: string
  ) => {
    setAuditCycles((prev) => {
      const updated = prev.map((cycle) => {
        if (cycle.id === cycleId) {
          const updatedRecords = {
            ...cycle.records,
            [assetId]: {
              status: verification,
              notes,
              auditedAt: new Date().toISOString(),
              auditedBy: currentUser.name,
            },
          };
          return { ...cycle, records: updatedRecords };
        }
        return cycle;
      });
      saveState("af_audits", updated);
      return updated;
    });

    if (verification === "Missing" || verification === "Damaged") {
      addNotification("Audit Discrepancy Flagged", `Asset ${assetId} flagged as ${verification} during audit.`, "warning");
    }
  };

  const closeAuditCycle = (cycleId: string) => {
    let cycle: AuditCycle | undefined;

    setAuditCycles((prev) => {
      const updated = prev.map((c) => {
        if (c.id === cycleId) {
          cycle = c;
          return { ...c, status: "Closed" as const };
        }
        return c;
      });
      saveState("af_audits", updated);
      return updated;
    });

    if (!cycle) return;

    const missingAssetIds = Object.keys(cycle.records).filter((id) => cycle!.records[id].status === "Missing");
    const damagedAssetIds = Object.keys(cycle.records).filter((id) => cycle!.records[id].status === "Damaged");

    if (missingAssetIds.length > 0) {
      setAssets((prev) => {
        const updated = prev.map((a) => (missingAssetIds.includes(a.id) ? { ...a, status: "Lost" as const } : a));
        saveState("af_assets", updated);
        return updated;
      });
    }

    damagedAssetIds.forEach((id) => {
      const record = cycle!.records[id];
      raiseMaintenance({
        assetId: id,
        raisedById: currentUser.id,
        description: `Flagged as Damaged during Audit: "${cycle!.name}". Notes: ${record.notes}`,
        priority: "High",
      });
    });

    logActivity("Audit Cycle Closed", `Locked audit cycle "${cycle.name}" and reconciled statuses.`);
    addNotification("Audit Cycle Closed", `Audit "${cycle.name}" closed. Missing assets marked as Lost.`, "success");
  };

  const markNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveState("af_notifications", updated);
      return updated;
    });
  };

  const resetAllData = () => {
    setCurrentUser(INITIAL_EMPLOYEES[0]);
    setEmployees(INITIAL_EMPLOYEES);
    setDepartments(INITIAL_DEPARTMENTS);
    setCategories(INITIAL_CATEGORIES);
    setAssets(INITIAL_ASSETS);
    setAllocations(INITIAL_ALLOCATIONS);
    setTransferRequests([]);
    setBookings(INITIAL_BOOKINGS);
    setMaintenanceRequests(INITIAL_MAINTENANCE);
    setAuditCycles([]);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActivityLogs(INITIAL_ACTIVITY);

    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    logActivity("Reset System", "Cleared simulated runtime and restored defaults.");
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        employees,
        departments,
        categories,
        assets,
        allocations,
        transferRequests,
        bookings,
        maintenanceRequests,
        auditCycles,
        notifications,
        activityLogs,

        addDepartment,
        editDepartment,
        addCategory,
        editCategory,
        addEmployee,
        editEmployee,
        promoteEmployee,
        registerAsset,
        editAsset,
        allocateAsset,
        requestTransfer,
        approveTransfer,
        rejectTransfer,
        returnAsset,
        createBooking,
        cancelBooking,
        raiseMaintenance,
        updateMaintenanceStatus,
        createAuditCycle,
        submitAuditRecord,
        closeAuditCycle,
        addNotification,
        markNotificationsRead,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppContextProvider");
  return context;
};
