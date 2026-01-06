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

  return <ForeignerDetailPage initialData={data} />
}

