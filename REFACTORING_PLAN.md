# SODO Hospital Ops - Refactoring Plan
## From Administrative Dashboard to Ethiopian Hospital Operations System

---

## Executive Summary

This document outlines a phased refactoring plan to transform the current SODO Hospital administrative dashboard into a specialized Ethiopian hospital operations system focusing on permits, licensing, immigration, and compliance tracking.

**Current State:** Task/document management system with Drizzle ORM, Stack Auth, basic CRUD operations.

**Target State:** Ethiopian-specific hospital operations with permits, Ethiopian calendar, dual language (EN/AM), DHIS2 exports, and compliance workflows.

**Strategy:** Incremental refactoring over database migration to minimize disruption and leverage existing infrastructure.

---

## 1. Gap Analysis

### 1.1 What We Can Keep ✅

| Component | Status | Notes |
|-----------|--------|-------|
| Next.js 15 App Router | ✅ Keep | Matches spec requirement |
| TypeScript | ✅ Keep | Already strict mode |
| Tailwind CSS | ✅ Keep | Matches spec requirement |
| PostgreSQL (Neon) | ✅ Keep | Database engine matches |
| Green Theme | ✅ Keep | Can be hospital brand |
| Component Architecture | ✅ Keep | Well-structured UI components |
| File Structure | ✅ Keep | Aligns with spec §12 |
| Docker-ready setup | ✅ Keep | Matches deployment requirement |

### 1.2 What Needs Major Changes 🔄

| Component | Current | Target | Complexity |
|-----------|---------|--------|------------|
| **ORM** | Drizzle | Prisma | HIGH - Complete schema rewrite |
| **Auth** | Stack Auth | Email/Password + RBAC | MEDIUM - Different approach |
| **Data Model** | Tasks/Documents | Permits/People/Checklists | HIGH - Domain shift |
| **Calendar** | Gregorian only | Ethiopian primary | MEDIUM - New library needed |
| **Localization** | None | EN/AM with i18next | MEDIUM - Translation setup |
| **Task Model** | Standalone | Linked to Permits | MEDIUM - Relationship change |

### 1.3 What Needs to be Added 🆕

| Feature | Complexity | Priority |
|---------|------------|----------|
| Ethiopian Calendar conversion | MEDIUM | P0 - Core requirement |
| People & Dependents management | MEDIUM | P0 - Core entity |
| Permit system with workflows | HIGH | P0 - Core feature |
| Checklist engine | MEDIUM | P0 - Per spec §5 |
| RBAC system (5 roles) | MEDIUM | P0 - Security |
| Amharic translations | HIGH | P0 - Required for users |
| DHIS2 exports | LOW | P1 - Can stub initially |
| Letter templates | LOW | P1 - Can add later |
| Notification system | MEDIUM | P1 - Email reminders |
| Audit trail | LOW | P0 - Permit history |

---

## 2. Database Migration Strategy

### 2.1 Recommended Approach: Parallel Implementation

Instead of migrating Drizzle → Prisma immediately, we'll:

1. **Keep Drizzle for existing features** (dashboard metrics, activity logs)
2. **Add Prisma for new features** (permits, people, checklists)
3. **Gradually deprecate** old tables as new system becomes primary

**Rationale:**
- Minimizes risk and allows iterative testing
- Both ORMs can coexist in Next.js
- Existing UI components continue working
- Can demo progress incrementally

### 2.2 Prisma Schema (Based on Spec §2)

**Priority 1 - Core Tables:**
```prisma
// lib/prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  password  String   // bcrypt hashed
  locale    String   @default("en") // for i18n preference
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]
  changedPermits PermitHistory[]

  @@map("users_v2") // avoid collision with Drizzle users table
}

enum Role {
  ADMIN
  HR
  LOGISTICS
  FINANCE
  USER
}

model Person {
  id          String     @id @default(cuid())
  firstName   String
  lastName    String
  nationality String?
  passportNo  String?    @unique
  phone       String?
  email       String?
  guardianId  String?
  guardian    Person?    @relation("DependentRelation", fields: [guardianId], references: [id], onDelete: SetNull)
  dependents  Person[]   @relation("DependentRelation")
  documents   Document[]
  permits     Permit[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([guardianId])
  @@map("people")
}

model Document {
  id         String    @id @default(cuid())
  type       String    // e.g., "passport", "birth_certificate"
  issuedBy   String?
  number     String?
  issueDate  DateTime?
  expiryDate DateTime?
  fileUrl    String?   // S3 or local path
  fileSize   Int?      // bytes
  mimeType   String?
  ownerId    String?
  owner      Person?   @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  createdAt  DateTime  @default(now())

  @@index([ownerId])
  @@map("documents_v2") // avoid collision
}

model Permit {
  id          String           @id @default(cuid())
  category    PermitCategory
  status      PermitStatus     @default(PENDING)
  personId    String
  person      Person           @relation(fields: [personId], references: [id], onDelete: Cascade)
  dueDate     DateTime?        // Stored as Gregorian UTC
  dueDateEC   String?          // Store EC as "YYYY-MM-DD" for easy querying
  checklistId String?
  checklist   Checklist?       @relation(fields: [checklistId], references: [id], onDelete: SetNull)
  notes       String?          @db.Text
  tasks       Task[]
  history     PermitHistory[]
  attachments PermitAttachment[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([personId])
  @@index([category, status])
  @@index([dueDateEC]) // for efficient expiry queries
  @@map("permits")
}

enum PermitCategory {
  WORK_PERMIT
  RESIDENCE_ID
  LICENSE      // MOH
  PIP          // EFDA Pre-Import
}

enum PermitStatus {
  PENDING
  SUBMITTED
  APPROVED
  REJECTED
  EXPIRED
}

model Task {
  id         String     @id @default(cuid())
  title      String
  status     TaskStatus @default(OPEN)
  dueDate    DateTime?
  assigneeId String?
  assignee   User?      @relation(fields: [assigneeId], references: [id], onDelete: SetNull)
  permitId   String?
  permit     Permit?    @relation(fields: [permitId], references: [id], onDelete: Cascade)
  notes      String?    @db.Text
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  @@index([permitId])
  @@index([assigneeId])
  @@map("tasks_v2")
}

enum TaskStatus {
  OPEN
  IN_PROGRESS
  DONE
  BLOCKED
}

model Checklist {
  id      String   @id @default(cuid())
  name    String
  items   Json     // [{ label, required, hint }]
  permits Permit[]

  @@map("checklists")
}

model PermitHistory {
  id        String       @id @default(cuid())
  permitId  String
  permit    Permit       @relation(fields: [permitId], references: [id], onDelete: Cascade)
  from      PermitStatus
  to        PermitStatus
  changedBy String       // User ID
  user      User         @relation(fields: [changedBy], references: [id])
  notes     String?      @db.Text
  changedAt DateTime     @default(now())

  @@index([permitId])
  @@map("permit_history")
}

model PermitAttachment {
  id       String   @id @default(cuid())
  permitId String
  permit   Permit   @relation(fields: [permitId], references: [id], onDelete: Cascade)
  fileUrl  String
  fileName String
  fileSize Int
  mimeType String
  uploadedAt DateTime @default(now())

  @@index([permitId])
  @@map("permit_attachments")
}

// Optional - for DHIS2 reporting
model Facility {
  id      String   @id @default(cuid())
  name    String
  mfrCode String?  @unique
  region  String?
  woreda  String?
  createdAt DateTime @default(now())

  @@map("facilities")
}

model Shipment {
  id          String   @id @default(cuid())
  proforma    String?
  airwayBill  String?
  status      String?
  pipPermitId String?
  createdAt   DateTime @default(now())

  @@map("shipments")
}
```

### 2.3 Dual ORM Coexistence

**File Structure:**
```
lib/
├── db/                    # Existing Drizzle
│   ├── index.ts
│   └── schema.ts
├── prisma/                # New Prisma
│   ├── schema.prisma
│   ├── client.ts
│   └── migrations/
└── actions/
    ├── tasks.ts           # Keep using Drizzle for now
    ├── documents.ts       # Keep using Drizzle for now
    └── v2/                # New Prisma-based actions
        ├── people.ts
        ├── permits.ts
        ├── checklists.ts
        └── auth.ts
```

**lib/prisma/client.ts:**
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

---

## 3. Phased Implementation Plan

### Phase 0: Foundation Setup (1-2 days)

**Goals:** Set up Prisma, Ethiopian calendar, i18n without breaking existing features.

**Tasks:**
1. ✅ Install Prisma + dependencies
   ```bash
   npm install --legacy-peer-deps prisma @prisma/client
   npm install --legacy-peer-deps react-i18next i18next
   npm install --legacy-peer-deps ethiopic-js  # Ethiopian calendar library
   ```

2. ✅ Create Prisma schema (see §2.2)
   ```bash
   npx prisma init
   # Update DATABASE_URL to point to new database or schema
   ```

3. ✅ Ethiopian Calendar Helper (`lib/dates/ethiopian.ts`)
   ```typescript
   import { EthiopicCalendar } from 'ethiopic-js'

   export interface ECDate {
     year: number
     month: number
     day: number
   }

   export function gregorianToEC(date: Date): ECDate {
     const ec = new EthiopicCalendar(date)
     return {
       year: ec.year,
       month: ec.month,
       day: ec.day
     }
   }

   export function ecToGregorian(ec: ECDate): Date {
     return EthiopicCalendar.fromEthiopic(ec.year, ec.month, ec.day).toDate()
   }

   export function formatEC(ec: ECDate, locale: 'en' | 'am'): string {
     const monthNames = locale === 'am'
       ? ['መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሳስ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ኃምሌ', 'ነሐሴ', 'ጳጉሜን']
       : ['Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit', 'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagumen']

     return `${monthNames[ec.month - 1]} ${ec.day}, ${ec.year}`
   }
   ```

4. ✅ i18n Setup (`lib/i18n/config.ts`)
   ```typescript
   import i18n from 'i18next'
   import { initReactI18next } from 'react-i18next'

   import en from '@/locales/en/common.json'
   import am from '@/locales/am/common.json'

   i18n
     .use(initReactI18next)
     .init({
       resources: {
         en: { common: en },
         am: { common: am }
       },
       lng: 'en',
       fallbackLng: 'en',
       interpolation: {
         escapeValue: false
       }
     })

   export default i18n
   ```

5. ✅ Create initial translation files (see spec §6)

**Deliverable:** Foundation ready; existing app still works.

---

### Phase 1: Authentication & RBAC (2-3 days)

**Goals:** Replace Stack Auth with email/password auth; implement role-based access.

**Tasks:**
1. ✅ Create auth actions (`lib/actions/v2/auth.ts`)
   ```typescript
   'use server'

   import { prisma } from '@/lib/prisma/client'
   import bcrypt from 'bcryptjs'
   import { SignJWT, jwtVerify } from 'jose'
   import { cookies } from 'next/headers'

   export async function login(email: string, password: string) {
     const user = await prisma.user.findUnique({ where: { email } })
     if (!user) return { success: false, error: 'Invalid credentials' }

     const valid = await bcrypt.compare(password, user.password)
     if (!valid) return { success: false, error: 'Invalid credentials' }

     // Create JWT token
     const token = await new SignJWT({ userId: user.id, role: user.role })
       .setProtectedHeader({ alg: 'HS256' })
       .setExpirationTime('7d')
       .sign(new TextEncoder().encode(process.env.JWT_SECRET!))

     cookies().set('auth-token', token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       maxAge: 60 * 60 * 24 * 7 // 7 days
     })

     return { success: true, user: { id: user.id, email: user.email, role: user.role } }
   }

   export async function getCurrentUser() {
     const token = cookies().get('auth-token')?.value
     if (!token) return null

     try {
       const { payload } = await jwtVerify(
         token,
         new TextEncoder().encode(process.env.JWT_SECRET!)
       )
       return await prisma.user.findUnique({
         where: { id: payload.userId as string },
         select: { id: true, email: true, name: true, role: true }
       })
     } catch {
       return null
     }
   }
   ```

2. ✅ Create middleware for RBAC (`middleware.ts`)
   ```typescript
   import { NextResponse } from 'next/server'
   import type { NextRequest } from 'next/server'
   import { jwtVerify } from 'jose'

   const roleAccess = {
     '/api/people': ['ADMIN', 'HR'],
     '/api/permits': ['ADMIN', 'HR', 'LOGISTICS'],
     '/api/tasks': ['ADMIN', 'HR', 'LOGISTICS', 'FINANCE'],
   }

   export async function middleware(request: NextRequest) {
     const token = request.cookies.get('auth-token')?.value

     if (!token && request.nextUrl.pathname.startsWith('/api/')) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
     }

     try {
       const { payload } = await jwtVerify(
         token!,
         new TextEncoder().encode(process.env.JWT_SECRET!)
       )

       // Check role access
       const path = request.nextUrl.pathname
       for (const [route, roles] of Object.entries(roleAccess)) {
         if (path.startsWith(route) && !roles.includes(payload.role as string)) {
           return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
         }
       }

       return NextResponse.next()
     } catch {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
     }
   }
   ```

3. ✅ Create login page (`app/(auth)/login/page.tsx`)

4. ✅ Seed admin user (`lib/prisma/seed-auth.ts`)
   ```typescript
   import { prisma } from './client'
   import bcrypt from 'bcryptjs'

   async function seedAuth() {
     const adminPassword = await bcrypt.hash('Admin123!', 10)

     await prisma.user.create({
       data: {
         email: 'admin@example.org',
         name: 'System Admin',
         role: 'ADMIN',
         password: adminPassword,
         locale: 'en'
       }
     })
   }
   ```

**Deliverable:** New auth system working alongside Stack Auth.

---

### Phase 2: People & Documents (3-4 days)

**Goals:** Build people management with dependents; file uploads.

**Tasks:**
1. ✅ People CRUD actions (`lib/actions/v2/people.ts`)
2. ✅ People list page (`app/(dashboard)/people-v2/page.tsx`)
3. ✅ Person detail view with dependents
4. ✅ Document upload action (S3 or local)
5. ✅ Update sidebar navigation

**Deliverable:** Can create/view people and link documents.

---

### Phase 3: Permits & Checklists (4-5 days)

**Goals:** Core permit system with workflows.

**Tasks:**
1. ✅ Checklist seed data (spec §5)
2. ✅ Permit CRUD actions
3. ✅ Permit state machine (transition logic)
4. ✅ Permit list/detail pages with EC dates
5. ✅ Checklist widget component
6. ✅ Attach documents/files to permits
7. ✅ Audit trail (PermitHistory)

**Deliverable:** Can create permits, track status, complete checklists.

---

### Phase 4: Tasks Integration (2-3 days)

**Goals:** Link tasks to permits; update dashboard.

**Tasks:**
1. ✅ Update task model to link to permits (Prisma)
2. ✅ Auto-generate reminder tasks (90/60/30/7 days)
3. ✅ Dashboard widgets:
   - Expiring permits (30 days)
   - Upcoming submissions
   - Overdue tasks
4. ✅ Task assignment by role

**Deliverable:** Dashboard shows permit-driven tasks.

---

### Phase 5: Localization & Calendar UI (3-4 days)

**Goals:** Full AM/EN support; EC date pickers.

**Tasks:**
1. ✅ Complete translations (spec §6)
2. ✅ Language switcher component (persisted in user profile)
3. ✅ Ethiopian date picker component
   ```typescript
   // Show EC primary, Gregorian as hint
   <ECDatePicker
     value={ecDate}
     onChange={(ec) => setEcDate(ec)}
     locale={locale}
   />
   // Displays: "ጥር 15, 2017 (Jan 23, 2025)"
   ```
4. ✅ Update all forms to use EC dates
5. ✅ Test round-trip conversions

**Deliverable:** Full bilingual app with EC calendar.

---

### Phase 6: Exports & Reporting (2-3 days)

**Goals:** CSV exports for HR and DHIS2.

**Tasks:**
1. ✅ Monthly HR summary export
2. ✅ Expiring permits CSV
3. ✅ DHIS2-compatible aggregate format (stub)
4. ✅ Reports page UI

**Deliverable:** Can export data for compliance.

---

### Phase 7: Notifications & Polish (2-3 days)

**Goals:** Email reminders; production-ready.

**Tasks:**
1. ✅ Cron job for daily reminder emails
2. ✅ Email templates with EC dates
3. ✅ Error states, loading states
4. ✅ Responsive design audit
5. ✅ Security audit (rate limiting, file validation)

**Deliverable:** Production-ready MVP.

---

### Phase 8: Testing & Documentation (2-3 days)

**Goals:** Comprehensive tests; deployment docs.

**Tasks:**
1. ✅ API tests (Jest) - spec §11
2. ✅ EC conversion tests
3. ✅ E2E tests (Playwright) - acceptance checklist
4. ✅ Update README with setup instructions
5. ✅ Docker Compose configuration

**Deliverable:** Tested, documented, deployable system.

---

## 4. Migration Path for Existing Features

### 4.1 Dashboard
- **Keep:** Card layout, activity table structure
- **Update:** Metrics to show permit data instead of generic tasks
- **Add:** Expiring permits widget

### 4.2 Tasks Page
- **Keep:** Kanban board, calendar view UI
- **Update:** Link tasks to permits instead of standalone
- **Add:** Filter by permit category

### 4.3 Documents Page
- **Deprecate:** Standalone document management
- **Replace:** Documents attached to people/permits
- **Migration:** Bulk associate existing docs with people

### 4.4 Settings Page
- **Keep:** Structure
- **Add:** Checklist editor, letter templates, facility management

---

## 5. Technical Decisions & Trade-offs

### 5.1 Why Parallel ORMs?
**Pros:**
- Zero downtime during transition
- Can test new features without breaking old ones
- Gradual team learning curve

**Cons:**
- Slightly more complex codebase temporarily
- Need to maintain two DB connections

**Decision:** Acceptable trade-off for 2-3 month transition period.

### 5.2 Ethiopian Calendar Storage
**Options:**
1. Store only Gregorian (convert on-the-fly)
2. Store only EC (convert on-the-fly)
3. Store both

**Decision:** Store both (spec §2) for query performance.
- `dueDate: DateTime` (Gregorian UTC) - for DB queries
- `dueDateEC: String` (YYYY-MM-DD) - for UI and filtering

### 5.3 File Storage
**Phase 1:** Local filesystem (`/uploads`)
**Phase 2:** S3-compatible (Neon's object storage or AWS)

**Decision:** Start local, make interface async for easy swap.

### 5.4 i18n Strategy
**Options:**
1. Server-side only (RSC)
2. Client-side only
3. Hybrid

**Decision:** Hybrid - use `react-i18next` client-side for dynamic UI; server actions return English keys, client translates.

---

## 6. Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Ethiopian calendar bugs | High | High | Extensive unit tests; cross-check with paper calendars |
| Amharic font issues | Medium | Medium | Use web-safe AM fonts; test on multiple browsers |
| Prisma migration conflicts | Medium | High | Separate schema namespace; thorough testing |
| RBAC bypass | Low | Critical | Security audit; automated permission tests |
| Data loss during migration | Low | Critical | Backup before each phase; rollback plan |
| Performance with file uploads | Medium | Medium | Use background jobs; implement upload progress |

---

## 7. Team & Timeline

**Estimated Total:** 20-25 days (4-5 weeks) for MVP

**Suggested Team:**
- 1 Backend Engineer (Prisma, auth, APIs)
- 1 Frontend Engineer (UI, i18n, EC calendar)
- 0.5 QA Engineer (testing, acceptance)

**Milestones:**
- **Week 1:** Foundation + Auth (Phases 0-1)
- **Week 2:** People + Documents (Phase 2)
- **Week 3:** Permits + Checklists (Phase 3)
- **Week 4:** Tasks + Localization (Phases 4-5)
- **Week 5:** Polish + Testing (Phases 6-8)

---

## 8. Rollback Plan

Each phase should be deployable independently. If issues arise:

1. **Phase 1-2:** Keep using Stack Auth; new features behind feature flag
2. **Phase 3+:** New routes (`/people-v2`, `/permits`) alongside old system
3. **Database:** Prisma tables are separate; can drop and recreate without affecting Drizzle tables

**Feature Flags:**
```typescript
// lib/config/features.ts
export const features = {
  useNewAuth: process.env.FEATURE_NEW_AUTH === 'true',
  usePermits: process.env.FEATURE_PERMITS === 'true',
  useEthiopianCalendar: process.env.FEATURE_EC === 'true',
}
```

---

## 9. Success Criteria (Spec §11 Acceptance Checklist)

- [ ] All API endpoints (spec §3) respond correctly
- [ ] Dashboard shows expiring permits within 30 days
- [ ] Language switch persists across refresh
- [ ] CSV exports download and open correctly
- [ ] Audit history lists all permit transitions
- [ ] EC date conversions accurate (round-trip tests pass)
- [ ] Role-based access enforced (HR can't access FINANCE endpoints)
- [ ] Email reminders sent for 7/30/60/90 day windows
- [ ] File uploads virus-scanned (stubbed) and size-limited
- [ ] Amharic text renders correctly across browsers

**Plus Original Features:**
- [ ] Existing dashboard metrics still work
- [ ] Can migrate old documents to new people
- [ ] Performance <3s for permit list page

---

## 10. Post-MVP Enhancements

After core MVP, consider:

1. **PWA Support** - Offline access for field staff
2. **SMS Notifications** - Alternative to email
3. **Letter Generator** - Auto-populate templates
4. **DHIS2 Live API** - Real integration
5. **Mobile App** - React Native
6. **Advanced Reporting** - Charts, trends
7. **Bulk Import** - CSV upload for people/permits
8. **E-Signature** - For approval workflows
9. **Calendar Sync** - Export to Google/Outlook
10. **Multi-Facility** - Support for hospital network

---

## 11. Next Steps

### Immediate Actions (This Week):

1. **Review this plan** with stakeholders
2. **Clarify priorities** - Which permit types first? (Suggest: WORK_PERMIT → RESIDENCE_ID → LICENSE → PIP)
3. **Set up Ethiopian calendar library** - Verify accuracy with known dates
4. **Create translation spreadsheet** - EN/AM for all UI strings
5. **Backup current database** before any changes

### Start Implementation:

```bash
# 1. Install new dependencies
npm install --legacy-peer-deps prisma @prisma/client bcryptjs jose
npm install --legacy-peer-deps react-i18next i18next
npm install --legacy-peer-deps ethiopic-js

# 2. Initialize Prisma
npx prisma init

# 3. Create Prisma schema (from §2.2)
# Edit prisma/schema.prisma

# 4. Generate Prisma client
npx prisma generate

# 5. Create migrations
npx prisma migrate dev --name init_permits_system

# 6. Start Phase 0 tasks
```

---

## 12. Questions for Stakeholder

Before proceeding, confirm:

1. **Database:** Can we use a separate PostgreSQL schema or should we use a new database entirely?
2. **Priorities:** Which permit types are most urgent? Can we launch with just 1-2 types?
3. **Data Migration:** Do existing "tasks" need to be preserved or can we start fresh?
4. **Amharic:** Do you have a translator available, or should we use Google Translate initially?
5. **Timeline:** Is 5-week timeline acceptable, or do we need to compress/expand?
6. **Authentication:** Can we fully replace Stack Auth, or should we keep it for certain users?
7. **Budget:** Is S3 storage approved, or must we use local filesystem?

---

## Conclusion

This refactoring plan provides a **safe, incremental path** from the current administrative dashboard to a specialized Ethiopian hospital operations system. By using parallel ORMs and feature flags, we minimize risk while building toward the spec requirements.

The phased approach allows for:
- ✅ Continuous delivery and testing
- ✅ Easy rollback if issues arise
- ✅ Learning and adjustment as we go
- ✅ Stakeholder demos after each phase

**Recommendation:** Proceed with Phase 0 (Foundation Setup) immediately, then reassess after 1 week based on Ethiopian calendar integration complexity.

---

**Document Version:** 1.0
**Date:** 2025-11-12
**Author:** Claude (AI Assistant)
**Next Review:** After Phase 2 completion
