import { config } from "dotenv"
import { drizzle } from "drizzle-orm/neon-serverless"
import { Pool, neonConfig } from "@neondatabase/serverless"
import * as schema from "./schema"
import ws from "ws"

// Load environment variables from .env.local
config({ path: ".env.local" })

// Configure WebSocket for local development
if (process.env.NODE_ENV === "development") {
  neonConfig.webSocketConstructor = ws
}

// Create a connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL! })

// Create drizzle instance
export const db = drizzle(pool, { schema })

// Export schema for use in queries
export * from "./schema"
