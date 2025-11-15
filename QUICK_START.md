# 🚀 Quick Start Guide

## 🎯 What You Have Now

A fully functional **ticket-based document management system** integrated with ChatKit AI assistant.

### Live Now:
- ✅ **Dev Server**: http://localhost:3000
- ✅ **Database**: Neon PostgreSQL with all tables and data
- ✅ **4 Sample Permits** with ticket numbers (WRK-2025-0001, etc.)
- ✅ **9 Sample Documents** linked to tickets
- ✅ **ChatKit Widget** on landing page

---

## 🧪 Test It Right Now

### 1. Open the App
Visit: **http://localhost:3000**

### 2. Try ChatKit Queries
Click the chat widget and ask:

**"What is the status of WRK-2025-0001?"**
- You'll see:
  - ✅ Permit status card (John Smith, Work Permit, PENDING)
  - ✅ List of 3 documents (Passport, Contract, Health Certificate)

**"Show me LIC-2025-0001"**
- You'll see:
  - ✅ License card (Sarah Johnson, APPROVED)
  - ✅ List of 2 documents (Degree, Nursing License)

**"How do I upload documents for WRK-2025-0001?"**
- You'll see:
  - ✅ Upload guide widget
  - ✅ "Select File" button → real file picker
  - ✅ Step-by-step instructions

### 3. Test File Upload
1. Click **"Select File"** in the upload widget
2. Choose any file from your computer
3. Select document type from dropdown
4. Watch: "Uploading..." → "Uploaded: filename.pdf" ✅

---

## 📊 What's in the Database

### Tickets & Documents
| Ticket | Person | Category | Status | Documents |
|--------|--------|----------|--------|-----------|
| WRK-2025-0001 | John Smith | Work Permit | PENDING | 3 docs |
| RES-2025-0001 | John Smith | Residence ID | SUBMITTED | 2 docs |
| LIC-2025-0001 | Sarah Johnson | MOH License | APPROVED | 2 docs |
| PIP-2025-0001 | Michael Chen | Product Import | PENDING | 2 docs |

### Admin Access
- Email: `admin@example.org`
- Password: `Admin123!`

---

## 🛠️ Useful Commands

### Database
```bash
# View database in browser
npm run db:studio

# Add more sample documents
npm run db:seed-docs

# Reset everything and start fresh
npm run db:migrate && npm run db:seed-mvp && npm run db:seed-docs
```

### Development
```bash
# Start dev server (already running)
npm run dev

# Check for errors
npm run lint
```

---

## 📁 Key Files Modified/Created

### Database
- `lib/db/schema.ts` - Added `permits.ticketNumber`
- `lib/db/index.ts` - Fixed .env.local loading
- `lib/db/seed-mvp.ts` - Seeds permits with ticket numbers
- `lib/db/seed-documents.ts` - Seeds sample documents (NEW)
- `lib/db/migrations/0003_tidy_vertigo.sql` - Adds ticket support

### Backend Actions
- `lib/actions/chatbot-support.ts` - Ticket lookup functions
- `lib/actions/v2/documents.ts` - Upload with ticket linking
- `lib/actions/v2/chat.ts` - Demo mode support

### Frontend Components
- `components/ui/chat-widgets.tsx` - Upload widget with real file picker
- `lib/openai/service.ts` - Shows documents in permit cards

### API Routes
- `app/api/chatkit/upload-document/route.ts` - Upload endpoint (fixed "use server" issue)

---

## 🎓 How It Works

### Ticket Linking Flow:
```
1. User uploads file via ChatKit widget
   ↓
2. FormData sent to /api/chatkit/upload-document
   { file, type: "passport", number: "WRK-2025-0001" }
   ↓
3. uploadDocument() looks up permit by ticketNumber
   ↓
4. Resolves personId from permit
   ↓
5. Creates documentsV2 record:
   {
     number: "WRK-2025-0001",  ← Links to ticket
     personId: "uuid...",       ← Auto-resolved
     type: "passport",
     fileUrl: "/uploads/...",
     ...
   }
   ↓
6. Next query for "WRK-2025-0001" shows new document!
```

### ChatKit Response Flow:
```
User: "What is the status of WRK-2025-0001?"
  ↓
1. OpenAI service detects ticket pattern
  ↓
2. Calls getPermitByTicketNumber("WRK-2025-0001")
  ↓
3. Calls getDocumentsByTicketNumber("WRK-2025-0001")
  ↓
4. Returns widgets:
   - Permit status card
   - Document list widget (if docs found)
```

---

## ✨ Features Included

### ✅ Smart Ticket System
- Unique ticket numbers (WRK-2025-0001 format)
- Automatic document-to-person linking
- Fallback to prefix mapping for legacy data

### ✅ Real File Upload
- Native file picker (not textarea)
- Progress indicators
- Success/error feedback
- Works in demo mode (no OpenAI API key needed)

### ✅ Contextual Responses
- ChatKit automatically shows documents when querying tickets
- Document metadata (type, size, issuer)
- Grouped by ticket for easy organization

### ✅ Demo Mode
- Full functionality without OPENAI_API_KEY
- Shows real permit/document data
- Perfect for development/testing

---

## 🔍 Troubleshooting

### Server not responding?
```bash
# Kill existing process
lsof -ti:3000 | xargs kill

# Restart
npm run dev
```

### Database connection error?
```bash
# Check .env.local has DATABASE_URL
cat .env.local | grep DATABASE_URL

# Test connection
npx tsx -e "import { neon } from '@neondatabase/serverless'; import { config } from 'dotenv'; config({ path: '.env.local' }); const sql = neon(process.env.DATABASE_URL); sql\`SELECT 1\`.then(() => console.log('✅ Connected')).catch(e => console.error('❌ Error:', e.message));"
```

### No documents showing?
```bash
# Re-seed documents
npm run db:seed-docs
```

---

## 📚 Documentation

- **`TICKET_SYSTEM_SETUP.md`** - Complete technical documentation
- **`QUICK_START.md`** - This file (getting started guide)
- **`OPENAI_CHATKIT_SETUP.md`** - ChatKit integration details

---

## 🎉 You're All Set!

Everything is ready for development:
- ✅ Database migrated and seeded
- ✅ Dev server running at http://localhost:3000
- ✅ Ticket system fully functional
- ✅ Document upload working
- ✅ Sample data for testing

**Next:** Open http://localhost:3000 and start chatting with the AI assistant!

Try asking: *"What is the status of WRK-2025-0001?"*
