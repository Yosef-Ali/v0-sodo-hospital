
import { auth } from "@/auth"
import { z } from "zod"

export type ActionState<T> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

export type SafeActionFunc<TInput, TOutput> = (
  data: TInput,
  user: { id: string; role: string; email: string }
) => Promise<ActionState<TOutput>>

interface SafeActionOptions {
  requiredRole?: string | string[]
}

/**
 * Creates a safe server action with simplified authentication, authorization, and validation.
 */
export function createSafeAction<TInput, TOutput>(
  schema: z.Schema<TInput>,
  action: SafeActionFunc<TInput, TOutput>,
  options: SafeActionOptions = {}
) {
  return async (rawData: TInput): Promise<ActionState<TOutput>> => {
    try {
      // 1. Authentication Check
      const session = await auth()
      if (!session?.user || !session.user.email) {
        return { success: false, error: "Unauthorized: Please log in." }
      }

      const user = {
        id: session.user.id || "",
        email: session.user.email,
        role: (session.user as any).role || "USER",
      }

      // 2. Authorization Check (Role-based)
      if (options.requiredRole) {
        const requiredRoles = Array.isArray(options.requiredRole)
          ? options.requiredRole
          : [options.requiredRole]

        if (!requiredRoles.includes(user.role)) {
          console.warn(`[SafeAction] Access Denied: User ${user.email} (Role: ${user.role}) attempted restricted action.`)
          return { success: false, error: "Forbidden: You do not have permission to perform this action." }
        }
      }

      // 3. Input Validation
      const result = schema.safeParse(rawData)
      if (!result.success) {
        return {
          success: false,
          error: "Invalid input data",
          fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
        }
      }

      // 4. Execution
      return await action(result.data, user)
    } catch (error) {
      console.error("[SafeAction] Unhandled Error:", error)
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      }
    }
  }
}
