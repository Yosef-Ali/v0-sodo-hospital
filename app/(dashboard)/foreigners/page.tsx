import { ForeignersPage } from "@/components/pages/foreigners-page"
import { getPeople, getPeopleStats } from "@/lib/actions/v2/foreigners"
import { unstable_cache } from "next/cache"

// Cache people data for 60 seconds
const getCachedPeopleData = unstable_cache(
  async () => {
    const [peopleResult, statsResult] = await Promise.all([
      getPeople({ limit: 100 }),
      getPeopleStats()
    ])

    return {
      people: peopleResult.success && peopleResult.data ? peopleResult.data : [],
      stats: statsResult.success && statsResult.data ? statsResult.data : { total: 0, dependents: 0, withPermits: 0 },
      error: (!peopleResult.success && peopleResult.error) || (!statsResult.success && statsResult.error) || undefined
    }
  },
  ['people-data'],
  {
    revalidate: 60,
    tags: ['people']
  }
)

export default async function ForeignersRoute() {
  const peopleData = await getCachedPeopleData()
  return <ForeignersPage initialData={peopleData} />
}
