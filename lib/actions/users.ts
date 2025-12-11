"use server"

import { db, users, type User, type NewUser } from "@/lib/db"
import { eq, ilike, or } from "drizzle-orm"
import bcrypt from "bcryptjs"

// Get all users with optional search filter
export async function getUsers(search?: string) {
  try {
    let query = db.select().from(users)

    if (search) {
      query = query.where(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      ) as any
    }

    const result = await query

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return {
      success: false,
      error: "Failed to fetch users",
    }
  }
}

// Get user by ID
export async function getUserById(id: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!user) {
      return {
        success: false,
        error: "User not found",
      }
    }

    return {
      success: true,
      data: user,
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    return {
      success: false,
      error: "Failed to fetch user",
    }
  }
}

// Create new user
export async function createUser(data: {
  name: string
  email: string
  password: string
  role: "ADMIN" | "HR_MANAGER" | "HR" | "LOGISTICS" | "FINANCE" | "USER"
}) {
  try {
    // Check if email already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1)

    if (existing.length > 0) {
      return {
        success: false,
        error: "Email already exists",
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        updatedAt: new Date(),
      })
      .returning()

    return {
      success: true,
      data: newUser,
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return {
      success: false,
      error: "Failed to create user",
    }
  }
}

// Update user
export async function updateUser(
  id: string,
  data: {
    name?: string
    email?: string
    password?: string
    role?: "ADMIN" | "HR_MANAGER" | "HR" | "LOGISTICS" | "FINANCE" | "USER"
  }
) {
  try {
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!existingUser) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // If email is being changed, check if new email already exists
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1)

      if (emailExists.length > 0) {
        return {
          success: false,
          error: "Email already exists",
        }
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email
    if (data.role) updateData.role = data.role

    // Hash password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning()

    return {
      success: true,
      data: updatedUser,
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return {
      success: false,
      error: "Failed to update user",
    }
  }
}

// Delete user
export async function deleteUser(id: string) {
  try {
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!existingUser) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Delete user
    await db.delete(users).where(eq(users.id, id))

    return {
      success: true,
      message: "User deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    return {
      success: false,
      error: "Failed to delete user",
    }
  }
}

// Update user role
export async function updateUserRole(
  id: string,
  role: "ADMIN" | "HR_MANAGER" | "HR" | "LOGISTICS" | "FINANCE" | "USER"
) {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()

    if (!updatedUser) {
      return {
        success: false,
        error: "User not found",
      }
    }

    return {
      success: true,
      data: updatedUser,
    }
  } catch (error) {
    console.error("Error updating user role:", error)
    return {
      success: false,
      error: "Failed to update user role",
    }
  }
}
