import { getPersonById } from "@/lib/actions/v2/foreigners"
import { unstable_cache } from "next/cache"
import { notFound } from "next/navigation"
import { ForeignerDetailPage } from "@/components/pages/foreigner-detail-page"

interface PersonPageProps {
  params: Promise<{
    id: string
  }>
}

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params
  
  const result = await getPersonById(id)
  
  if (!result.success || !result.data) {
    notFound()
  }

  // Serialize to ensure safe passing to client component (handles Dates)
  const safeData = JSON.parse(JSON.stringify(result.data))

  return <ForeignerDetailPage initialData={safeData} />
}

