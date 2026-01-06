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

  const getCachedPerson = unstable_cache(
    async (personId: string) => {
      const result = await getPersonById(personId)
      return result.success ? result.data : null
    },
    [`person-v3-${id}`],
    {
      revalidate: 60,
      tags: [`person-v3-${id}`]
    }
  )

  const data = await getCachedPerson(id)

  if (!data) {
    notFound()
  }

  return <ForeignerDetailPage initialData={data} />
}

