import { PermitDetailPage } from "@/components/pages/permit-detail-page"
import { getPermitById } from "@/lib/actions/v2/permits"
import { unstable_cache } from "next/cache"
import { notFound } from "next/navigation"

interface PermitPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PermitPage({ params }: PermitPageProps) {
  const { id } = await params

  const getCachedPermit = unstable_cache(
    async (permitId: string) => {
      const result = await getPermitById(permitId)
      return result.success ? result.data : null
    },
    [`permit-${id}`],
    {
      revalidate: 60,
      tags: [`permit-${id}`]
    }
  )

  const permit = await getCachedPermit(id)

  if (!permit) {
    notFound()
  }

  return <PermitDetailPage initialData={permit} />
}
