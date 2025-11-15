import { PermitsPage } from "@/components/pages/permits-page"
import { getPermits, getPermitStats } from "@/lib/actions/v2/permits"
import { getPeople } from "@/lib/actions/v2/people"
import { unstable_cache } from "next/cache"

// Cache permits data for 60 seconds
const getCachedPermitsData = unstable_cache(
  async () => {
    const [permitsResult, statsResult, peopleResult] = await Promise.all([
      getPermits({}),
      getPermitStats(),
      getPeople({})
    ])

    return {
      permits: permitsResult.success ? permitsResult.data : [],
      stats: statsResult.success ? statsResult.data : { total: 0, byStatus: {}, byCategory: {} },
      people: peopleResult.success ? peopleResult.data : []
    }
  },
  ['permits-data'],
  {
    revalidate: 60,
    tags: ['permits']
  }
)

export default async function PermitsRoute() {
  const permitsData = await getCachedPermitsData()

  return <PermitsPage initialData={permitsData} />
}
