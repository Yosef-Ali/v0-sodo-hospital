# Refactoring Summary - Quick Decision Guide

## What You Have Now ✅
- Task management dashboard with kanban board and calendar
- Document management system
- Drizzle ORM with Neon PostgreSQL
- Stack Auth integration
- Green themed UI with Tailwind
- Next.js 15 App Router

## What the Spec Wants 🎯
- Ethiopian hospital operations (permits, licensing, immigration)
- People & dependents management
- Ethiopian calendar as primary (with Gregorian conversion)
- Dual language (English + Amharic)
- RBAC with 5 roles (ADMIN, HR, LOGISTICS, FINANCE, USER)
- Prisma ORM instead of Drizzle
- DHIS2-compatible exports
- Checklist system for permits
- Email/password authentication

## Key Differences (Big Changes)

| Aspect | Current | Target | Effort |
|--------|---------|--------|--------|
| **Domain** | Generic admin tasks | Ethiopian hospital permits | 🔴 HIGH |
| **ORM** | Drizzle | Prisma | 🔴 HIGH |
| **Auth** | Stack Auth | Email/Password + RBAC | 🟡 MEDIUM |
| **Calendar** | Gregorian only | Ethiopian primary | 🟡 MEDIUM |
| **Language** | English only | English + Amharic (አማርኛ) | 🟡 MEDIUM |
| **Data Model** | Tasks/Documents | Permits/People/Checklists | 🔴 HIGH |

## Recommended Approach: Parallel Development

Instead of throwing away what you have, we recommend:

### ✅ KEEP & ENHANCE
- Next.js, TypeScript, Tailwind (already perfect)
- UI component structure (well organized)
- PostgreSQL database (just add new tables)
- Green theme (can be hospital brand)
- Dashboard layout (just change the widgets)

### 🔄 COEXIST (Temporary)
- **Both Drizzle AND Prisma** running together
  - Drizzle handles old features (activity logs, legacy data)
  - Prisma handles new features (permits, people)
  - Gradually migrate over 2-3 months

### 🆕 ADD NEW
- Ethiopian calendar conversion library
- i18next for translations
- Prisma schema for permits system
- Email/password auth (keep Stack Auth during transition)

## 8-Phase Implementation Plan

### **Phase 0: Foundation** (1-2 days)
Set up Prisma, Ethiopian calendar library, i18n config
- ✅ No breaking changes
- ✅ Existing app still works

### **Phase 1: Auth & RBAC** (2-3 days)
New auth system with roles
- ✅ Runs alongside Stack Auth
- ✅ Can switch gradually

### **Phase 2: People & Documents** (3-4 days)
Build people management
- New `/people` page
- Link documents to people

### **Phase 3: Permits & Checklists** (4-5 days)
Core permit system
- Work permits, residence IDs, licenses
- Checklist engine
- State transitions with audit trail

### **Phase 4: Tasks Integration** (2-3 days)
Link tasks to permits
- Update dashboard to show permit-driven tasks
- Auto-generate reminder tasks

### **Phase 5: Localization & Calendar** (3-4 days)
Full Amharic support + Ethiopian dates
- Language switcher
- Ethiopian date picker component
- All forms use EC dates

### **Phase 6: Exports** (2-3 days)
CSV exports for reporting
- HR summaries
- DHIS2-compatible format

### **Phase 7: Notifications** (2-3 days)
Email reminders
- Daily cron job
- 90/60/30/7 day alerts

### **Phase 8: Testing** (2-3 days)
Comprehensive tests + docs
- API tests
- E2E tests
- Production deployment

**Total Time: 4-5 weeks**

## Decision Points

### Option A: Full Refactoring (Recommended)
**Pros:**
- Meets spec exactly
- Clean architecture
- Scalable for Ethiopian operations
- Can handle complex permit workflows

**Cons:**
- 4-5 weeks of development
- Learning curve for Ethiopian calendar
- Translation effort for Amharic

**Choose this if:**
- You need the Ethiopian-specific features
- You have 1-2 months for development
- You plan to serve Ethiopian hospital operations

### Option B: Hybrid Approach
**Pros:**
- Faster (2-3 weeks)
- Keep current features working
- Add only critical permit features

**Cons:**
- Won't fully match spec
- May need refactoring later
- Less organized codebase

**Choose this if:**
- You need a quick demo
- You want to test the concept first
- You can iterate based on feedback

### Option C: Start Fresh
**Pros:**
- Clean slate
- Exact spec match from day 1
- No legacy code

**Cons:**
- Lose all current work
- Longer timeline (6-8 weeks)
- Higher risk

**Choose this if:**
- Current system has fundamental issues
- You have plenty of time
- You want perfect alignment with spec

## Our Recommendation: **Option A (Full Refactoring)**

Why?
1. **Preserves your work** - Calendar, dashboard, UI components all reusable
2. **Lower risk** - Parallel development means no downtime
3. **Reasonable timeline** - 5 weeks is achievable
4. **Best of both worlds** - Modern stack + Ethiopian specifics

## Immediate Next Steps (Today)

### 1. Make Key Decisions
Answer these questions:
- [ ] Do you need ALL permit types (WORK_PERMIT, RESIDENCE_ID, LICENSE, PIP) or can we start with 1-2?
- [ ] Do you have an Amharic translator, or should we use machine translation initially?
- [ ] Can we use the same Neon database or need a separate one?
- [ ] Is the 5-week timeline acceptable?
- [ ] Do you want to keep Stack Auth during transition or switch immediately?

### 2. Review the Full Plan
Open `REFACTORING_PLAN.md` and:
- [ ] Review the database schema (Section 2.2)
- [ ] Check the API contracts (Section 3 of original spec)
- [ ] Confirm the phased approach works for your team
- [ ] Note any concerns or questions

### 3. Set Up Foundation (If Proceeding)
```bash
# Install dependencies
npm install --legacy-peer-deps prisma @prisma/client
npm install --legacy-peer-deps react-i18next i18next
npm install --legacy-peer-deps ethiopic-js bcryptjs jose

# Initialize Prisma
npx prisma init

# Test Ethiopian calendar
# (We'll create a test file)
```

### 4. Stakeholder Alignment
Schedule a 30-minute call to:
- Walk through the refactoring plan
- Clarify priorities (which permit types first?)
- Confirm translation approach
- Agree on timeline
- Get approval to proceed

## What Happens After This Decision?

### If you choose **Full Refactoring**:
1. I'll start with **Phase 0** (Foundation Setup)
2. We'll set up Prisma, Ethiopian calendar, i18n
3. We'll create a demo of the date picker with EC/Gregorian
4. You review and approve before Phase 1

### If you choose **Hybrid**:
1. I'll create a simplified plan
2. We'll focus on core permit functionality only
3. Skip Amharic initially (add later)
4. 2-week timeline

### If you choose **Start Fresh**:
1. I'll create a new Next.js project from scratch
2. Build exactly per spec from day 1
3. No migration concerns
4. 6-week timeline

## Questions?

Common concerns:

**Q: Will I lose my current database?**
A: No! We'll use Prisma for new tables, Drizzle keeps working for old tables.

**Q: What if Ethiopian calendar conversion has bugs?**
A: We'll write extensive tests and cross-check with paper calendars. We can also store both formats.

**Q: Is 5 weeks realistic?**
A: Yes, with one dedicated developer. If you have 2 people, it could be 3-4 weeks.

**Q: Can we launch with just English first?**
A: Yes! We can add Amharic in Phase 5 or defer it to post-MVP.

**Q: What if we want to keep some features from the current app?**
A: We are! Dashboard, calendar view, task management all stay—just get linked to permits.

## Ready to Proceed?

Tell me:
1. Which option (A, B, or C)?
2. Any must-have features we should prioritize?
3. Any features we can defer to post-MVP?
4. Timeline constraints?
5. Any concerns about the plan?

Then I'll start implementation! 🚀
