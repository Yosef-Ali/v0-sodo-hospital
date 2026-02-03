import { drizzle } from "drizzle-orm/neon-serverless"
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres"
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless"
import { Pool as PgPool } from "pg"
import * as schema from "./schema"
import ws from "ws"

// Check if using Neon (has neon.tech in URL) or regular PostgreSQL
const isNeon = process.env.DATABASE_URL?.includes("neon.tech")

import { NodePgDatabase } from "drizzle-orm/node-postgres"
import { NeonDatabase } from "drizzle-orm/neon-serverless"

let db: NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>

const globalForDb = globalThis as unknown as {
  conn: NeonPool | PgPool | undefined
}

if (isNeon) {
  // Configure WebSocket for Neon
  if (process.env.NODE_ENV === "development") {
    neonConfig.webSocketConstructor = ws
  }
  const pool = new NeonPool({ connectionString: process.env.DATABASE_URL! })
  db = drizzle(pool, { schema })
} else {
  // Use standard PostgreSQL driver for Docker/local
  // Use global cache to prevent connection exhaustion in dev
  const conn = globalForDb.conn ?? new PgPool({ connectionString: process.env.DATABASE_URL! })
  if (process.env.NODE_ENV !== "production") globalForDb.conn = conn

  db = drizzlePg(conn, { schema })
}

export { db }

// Export schema for use in queries
export * from "./schema"
