/**
 * OpenAI Service
 * Core service for interacting with OpenAI Assistants API
 * Implements context-aware sessions, threading, and streaming
 */

import OpenAI from "openai"
import {
  AIMessage,
  AgentType,
  ChatResponse,
  ClassificationResult,
  GuardrailResult,
  SessionContext,
  ToolApproval,
} from "./types"
import { OPENAI_CONFIG, SYSTEM_PROMPTS, GUARDRAIL_PATTERNS, SENSITIVE_TOOLS } from "./config"

export class OpenAIService {
  private client: OpenAI
  private config = OPENAI_CONFIG

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || this.config.apiKey,
    })
  }

  /**
   * Check if guardrails pass for user input
   */
  async checkGuardrails(userMessage: string): Promise<GuardrailResult> {
    if (!this.config.enableGuardrails) {
      return { passed: true, flagged: false, confidence: 1 }
    }

    // Check for jailbreak attempts
    for (const pattern of GUARDRAIL_PATTERNS.jailbreak) {
      if (pattern.test(userMessage)) {
        return {
          passed: false,
          flagged: true,
          reason: "Potential jailbreak attempt detected",
          category: "jailbreak",
          confidence: 0.9,
        }
      }
    }

    // Use OpenAI moderation API for additional checks
    try {
      const moderation = await this.client.moderations.create({
        input: userMessage,
      })

      const result = moderation.results[0]
      if (result.flagged) {
        return {
          passed: false,
          flagged: true,
          reason: "Content flagged by moderation API",
          category: "inappropriate",
          confidence: Math.max(...Object.values(result.category_scores)),
        }
      }
    } catch (error) {
      console.error("Moderation API error:", error)
      // Continue without moderation if API fails
    }

    return { passed: true, flagged: false, confidence: 1 }
  }

  /**
   * Classify user intent to route to appropriate agent
   */
  async classifyIntent(
    userMessage: string,
    context: SessionContext
  ): Promise<ClassificationResult> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model || "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPTS.classification,
          },
          {
            role: "user",
            content: `User message: "${userMessage}"

Context:
- Current page: ${context.currentPage}
- User role: ${context.userRole || "guest"}
- Page context: ${JSON.stringify(context.pageContext || {})}

Classify this query and respond in JSON format:
{
  "intent": "category",
  "confidence": 0.0-1.0,
  "suggestedAgent": "agent_type",
  "reasoning": "brief explanation",
  "requiresHumanReview": boolean
}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: "json_object" },
      })

      const response = completion.choices[0].message.content
      if (!response) {
        throw new Error("No classification response")
      }

      const classification = JSON.parse(response)
      return {
        intent: classification.intent || "unknown",
        confidence: classification.confidence || 0.5,
        suggestedAgent: classification.suggestedAgent || "general_support",
        reasoning: classification.reasoning || "",
        requiresHumanReview: classification.requiresHumanReview || false,
      }
    } catch (error) {
      console.error("Classification error:", error)
      // Default to general support on error
      return {
        intent: "general_inquiry",
        confidence: 0.5,
        suggestedAgent: "general_support",
        reasoning: "Classification failed, defaulting to general support",
        requiresHumanReview: false,
      }
    }
  }

  /**
   * Create a new thread for conversation
   */
  async createThread(initialContext?: SessionContext): Promise<string> {
    try {
      const thread = await this.client.beta.threads.create({
        metadata: initialContext ? {
          userId: initialContext.userId || "",
          currentPage: initialContext.currentPage,
          sessionId: initialContext.sessionId,
        } : undefined,
      })
      return thread.id
    } catch (error) {
      console.error("Error creating thread:", error)
      throw new Error("Failed to create conversation thread")
    }
  }

  /**
   * Add a message to a thread
   */
  async addMessageToThread(threadId: string, message: string): Promise<void> {
    try {
      await this.client.beta.threads.messages.create(threadId, {
        role: "user",
        content: message,
      })
    } catch (error) {
      console.error("Error adding message to thread:", error)
      throw new Error("Failed to add message to thread")
    }
  }

  /**
   * Run an assistant on a thread with streaming support
   */
  async runAssistant(
    threadId: string,
    agentType: AgentType,
    context: SessionContext,
    onStream?: (chunk: string) => void
  ): Promise<AIMessage> {
    try {
      const assistantId = this.getAssistantId(agentType)

      // Add context as additional instructions
      const additionalInstructions = this.buildContextInstructions(context)

      const run = await this.client.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
        additional_instructions: additionalInstructions,
      })

      // Poll for completion (or use streaming in production)
      let runStatus = await this.client.beta.threads.runs.retrieve(threadId, run.id)

      while (runStatus.status === "queued" || runStatus.status === "in_progress") {
        await new Promise(resolve => setTimeout(resolve, 1000))
        runStatus = await this.client.beta.threads.runs.retrieve(threadId, run.id)

        if (onStream && runStatus.status === "in_progress") {
          onStream("...")
        }
      }

      if (runStatus.status === "requires_action") {
        // Handle tool calls requiring approval
        return await this.handleToolApproval(threadId, run.id, runStatus, context)
      }

      if (runStatus.status === "completed") {
        // Get the assistant's messages
        const messages = await this.client.beta.threads.messages.list(threadId)
        const lastMessage = messages.data[0]

        if (lastMessage.role === "assistant" && lastMessage.content[0].type === "text") {
          const content = lastMessage.content[0].text.value

          return {
            id: lastMessage.id,
            role: "assistant",
            content,
            timestamp: new Date(),
            threadId,
            runId: run.id,
            agentType,
            contextUsed: context,
          }
        }
      }

      throw new Error(`Run failed with status: ${runStatus.status}`)
    } catch (error) {
      console.error("Error running assistant:", error)
      throw error
    }
  }

  /**
   * Handle tool calls that require approval
   */
  private async handleToolApproval(
    threadId: string,
    runId: string,
    runStatus: any,
    context: SessionContext
  ): Promise<AIMessage> {
    if (!runStatus.required_action?.submit_tool_outputs) {
      throw new Error("No tool outputs required")
    }

    const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls
    const approvals: ToolApproval[] = []

    for (const toolCall of toolCalls) {
      const requiresApproval =
        this.config.enableHumanInLoop &&
        SENSITIVE_TOOLS.includes(toolCall.function.name)

      if (requiresApproval) {
        approvals.push({
          id: toolCall.id,
          toolName: toolCall.function.name,
          toolDescription: `Execute ${toolCall.function.name}`,
          parameters: JSON.parse(toolCall.function.arguments),
          reasoning: "This action requires confirmation",
          riskLevel: "high",
          requiresConfirmation: true,
          status: "pending",
          timestamp: new Date(),
        })
      }
    }

    // Return message indicating approval required
    return {
      id: `approval_${runId}`,
      role: "assistant",
      content: "This action requires your approval before proceeding.",
      timestamp: new Date(),
      threadId,
      runId,
      requiresApproval: true,
      approvalId: approvals[0]?.id,
      widgets: [
        {
          type: "approval-widget",
          approvals,
        },
      ],
    }
  }

  /**
   * Submit tool approval and continue run
   */
  async submitToolApproval(
    threadId: string,
    runId: string,
    toolCallId: string,
    approved: boolean
  ): Promise<void> {
    try {
      const output = approved
        ? JSON.stringify({ status: "approved", message: "User approved this action" })
        : JSON.stringify({ status: "rejected", message: "User rejected this action" })

      await this.client.beta.threads.runs.submitToolOutputs(threadId, runId, {
        tool_outputs: [
          {
            tool_call_id: toolCallId,
            output,
          },
        ],
      })
    } catch (error) {
      console.error("Error submitting tool approval:", error)
      throw error
    }
  }

  /**
   * Get assistant ID for agent type
   */
  private getAssistantId(agentType: AgentType): string {
    switch (agentType) {
      case "classification":
        return this.config.assistantIds.classification
      case "general_support":
        return this.config.assistantIds.generalSupport
      case "document_support":
        return this.config.assistantIds.documentSupport
      case "technical_support":
        return this.config.assistantIds.technicalSupport
      default:
        return this.config.assistantIds.generalSupport
    }
  }

  /**
   * Build context instructions for the assistant
   */
  private buildContextInstructions(context: SessionContext): string {
    return `
Current Context:
- User: ${context.userName || "Guest"} (${context.userRole || "visitor"})
- Page: ${context.currentPage}
- Session ID: ${context.sessionId}
${context.pageContext ? `- Page Data: ${JSON.stringify(context.pageContext, null, 2)}` : ""}

Use this context to provide relevant, personalized assistance.
Reference specific documents, tasks, or features the user is viewing if applicable.
    `.trim()
  }

  /**
   * Complete chat interaction with all steps
   */
  async processMessage(
    userMessage: string,
    context: SessionContext,
    threadId?: string,
    onStream?: (chunk: string) => void
  ): Promise<ChatResponse> {
    try {
      // Step 1: Check guardrails
      const guardrailCheck = await this.checkGuardrails(userMessage)
      if (!guardrailCheck.passed) {
        return {
          message: {
            id: `error_${Date.now()}`,
            role: "assistant",
            content: "I'm sorry, but I can't process that request. Please rephrase your question.",
            timestamp: new Date(),
          },
          status: "error",
          error: guardrailCheck.reason,
        }
      }

      // Step 2: Classify intent
      const classification = await this.classifyIntent(userMessage, context)

      // Step 3: Create or use existing thread
      const activeThreadId = threadId || (await this.createThread(context))

      // Step 4: Add user message to thread
      await this.addMessageToThread(activeThreadId, userMessage)

      // Step 5: Run appropriate agent
      const message = await this.runAssistant(
        activeThreadId,
        classification.suggestedAgent,
        context,
        onStream
      )

      // Step 6: Return response
      return {
        message: {
          ...message,
          intent: classification.intent,
          confidence: classification.confidence,
        },
        status: message.requiresApproval ? "pending_approval" : "success",
        requiresApproval: message.requiresApproval
          ? message.widgets?.find((w: any) => w.type === "approval-widget")?.approvals[0]
          : undefined,
      }
    } catch (error) {
      console.error("Error processing message:", error)
      return {
        message: {
          id: `error_${Date.now()}`,
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
          timestamp: new Date(),
        },
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

// Singleton instance
let openAIServiceInstance: OpenAIService | null = null

export function getOpenAIService(): OpenAIService {
  if (!openAIServiceInstance) {
    openAIServiceInstance = new OpenAIService()
  }
  return openAIServiceInstance
}
