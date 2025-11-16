// Role hierarchy and permissions utilities
// Note: Only async functions have "use server" directive

import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import { auth } from "@/auth"

// Role hierarchy and permissions
export const UserRole = {
  ADMIN: "ADMIN",
  HR_MANAGER: "HR_MANAGER",
  HR: "HR",
  LOGISTICS: "LOGISTICS",
  FINANCE: "FINANCE",
  USER: "USER",
} as const

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole]

// Permission checks for checklists
export function canViewChecklistTemplates(role: string): boolean {
  return [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.HR, UserRole.LOGISTICS].includes(
    role as UserRoleType,
  )
}

export function canManageChecklistTemplates(role: string): boolean {
  return [UserRole.ADMIN].includes(role as UserRoleType)
}

export function canViewPermitChecklist(role: string): boolean {
  return [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.HR, UserRole.LOGISTICS].includes(
    role as UserRoleType,
  )
}

export function canEditPermitChecklistItems(role: string): boolean {
  return [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.HR, UserRole.LOGISTICS].includes(
    role as UserRoleType,
  )
}

// Permission checks for permits
export function canViewPermits(role: string): boolean {
  return [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.HR, UserRole.LOGISTICS].includes(
    role as UserRoleType,
  )
}

export function canCreatePermits(role: string): boolean {
  return [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.HR].includes(role as UserRoleType)
}

export function canApprovePermits(role: string): boolean {
  return [UserRole.ADMIN, UserRole.HR_MANAGER].includes(role as UserRoleType)
}

// Permission checks for people
export function canViewPeople(role: string): boolean {
  return [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.HR, UserRole.LOGISTICS].includes(
    role as UserRoleType,
  )
}

export function canManagePeople(role: string): boolean {
  return [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.HR].includes(role as UserRoleType)
}

// Get current user with role from database
export async function getCurrentUser() {
  "use server"

  try {
    const session = await auth()
    if (!session?.user?.email) return null

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    return dbUser || null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Get user role by ID
export async function getUserRole(userId: string): Promise<string | null> {
  "use server"

  try {
    const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1)

    return user?.role || null
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}

// Authorization wrapper for server actions
export async function requireRole(allowedRoles: UserRoleType[]) {
  "use server"

  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized: User not authenticated")
  }

  if (!allowedRoles.includes(user.role as UserRoleType)) {
    throw new Error("Forbidden: Insufficient permissions")
  }

  return user
}

// Check if user has any of the specified roles
export function hasRole(userRole: string, allowedRoles: UserRoleType[]): boolean {
  return allowedRoles.includes(userRole as UserRoleType)
}

// Check if user is admin
export function isAdmin(role: string): boolean {
  return role === UserRole.ADMIN
}

// Check if user is admin or HR manager
export function isAdminOrHRManager(role: string): boolean {
  return [UserRole.ADMIN, UserRole.HR_MANAGER].includes(role as UserRoleType)
}
