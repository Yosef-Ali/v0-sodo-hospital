import { seedMVP } from './lib/db/seed-mvp'

async function main() {
  console.log('🌱 Seeding production database...')
  await seedMVP()
  console.log('✅ Production database seeded successfully!')
  process.exit(0)
}

main().catch((error) => {
  console.error('❌ Error seeding database:', error)
  process.exit(1)
})
