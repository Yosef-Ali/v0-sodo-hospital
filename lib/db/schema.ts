import { pgTable, text, timestamp, uuid, pgEnum, jsonb, integer, varchar, boolean } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Enums
export const taskStatusEnum = pgEnum("task_status", ["pending", "in-progress", "completed", "urgent"])
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high"])
export const documentStatusEnum = pgEnum("document_status", ["pending", "approved", "review"])
export const userRoleEnum = pgEnum("user_role", ["ADMIN", "HR_MANAGER", "HR", "LOGISTICS", "FINANCE", "USER"])
export const permitCategoryEnum = pgEnum("permit_category", ["WORK_PERMIT", "RESIDENCE_ID", "MEDICAL_LICENSE", "PIP", "CUSTOMS", "CAR_BOLO_INSURANCE"])
export const workPermitSubTypeEnum = pgEnum("work_permit_sub_type", ["NEW", "RENEWAL", "OTHER"])
export const genderEnum = pgEnum("gender", ["MALE", "FEMALE"])
export const familyStatusEnum = pgEnum("family_status", ["MARRIED", "UNMARRIED"])
export const permitStatusEnum = pgEnum("permit_status", ["PENDING", "SUBMITTED", "APPROVED", "REJECTED", "EXPIRED"])
export const permitStageEnum = pgEnum("permit_stage", ["SUPPORT_LETTER", "DOCUMENT_ARRANGEMENT", "APPLY_ONLINE", "SUBMIT_DOCUMENT", "PAYMENT", "PICK_ID", "COMPLETED"])
export const eventTypeEnum = pgEnum("event_type", ["permit", "deadline", "meeting", "interview", "other"])
export const reportStatusEnum = pgEnum("report_status", ["DRAFT", "GENERATED", "PUBLISHED", "ARCHIVED"])
export const reportFrequencyEnum = pgEnum("report_frequency", ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY", "ON_DEMAND"])
export const reportFormatEnum = pgEnum("report_format", ["PDF", "EXCEL", "CSV", "DASHBOARD"])
export const complaintStatusEnum = pgEnum("complaint_status", ["OPEN", "IN_REVIEW", "RESOLVED", "CLOSED"])
export const complaintCategoryEnum = pgEnum("complaint_category", ["SERVICE", "PROCESSING_DELAY", "DOCUMENT_ISSUE", "STAFF_BEHAVIOR", "OTHER"])
export const testimonialStatusEnum = pgEnum("testimonial_status", ["PENDING", "APPROVED", "PUBLISHED", "ARCHIVED"])

// Users table (minimal - main auth handled by Stack Auth)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  stackAuthId: varchar("stack_auth_id", { length: 255 }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  password: varchar("password", { length: 255 }), // bcrypt hashed for email/password auth
  role: userRoleEnum("role").default("USER").notNull(),
  locale: varchar("locale", { length: 10 }).default("en"), // for i18n preference
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Departments table
export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  headId: uuid("head_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Teams table
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  departmentId: uuid("department_id").references(() => departments.id),
  leaderId: uuid("leader_id").references(() => users.id),
  memberCount: integer("member_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Categories table
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // 'task' or 'document'
  color: varchar("color", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Tasks table
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("pending").notNull(),
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  dueDate: timestamp("due_date"),
  assigneeId: uuid("assignee_id").references(() => users.id),
  categoryId: uuid("category_id").references(() => categories.id),
  departmentId: uuid("department_id").references(() => departments.id),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
})

// Documents table
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: documentStatusEnum("status").default("pending").notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  fileType: varchar("file_type", { length: 50 }),
  fileSize: varchar("file_size", { length: 50 }),
  fileUrl: text("file_url"),
  ownerId: uuid("owner_id").references(() => users.id),
  departmentId: uuid("department_id").references(() => departments.id),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(), // 'created', 'updated', 'deleted', 'approved', etc.
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'task', 'document', etc.
  entityId: uuid("entity_id").notNull(),
  details: jsonb("details").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Comments table
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  authorId: uuid("author_id").references(() => users.id),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'task' or 'document'
  entityId: uuid("entity_id").notNull(),
  parentId: uuid("parent_id").references((): any => comments.id), // for nested comments
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Team members junction table
export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").references(() => teams.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 100 }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
})

// ============ MVP ENTITIES ============

// People table (hospital staff, patients, dependents)
export const people = pgTable("people", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketNumber: varchar("ticket_number", { length: 50 }).unique(), // Unique Foreigner ID (e.g., FOR-001)
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  nationality: varchar("nationality", { length: 100 }),
  dateOfBirth: timestamp("date_of_birth"),
  gender: genderEnum("gender"),
  familyStatus: familyStatusEnum("family_status"),

  // Profile photo
  photoUrl: text("photo_url"),

  // Passport details
  passportNo: varchar("passport_no", { length: 100 }),
  passportIssueDate: timestamp("passport_issue_date"),
  passportExpiryDate: timestamp("passport_expiry_date"),
  passportDocuments: jsonb("passport_documents").$type<string[]>().default([]),

  // Medical License details
  medicalLicenseNo: varchar("medical_license_no", { length: 100 }),
  medicalLicenseIssueDate: timestamp("medical_license_issue_date"),
  medicalLicenseExpiryDate: timestamp("medical_license_expiry_date"),
  medicalLicenseDocuments: jsonb("medical_license_documents").$type<string[]>().default([]),

  // Work Permit details
  workPermitNo: varchar("work_permit_no", { length: 100 }),
  workPermitSubType: workPermitSubTypeEnum("work_permit_sub_type"), // NEW, RENEWAL, OTHER
  workPermitIssueDate: timestamp("work_permit_issue_date"),
  workPermitExpiryDate: timestamp("work_permit_expiry_date"),
  workPermitDocuments: jsonb("work_permit_documents").$type<string[]>().default([]),

  // Residence ID details
  residenceIdNo: varchar("residence_id_no", { length: 100 }),
  residenceIdIssueDate: timestamp("residence_id_issue_date"),
  residenceIdExpiryDate: timestamp("residence_id_expiry_date"),
  residenceIdDocuments: jsonb("residence_id_documents").$type<string[]>().default([]),

  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  familyDetails: jsonb("family_details").$type<{
    spouseName?: string;
    spousePhone?: string;
    children?: { name: string; age?: string; gender?: string }[];
  }>().default({}),
  guardianId: uuid("guardian_id").references((): any => people.id), // self-reference for dependents
  documentSections: jsonb("document_sections").$type<any[]>().default([]),

  // Permit workflow tracking (v2 redesign)
  permitType: permitCategoryEnum("permit_type"), // WORK_PERMIT, RESIDENCE_ID, MEDICAL_LICENSE
  applicationType: workPermitSubTypeEnum("application_type"), // NEW, RENEWAL
  currentStage: permitStageEnum("current_stage").default("SUPPORT_LETTER"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Permits table (work permits, residence, licenses, etc)
export const permits = pgTable("permits", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketNumber: varchar("ticket_number", { length: 100 }).unique(), // e.g. WRK-2025-0001
  category: permitCategoryEnum("category").notNull(),
  subType: workPermitSubTypeEnum("sub_type"), // For work permits: NEW, RENEWAL, OTHER
  status: permitStatusEnum("status").default("PENDING").notNull(),
  personId: uuid("person_id").references(() => people.id).notNull(),
  dueDate: timestamp("due_date"), // Gregorian UTC
  dueDateEC: varchar("due_date_ec", { length: 20 }), // Ethiopian calendar "YYYY-MM-DD"
  checklistId: uuid("checklist_id").references(() => checklists.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Checklists table (permit requirements templates with versioning)
export const checklists = pgTable("checklists", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  category: permitCategoryEnum("category"), // optional: link to permit type
  items: jsonb("items").$type<Array<{ label: string; required: boolean; hint?: string }>>().notNull(),
  version: integer("version").default(1).notNull(),
  active: boolean("active").default(true).notNull(), // only active templates used for new permits
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Permit checklist items (progress tracking for each permit)
export const permitChecklistItems = pgTable("permit_checklist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  permitId: uuid("permit_id").references(() => permits.id).notNull(),
  label: varchar("label", { length: 500 }).notNull(),
  required: boolean("required").default(false).notNull(),
  hint: text("hint"),
  completed: boolean("completed").default(false).notNull(),
  completedBy: uuid("completed_by").references(() => users.id),
  completedAt: timestamp("completed_at"),
  fileUrls: jsonb("file_urls").$type<string[]>().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Permit history table (audit trail)
export const permitHistory = pgTable("permit_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  permitId: uuid("permit_id").references(() => permits.id).notNull(),
  fromStatus: permitStatusEnum("from_status").notNull(),
  toStatus: permitStatusEnum("to_status").notNull(),
  changedBy: uuid("changed_by").references(() => users.id).notNull(),
  notes: text("notes"),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
})

// Update Tasks to link to permits and entities
export const tasksV2 = pgTable("tasks_v2", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("pending").notNull(),
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  dueDate: timestamp("due_date"),
  assigneeId: uuid("assignee_id").references(() => users.id),
  permitId: uuid("permit_id").references(() => permits.id), // Link to permit (for foreigner workflows)

  // NEW: Link to any entity (Foreigner/Vehicle/Import/Company)
  entityType: varchar("entity_type", { length: 50 }), // 'person', 'vehicle', 'import', 'company'
  entityId: uuid("entity_id"), // ID of the linked entity

  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
})

// Update Documents to link to people
export const documentsV2 = pgTable("documents_v2", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 100 }).notNull(), // passport, birth_certificate, etc.
  title: varchar("title", { length: 500 }),
  issuedBy: varchar("issued_by", { length: 255 }),
  number: varchar("number", { length: 100 }),
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"), // bytes
  mimeType: varchar("mime_type", { length: 100 }),
  personId: uuid("person_id").references(() => people.id), // NEW: owner is a person
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Calendar Events table
export const calendarEvents = pgTable("calendar_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  type: eventTypeEnum("type").notNull(),
  startDate: timestamp("start_date").notNull(), // Gregorian UTC
  endDate: timestamp("end_date"),
  startTime: varchar("start_time", { length: 10 }), // "09:00 AM" format
  endTime: varchar("end_time", { length: 10 }),
  allDay: boolean("all_day").default(false).notNull(),
  location: varchar("location", { length: 255 }),
  relatedPersonId: uuid("related_person_id").references(() => people.id), // optional link to person
  relatedPermitId: uuid("related_permit_id").references(() => permits.id), // optional link to permit

  // Generic Entity Linking
  entityType: varchar("entity_type", { length: 50 }), // 'task', 'vehicle', 'import', 'company'
  entityId: uuid("entity_id"),

  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Reports table
export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: reportStatusEnum("status").default("DRAFT").notNull(),
  frequency: reportFrequencyEnum("frequency").default("MONTHLY").notNull(),
  format: reportFormatEnum("format").default("PDF").notNull(),
  department: varchar("department", { length: 255 }),
  category: varchar("category", { length: 255 }), // "financial", "patient", "staff", "operations", etc.
  lastGenerated: timestamp("last_generated"),
  generatedBy: uuid("generated_by").references(() => users.id),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"), // bytes
  parameters: jsonb("parameters").$type<Record<string, any>>().default({}), // filter/query params
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ============ IMPORT, VEHICLE, COMPANY ENTITIES ============

// Import Permits (PIP & Single Window)
export const importPermits = pgTable("import_permits", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketNumber: varchar("ticket_number", { length: 50 }).unique(), // Unique Import ID (e.g., IMP-001)
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // "pip" | "single_window"
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  dueDate: timestamp("due_date"),
  assigneeId: uuid("assignee_id").references(() => users.id),
  documents: jsonb("documents").$type<string[]>().default([]), // flattened list for easy access
  documentSections: jsonb("document_sections").$type<any[]>().default([]), // detailed structure for UI
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Vehicles
export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketNumber: varchar("ticket_number", { length: 50 }).unique(), // Unique Vehicle ID (e.g., VEH-001)
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // inspection/road_fund/insurance/road_transport
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  vehicleInfo: varchar("vehicle_info", { length: 255 }),
  plateNumber: varchar("plate_number", { length: 50 }),
  dueDate: timestamp("due_date"),
  assigneeId: uuid("assignee_id").references(() => users.id),
  documents: jsonb("documents").$type<string[]>().default([]),
  documentSections: jsonb("document_sections").$type<any[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Company Registrations
export const companyRegistrations = pgTable("company_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketNumber: varchar("ticket_number", { length: 50 }).unique(), // Unique Company ID (e.g., CMP-001)
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  stage: varchar("stage", { length: 50 }).default("document_prep").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  companyName: varchar("company_name", { length: 255 }),
  registrationType: varchar("registration_type", { length: 100 }),
  dueDate: timestamp("due_date"),
  assigneeId: uuid("assignee_id").references(() => users.id),
  documents: jsonb("documents").$type<string[]>().default([]),
  documentSections: jsonb("document_sections").$type<any[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedTasks: many(tasks, { relationName: "assignee" }),
  createdTasks: many(tasks, { relationName: "creator" }),
  ownedDocuments: many(documents),
  activityLogs: many(activityLogs),
  comments: many(comments),
  teamMemberships: many(teamMembers),
  ledTeams: many(teams),
  ledDepartments: many(departments),
}))

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  head: one(users, {
    fields: [departments.headId],
    references: [users.id],
  }),
  teams: many(teams),
  tasks: many(tasks),
  documents: many(documents),
}))

export const teamsRelations = relations(teams, ({ one, many }) => ({
  department: one(departments, {
    fields: [teams.departmentId],
    references: [departments.id],
  }),
  leader: one(users, {
    fields: [teams.leaderId],
    references: [users.id],
  }),
  members: many(teamMembers),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  tasks: many(tasks),
  documents: many(documents),
}))

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: "assignee",
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: "creator",
  }),
  category: one(categories, {
    fields: [tasks.categoryId],
    references: [categories.id],
  }),
  department: one(departments, {
    fields: [tasks.departmentId],
    references: [departments.id],
  }),
  comments: many(comments),
}))

export const documentsRelations = relations(documents, ({ one, many }) => ({
  owner: one(users, {
    fields: [documents.ownerId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [documents.categoryId],
    references: [categories.id],
  }),
  department: one(departments, {
    fields: [documents.departmentId],
    references: [departments.id],
  }),
  comments: many(comments),
}))

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
}))

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}))

// MVP Relations
export const peopleRelations = relations(people, ({ one, many }) => ({
  guardian: one(people, {
    fields: [people.guardianId],
    references: [people.id],
    relationName: "dependents",
  }),
  dependents: many(people, { relationName: "dependents" }),
  permits: many(permits),
  documents: many(documentsV2),
}))

export const permitsRelations = relations(permits, ({ one, many }) => ({
  person: one(people, {
    fields: [permits.personId],
    references: [people.id],
  }),
  checklist: one(checklists, {
    fields: [permits.checklistId],
    references: [checklists.id],
  }),
  checklistItems: many(permitChecklistItems),
  tasks: many(tasksV2),
  history: many(permitHistory),
}))

export const checklistsRelations = relations(checklists, ({ one, many }) => ({
  permits: many(permits),
  createdBy: one(users, {
    fields: [checklists.createdBy],
    references: [users.id],
  }),
}))

export const permitChecklistItemsRelations = relations(permitChecklistItems, ({ one }) => ({
  permit: one(permits, {
    fields: [permitChecklistItems.permitId],
    references: [permits.id],
  }),
  completedBy: one(users, {
    fields: [permitChecklistItems.completedBy],
    references: [users.id],
  }),
}))

export const permitHistoryRelations = relations(permitHistory, ({ one }) => ({
  permit: one(permits, {
    fields: [permitHistory.permitId],
    references: [permits.id],
  }),
  user: one(users, {
    fields: [permitHistory.changedBy],
    references: [users.id],
  }),
}))

export const tasksV2Relations = relations(tasksV2, ({ one }) => ({
  assignee: one(users, {
    fields: [tasksV2.assigneeId],
    references: [users.id],
  }),
  permit: one(permits, {
    fields: [tasksV2.permitId],
    references: [permits.id],
  }),
}))

export const documentsV2Relations = relations(documentsV2, ({ one }) => ({
  person: one(people, {
    fields: [documentsV2.personId],
    references: [people.id],
  }),
}))

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  relatedPerson: one(people, {
    fields: [calendarEvents.relatedPersonId],
    references: [people.id],
  }),
  relatedPermit: one(permits, {
    fields: [calendarEvents.relatedPermitId],
    references: [permits.id],
  }),
  createdBy: one(users, {
    fields: [calendarEvents.createdBy],
    references: [users.id],
  }),
}))

// ============ CHATBOT SUPPORT SYSTEM ============

// Knowledge Base table (FAQ and support articles)
export const knowledgeBase = pgTable("knowledge_base", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 255 }), // "permits", "documents", "timeline", "general"
  keywords: jsonb("keywords").$type<string[]>().default([]), // for search matching
  relatedPermitCategory: permitCategoryEnum("related_permit_category"), // optional: link to permit type
  views: integer("views").default(0),
  helpful: integer("helpful").default(0), // positive feedback count
  notHelpful: integer("not_helpful").default(0), // negative feedback count
  published: boolean("published").default(true).notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Complaints table
export const complaints = pgTable("complaints", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketNumber: varchar("ticket_number", { length: 100 }).notNull().unique(), // AUTO: COM-YYYY-XXXX
  category: complaintCategoryEnum("category").notNull(),
  status: complaintStatusEnum("status").default("OPEN").notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  description: text("description").notNull(),
  personId: uuid("person_id").references(() => people.id), // optional: link to person
  relatedPermitId: uuid("related_permit_id").references(() => permits.id), // optional: link to permit
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  assignedTo: uuid("assigned_to").references(() => users.id), // staff member handling complaint
  resolution: text("resolution"), // final response/solution
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Testimonials table
export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }),
  message: text("message").notNull(),
  status: testimonialStatusEnum("status").default("PENDING").notNull(),
  relatedPermitId: uuid("related_permit_id").references(() => permits.id), // optional: what service they're testimonial about
  publishedAt: timestamp("published_at"),
  approvedBy: uuid("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Complaint Updates/Comments (conversation thread)
export const complaintUpdates = pgTable("complaint_updates", {
  id: uuid("id").primaryKey().defaultRandom(),
  complaintId: uuid("complaint_id").references(() => complaints.id).notNull(),
  message: text("message").notNull(),
  isStaffResponse: boolean("is_staff_response").default(false).notNull(),
  authorId: uuid("author_id").references(() => users.id), // staff member if isStaffResponse=true
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Type exports
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Department = typeof departments.$inferSelect
export type NewDepartment = typeof departments.$inferInsert
export type Team = typeof teams.$inferSelect
export type NewTeam = typeof teams.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
export type Document = typeof documents.$inferSelect
export type NewDocument = typeof documents.$inferInsert
export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
export type TeamMember = typeof teamMembers.$inferSelect
export type NewTeamMember = typeof teamMembers.$inferInsert

// MVP Type exports
export type Person = typeof people.$inferSelect
export type NewPerson = typeof people.$inferInsert
export type Permit = typeof permits.$inferSelect
export type NewPermit = typeof permits.$inferInsert
export type Checklist = typeof checklists.$inferSelect
export type NewChecklist = typeof checklists.$inferInsert
export type PermitChecklistItem = typeof permitChecklistItems.$inferSelect
export type NewPermitChecklistItem = typeof permitChecklistItems.$inferInsert
export type PermitHistory = typeof permitHistory.$inferSelect
export type NewPermitHistory = typeof permitHistory.$inferInsert
export type TaskV2 = typeof tasksV2.$inferSelect
export type NewTaskV2 = typeof tasksV2.$inferInsert
export type DocumentV2 = typeof documentsV2.$inferSelect
export type NewDocumentV2 = typeof documentsV2.$inferInsert
export type CalendarEvent = typeof calendarEvents.$inferSelect
export type NewCalendarEvent = typeof calendarEvents.$inferInsert

// Chatbot Support System Type exports
export type KnowledgeBase = typeof knowledgeBase.$inferSelect
export type NewKnowledgeBase = typeof knowledgeBase.$inferInsert
export type Complaint = typeof complaints.$inferSelect
export type NewComplaint = typeof complaints.$inferInsert
export type Testimonial = typeof testimonials.$inferSelect
export type NewTestimonial = typeof testimonials.$inferInsert
export type ComplaintUpdate = typeof complaintUpdates.$inferSelect
export type NewComplaintUpdate = typeof complaintUpdates.$inferInsert

// Import, Vehicle, Company Type exports
export type ImportPermit = typeof importPermits.$inferSelect
export type NewImportPermit = typeof importPermits.$inferInsert
export type Vehicle = typeof vehicles.$inferSelect
export type NewVehicle = typeof vehicles.$inferInsert
export type CompanyRegistration = typeof companyRegistrations.$inferSelect
export type NewCompanyRegistration = typeof companyRegistrations.$inferInsert
