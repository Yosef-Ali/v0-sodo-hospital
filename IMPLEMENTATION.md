# Sodo Hospital - Permit Management System

## Implementation Documentation

**Version:** 2.0.0
**Last Updated:** February 2026
**Production URL:** https://sch-addis.org
**Repository:** https://github.com/Yosef-Ali/v0-sodo-hospital

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [Core Modules](#core-modules)
7. [File Storage](#file-storage)
8. [Deployment](#deployment)
9. [API Reference](#api-reference)
10. [Recent Changes](#recent-changes)

---

## System Overview

Sodo Hospital Permit Management System is a full-stack web application for managing:
- Foreign worker records
- Import permits and customs documents
- Vehicle registrations
- Company registrations
- Tasks and workflows
- Calendar events
- Reports and analytics

### Key Features

- **Role-Based Access Control** (ADMIN, HR_MANAGER, HR, LOGISTICS, FINANCE, USER)
- **Ethiopian Calendar Support** with dual calendar display
- **Document Management** with S3-compatible storage (MinIO)
- **AI-Powered Chat Assistant** (Google Gemini 2.0)
- **Real-time Dashboard** with entity statistics
- **Kanban Task Board** with drag-and-drop

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.2.6 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| Radix UI | Latest | Accessible components |
| Lucide React | Latest | Icons |
| TanStack DnD Kit | Latest | Drag and drop |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | - | REST API endpoints |
| Server Actions | - | Type-safe server functions |
| NextAuth.js | 5.x | Authentication (JWT) |
| Drizzle ORM | Latest | Database queries |
| Zod | Latest | Schema validation |

### Database & Storage
| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 16 | Primary database |
| Neon Database | - | Cloud PostgreSQL (development) |
| MinIO | Latest | S3-compatible file storage |
| Redis | 7 | Caching (optional) |

### AI & Services
| Technology | Purpose |
|------------|---------|
| Google Gemini 2.0 Flash | AI chat assistant |
| @react-pdf/renderer | PDF generation |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Next.js   │  │    React    │  │   Tailwind + Radix  │  │
│  │  App Router │  │ Components  │  │      UI Library     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         SERVER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Server    │  │  NextAuth   │  │   API Routes        │  │
│  │   Actions   │  │   (JWT)     │  │   /api/*            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ PostgreSQL  │  │    MinIO    │  │       Redis         │  │
│  │  (Drizzle)  │  │     (S3)    │  │     (Cache)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
sodo-hospital/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Dashboard routes (protected)
│   │   ├── admin-guide/          # Admin documentation
│   │   ├── calendar/             # Calendar views
│   │   ├── company/              # Company management
│   │   ├── dashboard/            # Main dashboard
│   │   ├── foreigners/           # Foreign workers
│   │   ├── import/               # Import permits
│   │   ├── reports/              # Reports & analytics
│   │   ├── settings/             # System settings
│   │   ├── tasks/                # Task management
│   │   ├── users/                # User management
│   │   └── vehicle/              # Vehicle management
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── files/                # File upload/download
│   │   ├── reports/              # Report generation
│   │   └── ...
│   ├── login/                    # Login page
│   └── signup/                   # Signup page
├── components/                   # React components
│   ├── layout/                   # Layout components
│   ├── pages/                    # Page-level components
│   │   └── settings/             # Settings pages
│   ├── ui/                       # UI primitives
│   └── ...
├── lib/                          # Utilities & business logic
│   ├── actions/v2/               # Server actions
│   ├── auth/                     # Auth utilities
│   ├── db/                       # Database schema & config
│   └── storage/                  # S3/MinIO utilities
├── scripts/                      # Deployment scripts
└── docker-compose.yml            # Container orchestration
```

---

## Database Schema

### Core Tables

#### `users`
```sql
id              UUID PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
name            VARCHAR(255)
password        VARCHAR(255)  -- bcrypt hashed
role            ENUM('ADMIN','HR_MANAGER','HR','LOGISTICS','FINANCE','USER')
active          BOOLEAN DEFAULT true
locale          VARCHAR(10) DEFAULT 'en'
created_at      TIMESTAMP
updated_at      TIMESTAMP
deleted_at      TIMESTAMP  -- soft delete
```

#### `people` (Foreigners)
```sql
id              UUID PRIMARY KEY
ticket_number   VARCHAR(50) UNIQUE  -- e.g., FOR-2024-0001
first_name      VARCHAR(255)
last_name       VARCHAR(255)
email           VARCHAR(255)
phone           VARCHAR(50)
passport_no     VARCHAR(100)
nationality     VARCHAR(100)
date_of_birth   DATE
photo_url       TEXT
guardian_id     UUID REFERENCES people(id)  -- for dependents
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### `vehicles`
```sql
id              UUID PRIMARY KEY
ticket_number   VARCHAR(50) UNIQUE
plate_number    VARCHAR(50)
make            VARCHAR(100)
model           VARCHAR(100)
year            INTEGER
category        VARCHAR(50)  -- inspection, registration, etc.
status          VARCHAR(50)
owner_id        UUID REFERENCES people(id)
created_at      TIMESTAMP
```

#### `import_permits`
```sql
id              UUID PRIMARY KEY
ticket_number   VARCHAR(50) UNIQUE
category        VARCHAR(50)  -- pip, customs
description     TEXT
status          VARCHAR(50)
person_id       UUID REFERENCES people(id)
created_at      TIMESTAMP
```

#### `company_registrations`
```sql
id              UUID PRIMARY KEY
ticket_number   VARCHAR(50) UNIQUE
name            VARCHAR(255)
registration_no VARCHAR(100)
stage           VARCHAR(50)
created_at      TIMESTAMP
```

#### `tasks_v2`
```sql
id              UUID PRIMARY KEY
title           VARCHAR(255) NOT NULL
description     TEXT
status          ENUM('pending','in-progress','completed','urgent')
priority        ENUM('low','medium','high')
due_date        DATE
assignee_id     UUID REFERENCES users(id)
permit_id       UUID REFERENCES permits(id)
created_at      TIMESTAMP
```

#### `system_settings`
```sql
id              UUID PRIMARY KEY
key             VARCHAR(100) UNIQUE NOT NULL
value           TEXT
description     TEXT
category        VARCHAR(50) DEFAULT 'general'
is_secret       BOOLEAN DEFAULT false
updated_by      UUID REFERENCES users(id)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## Authentication & Authorization

### Auth Flow

1. User submits email/password to `/api/auth/signin`
2. NextAuth validates credentials against database
3. JWT token issued with user ID, email, and role
4. Token stored in HTTP-only cookie (30-day expiry)
5. Middleware validates token on protected routes

### Role Hierarchy

```
ADMIN
  └── HR_MANAGER
        └── HR
        └── LOGISTICS
              └── FINANCE
                    └── USER
```

### Permission Matrix

| Action | ADMIN | HR_MANAGER | HR | LOGISTICS | FINANCE | USER |
|--------|-------|------------|-----|-----------|---------|------|
| View Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage Foreigners | ✓ | ✓ | ✓ | - | - | - |
| Manage Imports | ✓ | ✓ | - | ✓ | - | - |
| Manage Vehicles | ✓ | ✓ | - | ✓ | - | - |
| Manage Companies | ✓ | ✓ | - | - | - | - |
| Manage Users | ✓ | - | - | - | - | - |
| View Reports | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| System Settings | ✓ | - | - | - | - | - |

### Safe Action Pattern

```typescript
// lib/safe-action.ts
export function createSafeAction<TInput, TOutput>(
  schema: z.Schema<TInput>,
  action: SafeActionFunc<TInput, TOutput>,
  options?: { requiredRole?: string | string[] }
)
```

Usage:
```typescript
export const deleteReport = createSafeAction(
  deleteReportSchema,
  async ({ id }, user) => {
    // user is guaranteed to be authenticated
    // role is already validated
    const [deleted] = await db.delete(reports).where(eq(reports.id, id)).returning()
    return { success: true, data: deleted }
  },
  { requiredRole: ["ADMIN", "HR_MANAGER"] }
)
```

---

## Core Modules

### Dashboard (`/dashboard`)

Displays:
- Task statistics (open, in-progress, completed, urgent)
- Entity overview (foreigners, vehicles, imports, companies)
- Expiring documents alerts
- Quick navigation links
- "My Tasks" for current user

**Data Source:** `lib/actions/v2/tasks.ts`, entity stats functions

### Foreigners (`/foreigners`)

CRUD operations for foreign workers:
- List with search and filters
- Detail view with documents, dependents
- Photo upload
- Passport/visa tracking

**Data Source:** `lib/actions/v2/foreigners.ts`

### Imports (`/import`)

Import permit management:
- PIP (Personal Import Permit)
- Customs documents
- Status tracking

**Data Source:** `lib/actions/v2/imports.ts`

### Vehicles (`/vehicle`)

Vehicle registration management:
- Inspection tracking
- Insurance/Bolo
- Owner linkage

**Data Source:** `lib/actions/v2/vehicles.ts`

### Tasks (`/tasks`)

Kanban-style task management:
- Drag-and-drop between columns
- Priority levels
- Due date tracking
- Assignee management

**Data Source:** `lib/actions/v2/tasks.ts`

### Calendar (`/calendar`)

Event scheduling:
- Month and year views
- Ethiopian calendar support
- Expiry date auto-sync

**Data Source:** `lib/actions/v2/calendar-events.ts`

### Reports (`/reports`)

Analytics and exports:
- Entity statistics
- Task completion rates
- PDF generation
- CSV export

**Data Source:** `lib/actions/v2/reports.ts`

### Settings (`/settings`)

System configuration:

#### Organization Settings
- Company logo upload
- Organization name, email, phone, address
- Timezone selection

#### Calendar Preferences
- Ethiopian calendar toggle
- Dual calendar display

#### Notifications
- Document expiry alerts
- Alert days configuration

**Data Source:** `lib/actions/v2/settings.ts`

---

## File Storage

### MinIO/S3 Configuration

```typescript
// lib/storage/s3.ts
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || "http://minio:9000",
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
})
```

### Upload API

**Endpoint:** `POST /api/files/upload`

```typescript
// Request (multipart/form-data)
{
  file: File,
  folder: string  // e.g., "logos", "documents", "photos"
}

// Response
{
  key: "logos/1706789123-abc123.png",
  url: "/api/files/logos/1706789123-abc123.png",
  size: 102400,
  contentType: "image/png"
}
```

### File Retrieval

**Endpoint:** `GET /api/files/[...key]`

Returns file stream with proper content-type headers.

### Folder Structure

```
documents/           # S3 Bucket
├── logos/           # Company logos
├── photos/          # Person photos
├── documents/       # Uploaded documents
└── uploads/         # General uploads
```

---

## Deployment

### Docker Compose Services

```yaml
services:
  app:
    image: ghcr.io/yosef-ali/v0-sodo-hospital:latest
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:***@db:5432/sodo
      - NEXTAUTH_URL=https://sch-addis.org
      - S3_ENDPOINT=http://minio:9000
    depends_on:
      - db
      - minio

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=sodo
      - POSTGRES_PASSWORD=***

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### GitHub Actions CI/CD

**Trigger:** Push to `master` branch

**Workflow:**
1. Build Docker image
2. Push to GitHub Container Registry (ghcr.io)
3. SSH to VPS (72.62.170.70)
4. Pull latest image
5. Restart containers
6. Cleanup old images

```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS

on:
  push:
    branches: [master]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/yosef-ali/v0-sodo-hospital:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1.0.3
        with:
          host: 72.62.170.70
          username: root
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /root/sodo-hospital
            git pull origin master
            docker compose pull app
            docker compose up -d app
            docker system prune -f
```

### Manual Deployment

```bash
# On VPS
cd /root/sodo-hospital
./scripts/deploy-vps.sh
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:password@db:5432/sodo

# Auth
NEXTAUTH_URL=https://sch-addis.org
NEXTAUTH_SECRET=your-secret-key
AUTH_SECRET=your-auth-secret

# Storage
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin123
S3_BUCKET=documents
S3_PUBLIC_URL=https://sch-addis.org/storage

# AI
GOOGLE_AI_API_KEY=your-gemini-api-key

# Redis (optional)
REDIS_URL=redis://redis:6379
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signin` | Sign in |
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/signout` | Sign out |
| GET | `/api/auth/session` | Get current session |

### Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload file |
| GET | `/api/files/[...key]` | Download file |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/pdf` | Generate PDF report |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/backfill-tickets` | Backfill ticket numbers |

---

## Recent Changes

### Version 2.0.0 (February 2026)

#### Dashboard Overhaul
- Removed permit references from dashboard
- Added entity overview with Foreigners, Vehicles, Imports, Companies
- Quick stats cards for each entity type
- Updated Quick Navigation

#### Organization Settings
- Company logo upload with MinIO storage
- Organization profile editing
- Calendar preferences
- Notification settings
- Settings persist to `system_settings` table

#### Reports Module Fix
- Fixed JSX syntax in PDF generation
- Added missing functions: `getReportById`, `getReportStats`, `updateReport`
- Fixed "use server" schema exports

#### Admin Guide Updates
- Replaced Permits with Import documentation
- Updated workflows and CRUD examples

---

## Support

For issues or questions:
- **Repository:** https://github.com/Yosef-Ali/v0-sodo-hospital
- **Production:** https://sch-addis.org

---

*Generated by Claude Code - February 2026*
