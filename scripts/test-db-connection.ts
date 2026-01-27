import { checkDbConnection } from "../lib/db/check-connection"

async function main() {
  console.log("🔍 Checking database connection...")
  const result = await checkDbConnection()

  if (result.reachable) {
    console.log("✅ Database connection successful!")
  } else {
    console.error("❌ Database connection failed!")
    console.error(`Error: ${result.error}`)
    console.log("\n💡 Possible solutions:")
    console.log("1. Run: ./scripts/start-db-tunnel.sh in a separate terminal")
    console.log("2. Check if your DATABASE_URL in .env.local is correct")
    console.log("3. Ensure you have SSH access to the VPS")
  }
}

main().catch(console.error)
