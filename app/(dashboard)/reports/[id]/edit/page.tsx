import { getReportById } from "@/lib/actions/v2/reports"
import { notFound } from "next/navigation"
import { EditReportClient } from "@/components/reports/edit-report-client"

interface EditReportPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditReportPage({ params }: EditReportPageProps) {
  const { id } = await params
  const result = await getReportById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return <EditReportClient report={result.data} />
}
