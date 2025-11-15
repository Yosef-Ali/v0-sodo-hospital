# 🎫 Ticket System - Complete Setup Documentation

## ✅ What's Been Completed

### 1. Database Schema
- **`permits.ticket_number`**: varchar(100), unique constraint
- **`documentsV2.number`**: varchar(100) for linking documents to tickets
- **All chatbot support tables**: knowledge_base, complaints, testimonials

### 2. Migrations Applied
```
✓ 0000_strong_sebastian_shaw.sql   - Base tables (users, tasks, documents, etc.)
✓ 0001_petite_sumo.sql             - MVP tables (people, permits, checklists)
✓ 0002_wakeful_krista_starr.sql    - Permit checklist items & additional features
✓ 0003_tidy_vertigo.sql            - Ticket numbers + chatbot support system
```

### 3. Sample Data Seeded
**Permits with Ticket Numbers:**
- `WRK-2025-0001` → Work Permit for John Smith (PENDING)
  - 3 documents: Passport, Employment Contract, Health Certificate
- `RES-2025-0001` → Residence ID for John Smith (SUBMITTED)
  - 2 documents: Passport with Visa, Rental Agreement
- `LIC-2025-0001` → MOH License for Sarah Johnson (APPROVED)
  - 2 documents: Nursing Degree, US Nursing License
- `PIP-2025-0001` → Product Import Permit for Michael Chen (PENDING)
  - 2 documents: Proforma Invoice, EFDA Registration

**Knowledge Base Articles:**
- Work permit status checking
- Document requirements
- Processing timeline FAQs

**Sample Complaint:**
- `COM-2025-0001` → Service complaint about processing delay

---

## 🧪 How to Test

### Test 1: ChatKit Ticket Lookup
**Try these queries in the chat:**

1. **"What is the status of WRK-2025-0001?"**
   - Should show:
     - ✅ Permit status card with avatar
     - ✅ List of 3 uploaded documents (Passport, Contract, Certificate)

2. **"Show me documents for LIC-2025-0001"**
   - Should show:
     - ✅ License permit card (APPROVED status)
     - ✅ List of 2 documents (Degree, US License)

3. **"Check RES-2025-0001"**
   - Should show:
     - ✅ Residence ID card (SUBMITTED status)
     - ✅ List of 2 documents (Passport, Rental Agreement)

### Test 2: Document Upload Widget
**Trigger upload guide:**

1. Ask ChatKit: **"How do I upload documents for WRK-2025-0001?"**
   - Should show upload guide widget with:
     - ✅ "Select File" button (real file picker)
     - ✅ Document type dropdown
     - ✅ Step-by-step instructions (collapsible)

2. Click **"Select File"** → Choose any file → Select document type → Upload
   - Widget should show:
     - ✅ "Uploading..." progress indicator
     - ✅ "Uploaded: filename" success message (green)
     - ✅ Or error message if something fails (red)

3. Ask **"What is the status of WRK-2025-0001?"** again
   - Should now show:
     - ✅ Original 3 documents PLUS your newly uploaded file

### Test 3: Demo Mode (No API Key)
If `OPENAI_API_KEY` is not set in `.env.local`:

1. Ask **any question** in ChatKit
   - Should show:
     - ✅ Demo mode indicator
     - ✅ Simulated responses with permit data
     - ✅ Upload guide widget works in demo mode

---

## 🗂️ Code Structure

### Backend: Ticket Lookup & Document Linking
**`lib/actions/chatbot-support.ts`**
```typescript
// Lookup permit by ticket number
getPermitByTicketNumber(ticketNumber: string)
  → First tries: permits.ticketNumber == ticketNumber.toUpperCase()
  → Fallback: prefix mapping (WRK → WORK_PERMIT, etc.)

// Get documents linked to ticket
getDocumentsByTicketNumber(ticketNumber: string)
  → Query: documentsV2.number == ticketNumber.toUpperCase()
```

**`lib/actions/v2/documents.ts`**
```typescript
uploadDocument(formData: FormData)
  1. Read file, type, and number (ticket) from FormData
  2. If personId not provided and number is a ticket:
     - Look up permits by ticketNumber
     - Use permit.personId as owner
  3. Create documentsV2 record with:
     - number: ticket (e.g., "WRK-2025-0001")
     - personId: resolved from permit
```

### Frontend: Upload Widget
**`components/ui/chat-widgets.tsx`**
```typescript
UploadGuideWidget({ ticketNumber?: string })
  - Real file picker via <input type="file">
  - Builds FormData: { file, type, number: ticketNumber }
  - POSTs to /api/chatkit/upload-document
  - Shows "Uploading..." → "Uploaded: filename" or error
  - Collapsible step-by-step guide
```

**`lib/openai/service.ts`**
```typescript
// Permit fast-path: Shows status + documents
1. Find permit by ticket
2. Call getDocumentsByTicketNumber(ticketNumber)
3. If docs found, add list widget:
   - type: "list"
   - title: "Uploaded documents for this ticket"
   - items: [{ doc title/type, filename, MIME type }]
```

### API Routes
**`app/api/chatkit/upload-document/route.ts`**
```typescript
POST /api/chatkit/upload-document
  → Reads FormData
  → Calls uploadDocument(formData)
  → Returns { success, error, documentId }
```

---

## 📊 Database Queries

### Check all permits with tickets:
```sql
SELECT
  p.ticket_number,
  p.category,
  p.status,
  pe.first_name || ' ' || pe.last_name as person_name
FROM permits p
JOIN people pe ON p.person_id = pe.id
ORDER BY p.ticket_number;
```

### Check documents for a ticket:
```sql
SELECT
  type,
  title,
  number as ticket_number,
  issued_by,
  file_url,
  file_size,
  mime_type
FROM documents_v2
WHERE number = 'WRK-2025-0001'
ORDER BY created_at;
```

### Count documents per ticket:
```sql
SELECT
  number as ticket_number,
  COUNT(*) as document_count
FROM documents_v2
WHERE number IS NOT NULL
GROUP BY number
ORDER BY number;
```

---

## 🔧 Environment Setup

### Required Variables (.env.local)
```bash
# Database
DATABASE_URL='postgresql://...'

# OpenAI (optional - system works in demo mode without it)
OPENAI_API_KEY='sk-...'
```

### Scripts
```bash
# Database management
npm run db:generate      # Generate new migration
npm run db:migrate       # Apply migrations
npm run db:seed-mvp      # Seed permits, people, checklists
npx tsx lib/db/seed-documents.ts  # Seed sample documents

# Development
npm run dev              # Start Next.js dev server
```

---

## 🎯 Key Features

### ✅ Ticket-Based Document Organization
- Every document can be tagged with a ticket number
- Documents are automatically linked to the correct person via permit lookup
- ChatKit shows all documents when you query a ticket

### ✅ Smart Person Resolution
When uploading a document:
1. If `personId` is provided → use it directly
2. If `number` (ticket) matches format `XXX-YYYY-ZZZZ`:
   - Look up permit by `ticketNumber`
   - Auto-resolve `personId` from permit
3. Otherwise → create orphaned document (personId = null)

### ✅ Demo Mode Support
- System works without OpenAI API key
- Shows ticket data with simulated responses
- Upload widget fully functional in demo mode

### ✅ Real File Upload UX
- Native file picker (not textarea)
- Progress indicator ("Uploading...")
- Success/error feedback
- Immediate visual confirmation

### ✅ Contextual Document Lists
ChatKit automatically shows:
- Permit status card (with avatar, dates, notes)
- List of all uploaded documents for that ticket
- Document metadata (type, issuer, size, MIME type)

---

## 🚀 Next Steps (Optional)

### Production Enhancements:
1. **File Storage**: Integrate real storage (S3, R2, Vercel Blob)
   - Currently: Demo URLs like `/uploads/demo/passport.pdf`
   - Replace with actual upload endpoint

2. **File Validation**: Add size limits and MIME type checks
   - Max file size (e.g., 10MB per document)
   - Allowed types: PDF, JPG, PNG only

3. **Security**: Add authentication checks
   - Verify user has permission to upload for this ticket
   - Rate limiting on upload endpoint

4. **UI Polish**:
   - Show document thumbnails for images
   - Add "Download" buttons for documents
   - Delete/replace document functionality

5. **Notifications**:
   - Email stakeholders when documents are uploaded
   - Push notifications for permit status changes

---

## 📝 Testing Checklist

- [ ] Server running on http://localhost:3000
- [ ] ChatKit widget loads on landing page
- [ ] Query "WRK-2025-0001" shows permit + 3 documents
- [ ] Query "LIC-2025-0001" shows approved license + 2 documents
- [ ] Upload guide widget appears when asked
- [ ] File picker opens on "Select File" click
- [ ] Upload shows progress indicator
- [ ] Success message appears after upload
- [ ] Re-query ticket shows newly uploaded document
- [ ] Demo mode works without OPENAI_API_KEY

---

**🎉 System is fully functional and ready for development!**

Server: http://localhost:3000
Admin Login: admin@example.org / Admin123!
