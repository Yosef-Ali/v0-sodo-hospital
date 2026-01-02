import { ImportPage } from "@/components/pages/import-page"
import { getImports, getImportStats } from "@/lib/actions/v2/imports"
import { unstable_cache } from "next/cache"

// Cache import data for 60 seconds
const getCachedImportData = unstable_cache(
  async () => {
    const [importsResult, statsResult] = await Promise.all([
      getImports({ limit: 100 }),
      getImportStats()
    ])

    return {
      imports: importsResult.success ? importsResult.data : [],
      stats: statsResult.success ? statsResult.data : { total: 0, pip: 0, singleWindow: 0, pending: 0, completed: 0 }
    }
  },
  ['import-data'],
  {
    revalidate: 60,
    tags: ['imports']
  }
)

export default async function ImportRoute() {
  const importData = await getCachedImportData()
  return <ImportPage initialData={importData} />
}
