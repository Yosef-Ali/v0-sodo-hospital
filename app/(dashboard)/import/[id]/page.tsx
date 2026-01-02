import { getImportById } from "@/lib/actions/v2/imports"
import { notFound } from "next/navigation"
import { ImportDetailPage } from "@/components/pages/import-detail-page"

interface ImportPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ImportPage({ params }: ImportPageProps) {
  const { id } = await params

  const result = await getImportById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return <ImportDetailPage initialData={result.data} />
}
