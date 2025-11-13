import { relations } from "drizzle-orm/relations";
import { users, departments, teams, tasks, categories, documents, activityLogs, comments, teamMembers, people, checklists, permits, permitChecklistItems, permitHistory, tasksV2, documentsV2, calendarEvents } from "./schema";

export const departmentsRelations = relations(departments, ({one, many}) => ({
	user: one(users, {
		fields: [departments.headId],
		references: [users.id]
	}),
	teams: many(teams),
	tasks: many(tasks),
	documents: many(documents),
}));

export const usersRelations = relations(users, ({many}) => ({
	departments: many(departments),
	teams: many(teams),
	tasks_assigneeId: many(tasks, {
		relationName: "tasks_assigneeId_users_id"
	}),
	tasks_createdById: many(tasks, {
		relationName: "tasks_createdById_users_id"
	}),
	documents: many(documents),
	activityLogs: many(activityLogs),
	comments: many(comments),
	teamMembers: many(teamMembers),
	checklists: many(checklists),
	permitChecklistItems: many(permitChecklistItems),
	permitHistories: many(permitHistory),
	tasksV2s: many(tasksV2),
	calendarEvents: many(calendarEvents),
}));

export const teamsRelations = relations(teams, ({one, many}) => ({
	department: one(departments, {
		fields: [teams.departmentId],
		references: [departments.id]
	}),
	user: one(users, {
		fields: [teams.leaderId],
		references: [users.id]
	}),
	teamMembers: many(teamMembers),
}));

export const tasksRelations = relations(tasks, ({one}) => ({
	user_assigneeId: one(users, {
		fields: [tasks.assigneeId],
		references: [users.id],
		relationName: "tasks_assigneeId_users_id"
	}),
	category: one(categories, {
		fields: [tasks.categoryId],
		references: [categories.id]
	}),
	department: one(departments, {
		fields: [tasks.departmentId],
		references: [departments.id]
	}),
	user_createdById: one(users, {
		fields: [tasks.createdById],
		references: [users.id],
		relationName: "tasks_createdById_users_id"
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	tasks: many(tasks),
	documents: many(documents),
}));

export const documentsRelations = relations(documents, ({one}) => ({
	category: one(categories, {
		fields: [documents.categoryId],
		references: [categories.id]
	}),
	user: one(users, {
		fields: [documents.ownerId],
		references: [users.id]
	}),
	department: one(departments, {
		fields: [documents.departmentId],
		references: [departments.id]
	}),
}));

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
	user: one(users, {
		fields: [activityLogs.userId],
		references: [users.id]
	}),
}));

export const commentsRelations = relations(comments, ({one, many}) => ({
	user: one(users, {
		fields: [comments.authorId],
		references: [users.id]
	}),
	comment: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
		relationName: "comments_parentId_comments_id"
	}),
	comments: many(comments, {
		relationName: "comments_parentId_comments_id"
	}),
}));

export const teamMembersRelations = relations(teamMembers, ({one}) => ({
	team: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id]
	}),
	user: one(users, {
		fields: [teamMembers.userId],
		references: [users.id]
	}),
}));

export const peopleRelations = relations(people, ({one, many}) => ({
	person: one(people, {
		fields: [people.guardianId],
		references: [people.id],
		relationName: "people_guardianId_people_id"
	}),
	people: many(people, {
		relationName: "people_guardianId_people_id"
	}),
	permits: many(permits),
	documentsV2s: many(documentsV2),
	calendarEvents: many(calendarEvents),
}));

export const checklistsRelations = relations(checklists, ({one, many}) => ({
	user: one(users, {
		fields: [checklists.createdBy],
		references: [users.id]
	}),
	permits: many(permits),
}));

export const permitsRelations = relations(permits, ({one, many}) => ({
	person: one(people, {
		fields: [permits.personId],
		references: [people.id]
	}),
	checklist: one(checklists, {
		fields: [permits.checklistId],
		references: [checklists.id]
	}),
	permitChecklistItems: many(permitChecklistItems),
	permitHistories: many(permitHistory),
	tasksV2s: many(tasksV2),
	calendarEvents: many(calendarEvents),
}));

export const permitChecklistItemsRelations = relations(permitChecklistItems, ({one}) => ({
	permit: one(permits, {
		fields: [permitChecklistItems.permitId],
		references: [permits.id]
	}),
	user: one(users, {
		fields: [permitChecklistItems.completedBy],
		references: [users.id]
	}),
}));

export const permitHistoryRelations = relations(permitHistory, ({one}) => ({
	permit: one(permits, {
		fields: [permitHistory.permitId],
		references: [permits.id]
	}),
	user: one(users, {
		fields: [permitHistory.changedBy],
		references: [users.id]
	}),
}));

export const tasksV2Relations = relations(tasksV2, ({one}) => ({
	user: one(users, {
		fields: [tasksV2.assigneeId],
		references: [users.id]
	}),
	permit: one(permits, {
		fields: [tasksV2.permitId],
		references: [permits.id]
	}),
}));

export const documentsV2Relations = relations(documentsV2, ({one}) => ({
	person: one(people, {
		fields: [documentsV2.personId],
		references: [people.id]
	}),
}));

export const calendarEventsRelations = relations(calendarEvents, ({one}) => ({
	person: one(people, {
		fields: [calendarEvents.relatedPersonId],
		references: [people.id]
	}),
	permit: one(permits, {
		fields: [calendarEvents.relatedPermitId],
		references: [permits.id]
	}),
	user: one(users, {
		fields: [calendarEvents.createdBy],
		references: [users.id]
	}),
}));