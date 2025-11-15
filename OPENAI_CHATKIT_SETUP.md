# OpenAI ChatKit Integration Guide

This document explains the OpenAI ChatKit customer support integration for SODO Hospital.

## 🚀 Features Implemented

### ✅ Core Features
- **OpenAI Assistants API Integration** - Multi-agent architecture with intent classification
- **Context-Aware Sessions** - Maintains conversation context across pages
- **Thread Management** - Persistent conversation history with OpenAI Threads API
- **Streaming Responses** - Real-time message streaming for better UX

### ✅ Advanced Features
- **Co-pilot State Sharing** - Tracks user actions across the app (documents, tasks, searches)
- **Human-in-the-Loop** - Approval workflows for sensitive AI actions
- **Multi-Agent Routing** - Automatic routing to specialized agents (general, document, technical support)
- **Guardrails & Security** - Jailbreak detection, content moderation, input validation
- **Enhanced AI-UI Widgets** - Intent badges, approval widgets, context indicators, tool call widgets

### ✅ Integration Points
- **Landing Page** - Visitor support with general inquiries
- **Dashboard** - Authenticated user support with full context awareness
- **Server Actions** - Secure backend communication with OpenAI API

## 📋 Prerequisites

1. **OpenAI API Key**
   - Sign up at https://platform.openai.com
   - Generate an API key from your account dashboard
   - Add billing information (required for Assistants API)

2. **Create OpenAI Assistants**
   - Navigate to https://platform.openai.com/assistants
   - Create 4 assistants (see instructions below)

## 🔧 Setup Instructions

### Step 1: Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...

# OpenAI Assistant IDs (create these in OpenAI dashboard)
OPENAI_ASSISTANT_ID_CLASSIFICATION=asst_...
OPENAI_ASSISTANT_ID_GENERAL_SUPPORT=asst_...
OPENAI_ASSISTANT_ID_DOCUMENT_SUPPORT=asst_...
OPENAI_ASSISTANT_ID_TECHNICAL_SUPPORT=asst_...

# Optional: Model Configuration
# If not set, defaults to gpt-5.1-mini for efficiency
OPENAI_MODEL=gpt-5.1-mini
# Optional: dedicated classification model (defaults to gpt-5.1-mini)
OPENAI_CLASSIFICATION_MODEL=gpt-5.1-mini
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000

# Feature Flags
ENABLE_HUMAN_IN_LOOP=true
ENABLE_GUARDRAILS=true
```

### Step 2: Create OpenAI Assistants

Create 4 assistants in the OpenAI dashboard with the following configurations:

#### 1. Classification Assistant

**Name:** SODO Classification Agent
**Model:** gpt-4-turbo-preview
**Instructions:** Copy from `lib/openai/config.ts` → `SYSTEM_PROMPTS.classification`
**Functions/Tools:** None required
**Save the Assistant ID** → Add to `OPENAI_ASSISTANT_ID_CLASSIFICATION`

#### 2. General Support Assistant

**Name:** SODO General Support
**Model:** gpt-4-turbo-preview
**Instructions:** Copy from `lib/openai/config.ts` → `SYSTEM_PROMPTS.generalSupport`
**Functions/Tools:** None (can add custom tools later)
**Save the Assistant ID** → Add to `OPENAI_ASSISTANT_ID_GENERAL_SUPPORT`

#### 3. Document Support Assistant

**Name:** SODO Document Specialist
**Model:** gpt-4-turbo-preview
**Instructions:** Copy from `lib/openai/config.ts` → `SYSTEM_PROMPTS.documentSupport`
**Functions/Tools:**
- File Search (enable if you have documents to search)
- Optional: Add custom tools for document operations
**Save the Assistant ID** → Add to `OPENAI_ASSISTANT_ID_DOCUMENT_SUPPORT`

#### 4. Technical Support Assistant

**Name:** SODO Technical Support
**Model:** gpt-4-turbo-preview
**Instructions:** Copy from `lib/openai/config.ts` → `SYSTEM_PROMPTS.technicalSupport`
**Functions/Tools:** None
**Save the Assistant ID** → Add to `OPENAI_ASSISTANT_ID_TECHNICAL_SUPPORT`

### Step 3: Install Dependencies

```bash
npm install
```

Dependencies installed:
- `openai` - Official OpenAI SDK
- `ai` - Vercel AI SDK for streaming support

### Step 4: Integration in Your App

#### Option A: Landing Page (Visitor Support)

```tsx
import { OpenAIChatWidget } from "@/components/ui/openai-chat-widget"

export default function LandingPage() {
  return (
    <div>
      {/* Your landing page content */}

      <OpenAIChatWidget
        position="landing"
        enableCopilot={false}
      />
    </div>
  )
}
```

#### Option B: Dashboard (Authenticated User)

```tsx
import { OpenAIChatWidget } from "@/components/ui/openai-chat-widget"

export default function DashboardLayout({ user }) {
  return (
    <div>
      {/* Your dashboard content */}

      <OpenAIChatWidget
        userId={user.id}
        userName={user.name}
        userEmail={user.email}
        userRole={user.role}
        position="dashboard"
        enableCopilot={true}
      />
    </div>
  )
}
```

### Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your landing page or dashboard

3. Click the chat widget button (floating button with AI icon)

4. Test conversations:
   - "What documents do I have?"
   - "Check my pending approvals"
   - "How do I submit a permit?"
   - "I'm having a technical issue"

## 🎯 Architecture Overview

### Multi-Agent System

```
User Message
    ↓
[Guardrails Check] → Reject if flagged
    ↓
[Classification Agent] → Determine intent
    ↓
[Router] → Route to specialized agent
    ↓
[Specialized Agent] → Generate response
    ↓
[Human-in-Loop] → Request approval if needed
    ↓
Response to User
```

### Context Management

```
Session Manager
    ├── User Context (ID, role, email)
    ├── Page Context (current page, filters)
    └── Copilot State
        ├── Recent Documents
        ├── Recent Tasks
        ├── Recent Searches
        ├── Current Filters
        └── Conversation Summary
```

### Thread Persistence

- Each session gets a unique OpenAI Thread ID
- Thread persists conversation history
- Context is added as additional instructions
- Thread can be resumed across page navigations

## 🔒 Security Features

### Guardrails

- **Jailbreak Detection:** Pattern matching for prompt injection attempts
- **Content Moderation:** OpenAI Moderation API for inappropriate content
- **Off-Topic Detection:** Prevents unrelated queries

### Human-in-the-Loop

Sensitive operations require approval:
- `delete_document`
- `update_permit_status`
- `modify_user_role`
- `bulk_update`
- `export_sensitive_data`

When a tool requires approval:
1. AI explains what it wants to do
2. Shows parameters and reasoning
3. User approves or rejects
4. Action executes only if approved

## 🎨 Enhanced UI Widgets

### Intent Badge
Shows how AI classified user's question with confidence score

### Approval Widget
Displays sensitive actions requiring confirmation with risk level

### Context Indicator
Shows what context AI is using (recent docs, tasks, page info)

### Tool Call Widget
Displays when AI is using tools with status (pending, running, completed)

### Copilot Suggestions
Proactive suggestions based on user's current context

## 📊 Co-pilot Features

### Automatic Context Tracking

The system automatically tracks:
- **Documents viewed:** Last 10 documents
- **Tasks interacted with:** Last 10 tasks
- **Search queries:** Last 10 searches
- **Current filters:** Active filter state
- **Conversation summary:** Summary of recent interactions

### Manual Context Updates

You can manually update copilot context:

```typescript
import { updateCopilotContext } from "@/lib/actions/v2/chat"

// When user views a document
await updateCopilotContext(sessionId, {
  recentDocumentId: "doc_123"
})

// When user performs a search
await updateCopilotContext(sessionId, {
  searchQuery: "pending permits"
})

// When user applies filters
await updateCopilotContext(sessionId, {
  filters: { status: "pending", department: "nursing" }
})
```

## 🛠️ Customization

### Adding Custom Tools

1. Define tool in OpenAI Assistant dashboard
2. Add tool to appropriate assistant
3. Handle tool calls in `lib/openai/service.ts`
4. Add to `SENSITIVE_TOOLS` if approval needed

### Adding New Agents

1. Create new assistant in OpenAI dashboard
2. Add system prompt to `SYSTEM_PROMPTS` in `lib/openai/config.ts`
3. Add assistant ID to config
4. Update classification logic to route to new agent

### Customizing Widgets

Widgets are defined in:
- `components/ui/ai-widgets.tsx` - Enhanced AI widgets
- `components/ui/approval-widget.tsx` - Approval interface
- `components/ui/chat-widgets.tsx` - Existing widget library

## 📈 Monitoring & Analytics

### Session Statistics

```typescript
import { getSessionStats } from "@/lib/actions/v2/chat"

const stats = await getSessionStats()
console.log(`Active sessions: ${stats.activeSessions}`)
```

### Debug Mode

Enable debug info in chat widget (development only):
- Shows session ID
- Shows user info
- Displays thread ID

## 🐛 Troubleshooting

### Issue: "Failed to create conversation thread"

**Solution:**
- Check OpenAI API key is valid
- Verify API key has access to Assistants API
- Ensure billing is set up on OpenAI account

### Issue: "Classification failed, defaulting to general support"

**Solution:**
- Verify Classification Assistant ID is correct
- Check assistant exists in OpenAI dashboard
- Ensure assistant has proper instructions

### Issue: "Content flagged by moderation API"

**Solution:**
- This is expected behavior for inappropriate content
- User will see generic error message
- Check logs for flagged content details

### Issue: Responses are slow

**Solutions:**
- Use `gpt-3.5-turbo` instead of `gpt-4` for faster responses
- Reduce `OPENAI_MAX_TOKENS` value
- Implement response caching for common queries

### Error Codes & User Messages

The chat backend returns structured `errorCode` values in `ChatResponse` to drive user-friendly error messages in the widget:

- `guardrail_blocked` – Guardrails or moderation blocked the request.  
  - UI message: explains that the request may violate safety policies and asks the user to rephrase.
- `thread_creation_failed` – Error creating an OpenAI thread.  
  - UI message: “I couldn’t start a new support session. Please wait a moment and try again.”
- `add_message_failed` – Error attaching the user message to the thread.  
  - UI message: asks the user to resend the message.
- `assistant_run_failed` – Error running the assistant on the thread.  
  - UI message: suggests retrying or contacting support if it continues.
- `openai_unavailable` – Reserved for when the OpenAI API is temporarily unavailable.  
  - UI message: explains the AI service is down and to try again later.
- `unknown` – Any other unexpected error.  
  - UI message: generic “unexpected error, please try again.”

These codes are defined in `lib/openai/types.ts` as `ChatErrorCode` and are interpreted on the client in `hooks/use-openai-chat.ts` to show consistent, friendly error messages.

## 📚 File Structure

```
lib/
├── openai/
│   ├── types.ts              # TypeScript types
│   ├── config.ts             # Configuration & prompts
│   ├── service.ts            # OpenAI service class
│   ├── session-manager.ts    # Session management
│   └── index.ts              # Main exports
├── actions/v2/
│   └── chat.ts               # Server actions
hooks/
├── use-openai-chat.ts        # OpenAI chat hook
└── use-chat.ts               # Original chat hook (legacy)
components/ui/
├── openai-chat-widget.tsx    # Main chat widget
├── approval-widget.tsx       # Approval UI
├── ai-widgets.tsx            # Enhanced widgets
├── chat-message.tsx          # Message display
└── chat-input.tsx            # Input field
```

## 🔗 Resources

- [OpenAI Assistants API Documentation](https://platform.openai.com/docs/assistants/overview)
- [OpenAI Threads API Guide](https://platform.openai.com/docs/assistants/how-it-works/managing-threads-and-messages)
- [OpenAI Moderation API](https://platform.openai.com/docs/guides/moderation)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review OpenAI API status: https://status.openai.com
3. Check your OpenAI usage limits and billing
4. Review server logs for detailed error messages

## 📝 License

This integration is part of the SODO Hospital project.
