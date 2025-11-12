# Database Setup Guide

This project uses **Drizzle ORM** with **Neon PostgreSQL** database for data persistence.

## Database Architecture

### Technology Stack
- **ORM**: Drizzle ORM v0.44.7
- **Database**: Neon PostgreSQL (Serverless)
- **Driver**: @neondatabase/serverless
- **Migration Tool**: Drizzle Kit v0.31.6

### Database Schema

The database schema includes the following tables:

#### Core Tables

1. **users** - User accounts (integrated with Stack Auth)
   - id, stack_auth_id, email, name, role
   - Timestamps: created_at, updated_at

2. **departments** - Hospital departments
   - id, name, description, head_id (references users)
   - Timestamps: created_at, updated_at

3. **teams** - Teams within departments
   - id, name, description, department_id, leader_id, member_count
   - Timestamps: created_at, updated_at

4. **categories** - Categories for tasks and documents
   - id, name, type (task/document), color
   - Timestamps: created_at

5. **tasks** - Task management
   - id, title, description, status, priority, due_date
   - Relationships: assignee_id, category_id, department_id, created_by_id
   - Enums: status (pending, in-progress, completed, urgent), priority (low, medium, high)
   - Timestamps: created_at, updated_at, completed_at

6. **documents** - Document management
   - id, title, description, status, category_id
   - File info: file_type, file_size, file_url
   - Relationships: owner_id, department_id
   - Enum: status (pending, approved, review)
   - JSONB: tags[]
   - Timestamps: created_at, updated_at

7. **activity_logs** - Audit trail
   - id, user_id, action, entity_type, entity_id, details (JSONB)
   - Timestamp: created_at

8. **comments** - Comments on tasks/documents
   - id, content, author_id, entity_type, entity_id, parent_id
   - Supports nested comments
   - Timestamps: created_at, updated_at

9. **team_members** - Team membership junction table
   - id, team_id, user_id, role, joined_at

## Setup Instructions

### 1. Environment Variables

Ensure your `.env.local` file contains the Neon database connection string:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_xxxxx@ep-xxxxx.neon.tech/neondb?sslmode=require
```

### 2. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install --legacy-peer-deps
```

### 3. Generate Migration Files

Generate SQL migration files from your schema:

```bash
npm run db:generate
```

This creates migration files in `lib/db/migrations/`

### 4. Apply Migrations to Database

**Option A: Push schema directly (Development)**
```bash
npm run db:push
```
This is the fastest way for development. It directly syncs your schema with the database.

**Option B: Run migrations (Production)**
```bash
npm run db:migrate
```
This applies migration files sequentially.

### 5. Seed Database with Sample Data

Populate the database with initial data:

```bash
npm run db:seed
```

This will create:
- 5 sample users
- 3 departments
- 13 categories (8 for tasks, 5 for documents)
- 9 sample tasks
- 5 sample documents

## Available Scripts

```bash
npm run db:generate    # Generate migration files from schema
npm run db:push        # Push schema changes directly to database (dev)
npm run db:migrate     # Run migration files (production)
npm run db:studio      # Open Drizzle Studio (database GUI)
npm run db:seed        # Seed database with sample data
```

## Usage in Application

### Server Actions

The database comes with pre-built server actions for CRUD operations:

#### Tasks
```typescript
import { getTasks, createTask, updateTask, deleteTask, getTaskStats } from "@/lib/actions/tasks"

// Get all tasks
const { success, data } = await getTasks()

// Create a task
await createTask({
  title: "New Task",
  description: "Task description",
  status: "pending",
  priority: "medium",
  dueDate: new Date("2025-12-31"),
  assigneeId: "user-uuid",
  categoryId: "category-uuid",
})

// Update a task
await updateTask("task-uuid", {
  status: "completed"
})

// Get statistics
const stats = await getTaskStats()
// Returns: { all, pending, in-progress, completed, urgent }
```

#### Documents
```typescript
import { getDocuments, createDocument, updateDocument, deleteDocument } from "@/lib/actions/documents"

// Get all documents
const { success, data } = await getDocuments()

// Create a document
await createDocument({
  title: "New Document",
  description: "Document description",
  status: "pending",
  categoryId: "category-uuid",
  fileType: "PDF",
  fileSize: "2.4 MB",
  tags: ["tag1", "tag2"],
})
```

#### Categories
```typescript
import { getCategories, createCategory } from "@/lib/actions/categories"

// Get task categories
const { data: taskCategories } = await getCategories("task")

// Get document categories
const { data: docCategories } = await getCategories("document")
```

### Direct Database Access

```typescript
import { db, tasks, users } from "@/lib/db"
import { eq } from "drizzle-orm"

// Query with joins
const result = await db
  .select({
    taskTitle: tasks.title,
    assigneeName: users.name,
  })
  .from(tasks)
  .leftJoin(users, eq(tasks.assigneeId, users.id))
```

## Database Schema File Structure

```
lib/
├── db/
│   ├── index.ts              # Database instance & exports
│   ├── schema.ts             # Complete schema definition
│   ├── seed.ts               # Seed data script
│   └── migrations/           # Auto-generated migration files
│       └── 0000_*.sql
└── actions/
    ├── tasks.ts              # Task CRUD operations
    ├── documents.ts          # Document CRUD operations
    └── categories.ts         # Category CRUD operations
```

## Development Workflow

### Making Schema Changes

1. Update `lib/db/schema.ts` with your changes
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:push` (dev) or `npm run db:migrate` (prod)
4. Test changes in Drizzle Studio: `npm run db:studio`

### Adding New Server Actions

Create a new file in `lib/actions/`:

```typescript
"use server"

import { db, yourTable } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function yourAction() {
  try {
    const result = await db.select().from(yourTable)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: "Error message" }
  }
}
```

## Drizzle Studio

Access the visual database editor:

```bash
npm run db:studio
```

This opens a web interface at `https://local.drizzle.studio` where you can:
- View all tables and data
- Run queries
- Edit records
- Explore relationships

## Migration Strategy

### Development
- Use `npm run db:push` for quick iteration
- Schema changes are applied immediately

### Production
- Always use `npm run db:generate` + `npm run db:migrate`
- Migrations are versioned and tracked
- Rollback is possible

## Troubleshooting

### Connection Issues

If you get connection errors:
1. Check your `DATABASE_URL` in `.env.local`
2. Ensure Neon database is accessible
3. Verify SSL mode is set: `?sslmode=require`

### Migration Conflicts

If migrations fail:
1. Check `lib/db/migrations/meta/` for migration state
2. Manually resolve conflicts in Neon dashboard
3. Re-generate migrations: `npm run db:generate`

### WebSocket Errors (Development)

The Neon driver uses WebSockets. If you see WS errors:
- This is normal in some environments
- Migrations are still generated correctly
- Use Neon dashboard to apply migrations manually if needed

## Best Practices

1. **Always use Server Actions** - Never query the database directly from client components
2. **Revalidate paths** - Use `revalidatePath()` after mutations to update cache
3. **Handle errors** - All actions return `{ success, data/error }` format
4. **Use transactions** - For multi-step operations, use `db.transaction()`
5. **Type safety** - Import types from schema: `import type { Task, NewTask } from "@/lib/db"`

## Next Steps

1. Run migrations: `npm run db:push`
2. Seed the database: `npm run db:seed`
3. Update components to use server actions instead of mock data
4. Test in Drizzle Studio: `npm run db:studio`

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Neon Database](https://neon.tech/docs)
- [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)
