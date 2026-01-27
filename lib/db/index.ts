import { drizzle } from "drizzle-orm/neon-serverless"
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres"
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless"
import { Pool as PgPool } from "pg"
import * as schema from "./schema"
import ws from "ws"

// Check if using Neon (has neon.tech in URL) or regular PostgreSQL
const isNeon = process.env.DATABASE_URL?.includes("neon.tech")

let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzlePg>

if (isNeon) {
  // Configure WebSocket for Neon
  if (process.env.NODE_ENV === "development") {
    neonConfig.webSocketConstructor = ws
  }
  const pool = new NeonPool({ connectionString: process.env.DATABASE_URL! })
  db = drizzle(pool, { schema })
} else {
  // Use standard PostgreSQL driver for Docker/local
  const pool = new PgPool({ connectionString: process.env.DATABASE_URL! })
  db = drizzlePg(pool, { schema }) as any
}

export { db }

// Export schema for use in queries
export * from "./schema"
