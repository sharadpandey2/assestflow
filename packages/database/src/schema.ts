import { pgTable, text, timestamp, boolean, decimal, date, uuid, jsonb, pgEnum, primaryKey } from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum('role', ['Employee', 'Department Head', 'Asset Manager', 'Admin']);
export const statusEnum = pgEnum('status', ['Active', 'Inactive']);
export const assetStatusEnum = pgEnum('asset_status', ['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed']);
export const assigneeTypeEnum = pgEnum('assignee_type', ['User', 'Department']);
export const allocationStatusEnum = pgEnum('allocation_status', ['Active', 'Returned', 'Overdue']);
export const transferStatusEnum = pgEnum('transfer_status', ['Requested', 'Approved', 'Rejected']);
export const bookingStatusEnum = pgEnum('booking_status', ['Upcoming', 'Ongoing', 'Completed', 'Cancelled']);
export const priorityEnum = pgEnum('priority', ['Low', 'Medium', 'High']);
export const maintenanceStatusEnum = pgEnum('maintenance_status', ['Pending', 'Approved', 'Rejected', 'In Progress', 'Resolved']);
export const scopeTypeEnum = pgEnum('scope_type', ['Department', 'Location', 'All']);
export const auditStatusEnum = pgEnum('audit_status', ['Open', 'Closed']);
export const auditRecordStatusEnum = pgEnum('audit_record_status', ['Verified', 'Missing', 'Damaged']);

// Tables
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").default('Employee').notNull(),
  departmentId: uuid("department_id"), // self-reference to departments added logically
  status: statusEnum("status").default('Active').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const departments = pgTable("departments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  headId: uuid("head_id").references(() => users.id),
  parentDepartmentId: uuid("parent_department_id"), // self-reference
  status: statusEnum("status").default('Active').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  customFieldsSchema: jsonb("custom_fields_schema"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetTag: text("asset_tag").notNull().unique(),
  name: text("name").notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  serialNumber: text("serial_number"),
  acquisitionDate: date("acquisition_date"),
  acquisitionCost: decimal("acquisition_cost"),
  condition: text("condition").notNull(),
  location: text("location").notNull(),
  photoUrl: text("photo_url"),
  isSharedBookable: boolean("is_shared_bookable").default(false).notNull(),
  status: assetStatusEnum("status").default('Available').notNull(),
  customAttributes: jsonb("custom_attributes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const allocations = pgTable("allocations", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").references(() => assets.id).notNull(),
  assigneeType: assigneeTypeEnum("assignee_type").notNull(),
  assigneeId: uuid("assignee_id").notNull(),
  assignedById: uuid("assigned_by_id").references(() => users.id).notNull(),
  expectedReturnDate: date("expected_return_date"),
  returnedAt: timestamp("returned_at"),
  returnConditionNotes: text("return_condition_notes"),
  status: allocationStatusEnum("status").default('Active').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transferRequests = pgTable("transfer_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").references(() => assets.id).notNull(),
  requesterId: uuid("requester_id").references(() => users.id).notNull(),
  currentHolderId: uuid("current_holder_id").references(() => users.id).notNull(),
  status: transferStatusEnum("status").default('Requested').notNull(),
  approvedById: uuid("approved_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").references(() => assets.id).notNull(),
  bookerId: uuid("booker_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: bookingStatusEnum("status").default('Upcoming').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const maintenanceRequests = pgTable("maintenance_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").references(() => assets.id).notNull(),
  requesterId: uuid("requester_id").references(() => users.id).notNull(),
  issueDescription: text("issue_description").notNull(),
  priority: priorityEnum("priority").default('Medium').notNull(),
  photoUrl: text("photo_url"),
  status: maintenanceStatusEnum("status").default('Pending').notNull(),
  assignedTechnician: text("assigned_technician"),
  approvedById: uuid("approved_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const auditCycles = pgTable("audit_cycles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  scopeType: scopeTypeEnum("scope_type").notNull(),
  scopeId: text("scope_id"), 
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: auditStatusEnum("status").default('Open').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditAuditors = pgTable("audit_auditors", {
  auditCycleId: uuid("audit_cycle_id").references(() => auditCycles.id).notNull(),
  auditorId: uuid("auditor_id").references(() => users.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.auditCycleId, t.auditorId] })
}));

export const auditRecords = pgTable("audit_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  auditCycleId: uuid("audit_cycle_id").references(() => auditCycles.id).notNull(),
  assetId: uuid("asset_id").references(() => assets.id).notNull(),
  auditorId: uuid("auditor_id").references(() => users.id).notNull(),
  status: auditRecordStatusEnum("status").notNull(),
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
