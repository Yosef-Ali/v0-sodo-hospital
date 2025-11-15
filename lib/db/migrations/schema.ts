import { pgTable, index, unique, uuid, varchar, timestamp, foreignKey, text, integer, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const documentStatus = pgEnum("document_status", ['pending', 'approved', 'review'])
export const eventType = pgEnum("event_type", ['permit', 'deadline', 'meeting', 'interview', 'other'])
export const permitCategory = pgEnum("permit_category", ['WORK_PERMIT', 'RESIDENCE_ID', 'LICENSE', 'PIP'])
export const permitStatus = pgEnum("permit_status", ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED'])
export const taskPriority = pgEnum("task_priority", ['low', 'medium', 'high'])
export const taskStatus = pgEnum("task_status", ['pending', 'in-progress', 'completed', 'urgent'])
export const userRole = pgEnum("user_role", ['ADMIN', 'HR_MANAGER', 'HR', 'LOGISTICS', 'FINANCE', 'USER'])


export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	stackAuthId: varchar("stack_auth_id", { length: 255 }),
	email: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }),
	password: varchar({ length: 255 }),
	role: userRole().default('USER').notNull(),
	locale: varchar({ length: 10 }).default('en'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("users_stack_auth_id_key").on(table.stackAuthId),
	unique("users_email_key").on(table.email),
]);

export const departments = pgTable("departments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	headId: uuid("head_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.headId],
			foreignColumns: [users.id],
			name: "departments_head_id_fkey"
		}),
]);

export const teams = pgTable("teams", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	departmentId: uuid("department_id"),
	leaderId: uuid("leader_id"),
	memberCount: integer("member_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.id],
			name: "teams_department_id_fkey"
		}),
	foreignKey({
			columns: [table.leaderId],
			foreignColumns: [users.id],
			name: "teams_leader_id_fkey"
		}),
]);

export const tasks = pgTable("tasks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 500 }).notNull(),
	description: text(),
	status: taskStatus().default('pending').notNull(),
	priority: taskPriority().default('medium').notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	assigneeId: uuid("assignee_id"),
	categoryId: uuid("category_id"),
	departmentId: uuid("department_id"),
	createdById: uuid("created_by_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.assigneeId],
			foreignColumns: [users.id],
			name: "tasks_assignee_id_fkey"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "tasks_category_id_fkey"
		}),
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.id],
			name: "tasks_department_id_fkey"
		}),
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [users.id],
			name: "tasks_created_by_id_fkey"
		}),
]);

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	color: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("categories_name_key").on(table.name),
]);

export const documents = pgTable("documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 500 }).notNull(),
	description: text(),
	status: documentStatus().default('pending').notNull(),
	categoryId: uuid("category_id"),
	fileType: varchar("file_type", { length: 50 }),
	fileSize: varchar("file_size", { length: 50 }),
	fileUrl: text("file_url"),
	ownerId: uuid("owner_id"),
	departmentId: uuid("department_id"),
	tags: jsonb().default([]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "documents_category_id_fkey"
		}),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "documents_owner_id_fkey"
		}),
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.id],
			name: "documents_department_id_fkey"
		}),
]);

export const activityLogs = pgTable("activity_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	action: varchar({ length: 100 }).notNull(),
	entityType: varchar("entity_type", { length: 50 }).notNull(),
	entityId: uuid("entity_id").notNull(),
	details: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "activity_logs_user_id_fkey"
		}),
]);

export const comments = pgTable("comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	content: text().notNull(),
	authorId: uuid("author_id"),
	entityType: varchar("entity_type", { length: 50 }).notNull(),
	entityId: uuid("entity_id").notNull(),
	parentId: uuid("parent_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "comments_author_id_fkey"
		}),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "comments_parent_id_fkey"
		}),
]);

export const teamMembers = pgTable("team_members", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	teamId: uuid("team_id").notNull(),
	userId: uuid("user_id").notNull(),
	role: varchar({ length: 100 }),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "team_members_team_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "team_members_user_id_fkey"
		}),
]);

export const people = pgTable("people", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }).notNull(),
	nationality: varchar({ length: 100 }),
	passportNo: varchar("passport_no", { length: 100 }),
	phone: varchar({ length: 50 }),
	email: varchar({ length: 255 }),
	guardianId: uuid("guardian_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_people_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.guardianId],
			foreignColumns: [table.id],
			name: "people_guardian_id_fkey"
		}),
]);

export const checklists = pgTable("checklists", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	category: permitCategory(),
	items: jsonb().notNull(),
	version: integer().default(1).notNull(),
	active: boolean().default(true).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "checklists_created_by_fkey"
		}),
]);

export const permits = pgTable("permits", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	ticketNumber: varchar("ticket_number", { length: 100 }),
	category: permitCategory().notNull(),
	status: permitStatus().default('PENDING').notNull(),
	personId: uuid("person_id").notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	dueDateEc: varchar("due_date_ec", { length: 20 }),
	checklistId: uuid("checklist_id"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_permits_category").using("btree", table.category.asc().nullsLast().op("enum_ops")),
	index("idx_permits_person_id").using("btree", table.personId.asc().nullsLast().op("uuid_ops")),
	index("idx_permits_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.personId],
			foreignColumns: [people.id],
			name: "permits_person_id_fkey"
		}),
	foreignKey({
			columns: [table.checklistId],
			foreignColumns: [checklists.id],
			name: "permits_checklist_id_fkey"
		}),
]);

export const permitChecklistItems = pgTable("permit_checklist_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	permitId: uuid("permit_id").notNull(),
	label: varchar({ length: 500 }).notNull(),
	required: boolean().default(false).notNull(),
	hint: text(),
	completed: boolean().default(false).notNull(),
	completedBy: uuid("completed_by"),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	fileUrls: jsonb("file_urls").default([]),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_permit_checklist_items_permit_id").using("btree", table.permitId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.permitId],
			foreignColumns: [permits.id],
			name: "permit_checklist_items_permit_id_fkey"
		}),
	foreignKey({
			columns: [table.completedBy],
			foreignColumns: [users.id],
			name: "permit_checklist_items_completed_by_fkey"
		}),
]);

export const permitHistory = pgTable("permit_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	permitId: uuid("permit_id").notNull(),
	fromStatus: permitStatus("from_status").notNull(),
	toStatus: permitStatus("to_status").notNull(),
	changedBy: uuid("changed_by").notNull(),
	notes: text(),
	changedAt: timestamp("changed_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.permitId],
			foreignColumns: [permits.id],
			name: "permit_history_permit_id_fkey"
		}),
	foreignKey({
			columns: [table.changedBy],
			foreignColumns: [users.id],
			name: "permit_history_changed_by_fkey"
		}),
]);

export const tasksV2 = pgTable("tasks_v2", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 500 }).notNull(),
	description: text(),
	status: taskStatus().default('pending').notNull(),
	priority: taskPriority().default('medium').notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	assigneeId: uuid("assignee_id"),
	permitId: uuid("permit_id"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
}, (table) => [
	index("idx_tasks_v2_assignee_id").using("btree", table.assigneeId.asc().nullsLast().op("uuid_ops")),
	index("idx_tasks_v2_permit_id").using("btree", table.permitId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.assigneeId],
			foreignColumns: [users.id],
			name: "tasks_v2_assignee_id_fkey"
		}),
	foreignKey({
			columns: [table.permitId],
			foreignColumns: [permits.id],
			name: "tasks_v2_permit_id_fkey"
		}),
]);

export const documentsV2 = pgTable("documents_v2", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	type: varchar({ length: 100 }).notNull(),
	title: varchar({ length: 500 }),
	issuedBy: varchar("issued_by", { length: 255 }),
	number: varchar({ length: 100 }),
	issueDate: timestamp("issue_date", { mode: 'string' }),
	expiryDate: timestamp("expiry_date", { mode: 'string' }),
	fileUrl: text("file_url"),
	fileSize: integer("file_size"),
	mimeType: varchar("mime_type", { length: 100 }),
	personId: uuid("person_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.personId],
			foreignColumns: [people.id],
			name: "documents_v2_person_id_fkey"
		}),
]);

export const calendarEvents = pgTable("calendar_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 500 }).notNull(),
	description: text(),
	type: eventType().notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	startTime: varchar("start_time", { length: 10 }),
	endTime: varchar("end_time", { length: 10 }),
	allDay: boolean("all_day").default(false).notNull(),
	location: varchar({ length: 255 }),
	relatedPersonId: uuid("related_person_id"),
	relatedPermitId: uuid("related_permit_id"),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_calendar_events_start_date").using("btree", table.startDate.asc().nullsLast().op("timestamp_ops")),
	index("idx_calendar_events_type").using("btree", table.type.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.relatedPersonId],
			foreignColumns: [people.id],
			name: "calendar_events_related_person_id_fkey"
		}),
	foreignKey({
			columns: [table.relatedPermitId],
			foreignColumns: [permits.id],
			name: "calendar_events_related_permit_id_fkey"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "calendar_events_created_by_fkey"
		}),
]);
