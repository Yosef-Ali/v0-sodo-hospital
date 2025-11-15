# Customer Support Widgets - The "Sale Point" Feature

## Overview

These inline customer support widgets are the **key differentiator** of the SODO Hospital Document Management System. They allow customers to get complete support **entirely within the chat interface** - no redirects to dashboards needed.

## The 4 Core Customer Support Widgets

### 1. 🎫 Ticket Verification Widget

**Purpose**: Secure customer verification before sharing personal information

**When to use**:
- User asks about their permit status
- User wants to track their application
- User asks personal questions that require authentication

**Features**:
- ✅ Real-time format validation (PER-2024-XXXX, WRK-2024-XXXX, RES-2024-XXXX)
- ✅ Shows accepted formats inline
- ✅ Handles verification errors
- ✅ Loading states during verification
- ✅ Green gradient design with security messaging

**AI Response Example**:
```json
{
  "message": {
    "role": "assistant",
    "content": "I'll help you check your permit status. For your security, I need to verify your identity first.",
    "widgets": [
      {
        "type": "ticket-verification",
        "data": {
          "onSubmit": "handleTicketVerification",
          "placeholder": "e.g., PER-2024-1234 or WRK-2024-5678"
        }
      }
    ]
  }
}
```

---

### 2. 📋 Permit Status Widget

**Purpose**: Display complete permit/document status inline with all details

**When to use**:
- After successful ticket verification
- User wants to see their application status
- User asks "where is my permit?"

**Features**:
- ✅ Full status display (Pending, Processing, Approved, Rejected, Expired)
- ✅ Timeline info (submitted date, last updated)
- ✅ Current stage visualization
- ✅ Next action required alerts
- ✅ Estimated completion date
- ✅ Notes from reviewers
- ✅ Downloadable related documents
- ✅ Quick action buttons (View Full Details, Download Receipt)

**AI Response Example**:
```json
{
  "message": {
    "role": "assistant",
    "content": "Great! I found your Work Permit application. Here's the current status:",
    "widgets": [
      {
        "type": "permit-status",
        "data": {
          "ticketNumber": "WRK-2024-5678",
          "status": "processing",
          "type": "Work Permit Application",
          "submittedDate": "Jan 15, 2025",
          "lastUpdated": "Jan 18, 2025",
          "currentStage": "Document Review - Medical Clearance",
          "nextAction": "Please upload your health insurance certificate",
          "estimatedCompletion": "Jan 25, 2025",
          "notes": "Your passport and employment contract have been verified. Awaiting medical documents.",
          "documentLinks": [
            {
              "name": "Application Receipt.pdf",
              "url": "/downloads/WRK-2024-5678-receipt.pdf"
            },
            {
              "name": "Requirements Checklist.pdf",
              "url": "/downloads/requirements-checklist.pdf"
            }
          ]
        }
      }
    ],
    "metadata": {
      "suggestions": [
        "Upload health certificate",
        "View full timeline",
        "Contact support team"
      ]
    }
  }
}
```

---

### 3. 📤 Upload Guide Widget

**Purpose**: Step-by-step upload instructions with interactive guidance

**When to use**:
- User asks "how do I upload documents?"
- User needs help with document requirements
- User is at a stage requiring document upload

**Features**:
- ✅ Required documents checklist
- ✅ Step-by-step progress tracking
- ✅ Visual step completion indicators
- ✅ Active step highlighting
- ✅ Action buttons for each step
- ✅ Helpful tips section
- ✅ Format and size requirements

**AI Response Example**:
```json
{
  "message": {
    "role": "assistant",
    "content": "I'll guide you through uploading your health certificate step-by-step:",
    "widgets": [
      {
        "type": "upload-guide",
        "data": {
          "documentType": "Health Insurance Certificate",
          "currentStep": 1,
          "requirements": [
            "Valid health insurance certificate (PDF or JPG)",
            "Certificate must be in English or Amharic",
            "File size under 5MB",
            "Must be dated within last 3 months"
          ],
          "steps": [
            {
              "title": "Prepare your document",
              "description": "Scan or photograph your health certificate clearly",
              "completed": true
            },
            {
              "title": "Choose file to upload",
              "description": "Click the button below to select your file",
              "action": {
                "label": "Select File",
                "onClick": "openFileSelector"
              }
            },
            {
              "title": "Verify upload",
              "description": "Review the document preview before submitting",
              "completed": false
            },
            {
              "title": "Submit",
              "description": "Confirm and submit your document for review",
              "completed": false
            }
          ],
          "tips": [
            "Ensure all text in the document is clearly readable",
            "Remove any passwords from PDF files before uploading",
            "You can upload multiple files if needed",
            "Processing typically takes 1-2 business days"
          ]
        }
      }
    ]
  }
}
```

---

### 4. ⏱️ Process Timeline Widget

**Purpose**: Visual timeline showing all process stages and current status

**When to use**:
- User asks "what's the timeline?"
- User wants to understand the process
- User asks "how long will this take?"

**Features**:
- ✅ Visual timeline with connecting line
- ✅ Stage status indicators (Completed, Current, Pending, Skipped)
- ✅ Animated current stage (pulsing dot)
- ✅ Duration for each stage
- ✅ Completion dates for finished stages
- ✅ Total estimated time
- ✅ Stage descriptions

**AI Response Example**:
```json
{
  "message": {
    "role": "assistant",
    "content": "Here's your complete application timeline with all stages:",
    "widgets": [
      {
        "type": "process-timeline",
        "data": {
          "estimatedTotal": "10-14 days",
          "stages": [
            {
              "name": "Application Submission",
              "status": "completed",
              "date": "Jan 15, 2025",
              "description": "Application received and validated",
              "duration": "1 day"
            },
            {
              "name": "Document Verification",
              "status": "completed",
              "date": "Jan 17, 2025",
              "description": "Passport and employment contract verified",
              "duration": "2 days"
            },
            {
              "name": "Medical Review",
              "status": "current",
              "description": "Health certificate under review",
              "duration": "2-3 days"
            },
            {
              "name": "Background Check",
              "status": "pending",
              "description": "Security and criminal record verification",
              "duration": "3-5 days"
            },
            {
              "name": "Final Approval",
              "status": "pending",
              "description": "Management approval and permit issuance",
              "duration": "2 days"
            },
            {
              "name": "Permit Ready",
              "status": "pending",
              "description": "Permit available for collection or delivery",
              "duration": "1 day"
            }
          ]
        }
      }
    ]
  }
}
```

---

## Integration Flow

### Typical Customer Support Conversation Flow

```
User: "I want to check my work permit status"
  ↓
AI: Returns TICKET VERIFICATION WIDGET
  ↓
User: Enters "WRK-2024-5678"
  ↓
AI: Verifies ticket → Returns PERMIT STATUS WIDGET
  ↓
User: "I need to upload health certificate"
  ↓
AI: Returns UPLOAD GUIDE WIDGET (step-by-step)
  ↓
User: "How long will the whole process take?"
  ↓
AI: Returns PROCESS TIMELINE WIDGET
```

**Key Point**: User NEVER leaves the chat. Everything is inline!

---

## OpenAI Assistant Configuration

### Document Support Agent Prompt Enhancement

The `documentSupport` agent in `lib/openai/config.ts` should return these widgets based on user intent:

```typescript
// Example widget decision logic
if (userMessage.includes("status") || userMessage.includes("track")) {
  // First verify identity
  return ticketVerificationWidget
}

if (ticketVerified && userAsksAboutStatus) {
  // Show full status inline
  return permitStatusWidget
}

if (userAsksAboutUpload || nextActionRequiresUpload) {
  // Guide them through upload
  return uploadGuideWidget
}

if (userAsksAboutTimeline || userAsksHowLong) {
  // Show process timeline
  return processTimelineWidget
}
```

---

## Widget Styling

All widgets use **consistent dark theme** matching the SODO Hospital design:
- Background: `bg-gray-800`
- Borders: `border-gray-700`
- Text: `text-white` for primary, `text-gray-400` for secondary
- Accent: `text-green-400` and `bg-green-500` for active states
- Error: `text-red-400` for errors
- Warning: `text-amber-400` for warnings

---

## Why These Widgets "Shine" (The Sale Point)

### Traditional Support Systems:
❌ Chatbot asks question → Redirects to dashboard → User logs in → Finds page → Gets info

### SODO Hospital Support:
✅ Chatbot asks question → Shows widget inline → User gets complete info → Can take action immediately

### Benefits:
1. **Zero context switching** - Everything in one place
2. **Faster resolution** - No page reloads or navigation
3. **Better UX** - Visual, interactive, intuitive
4. **Security built-in** - Ticket verification before personal info
5. **Actionable** - Users can upload, download, verify in-chat
6. **Professional** - Beautiful UI that builds trust
7. **Complete information** - All details at a glance

---

## Future Enhancements

Potential additions to make these widgets even more powerful:

1. **Real-time Updates** - WebSocket integration for live status changes
2. **File Upload Widget** - Direct file upload from chat
3. **Payment Widget** - Process payments inline
4. **Appointment Scheduler** - Book appointments in chat
5. **Signature Widget** - Digital signature collection
6. **Video Call Widget** - Escalate to video support
7. **Multi-language** - Amharic translations
8. **Ethiopian Calendar** - Date displays in Ethiopian calendar

---

## Testing the Widgets

### Demo Data

You can test these widgets by configuring the OpenAI assistant to return demo data:

```javascript
// In OpenAI function calling or assistant response
{
  widgets: [
    {
      type: "permit-status",
      data: {
        ticketNumber: "PER-2024-1234",
        status: "approved",
        type: "Residence ID Application",
        submittedDate: "Dec 1, 2024",
        lastUpdated: "Jan 10, 2025",
        currentStage: "Approved - Ready for Collection",
        notes: "Your residence ID has been approved! Please collect from main office.",
        estimatedCompletion: "Ready Now"
      }
    }
  ]
}
```

---

## Technical Implementation

### Files Modified:
- ✅ `components/ui/chat-widgets.tsx` - Added 4 new customer support widgets
- ✅ `components/ui/chat-message.tsx` - Registered widget types in switch statement
- ✅ `lib/openai/config.ts` - Enhanced documentSupport prompt with ticket verification
- ✅ `hooks/use-openai-chat.ts` - Enhanced welcome message

### Widget Types:
- `ticket-verification` → `TicketVerificationWidget`
- `permit-status` → `PermitStatusWidget`
- `upload-guide` → `UploadGuideWidget`
- `process-timeline` → `ProcessTimelineWidget`

### Props Interfaces:
All widgets have full TypeScript interfaces with comprehensive props for customization.

---

## Conclusion

These customer support widgets represent the **core value proposition** of the SODO Hospital system:

> **"Complete customer support without ever leaving the chat"**

This is what makes the system stand out from competitors and provides exceptional user experience that builds trust and satisfaction.

**The widgets are production-ready and waiting for OpenAI assistant integration!**
