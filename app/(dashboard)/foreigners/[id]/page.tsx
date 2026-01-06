import { getPersonById } from "@/lib/actions/v2/foreigners"
import { unstable_cache } from "next/cache"
import { notFound } from "next/navigation"
import { ForeignerDetailPage } from "@/components/pages/foreigner-detail-page"

interface PersonPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params
  console.log(`Fetching person detail for id: ${id}`)

  const result = await getPersonById(id)
  
  if (!result.success || !result.data) {
    console.error(`Person fetch failed for ${id}:`, result.error)
    notFound()
  }

  const data = result.data

  /* DEBUG: Temporary simplified render */
  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold">Debug Page</h1>
      <pre className="mt-4 bg-gray-900 p-4 rounded">
        {JSON.stringify(data.person, null, 2)}
      </pre>
      <div className="mt-4">
        Permissions: {data.permits?.length || 0}
      </div>
    </div>
  )
  // return <ForeignerDetailPage initialData={data} />
}

