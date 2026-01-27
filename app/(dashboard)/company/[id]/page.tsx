import { getCompanyById } from "@/lib/actions/v2/companies"
import { notFound } from "next/navigation"
import { CompanyDetailPage } from "@/components/pages/company-detail-page"

interface CompanyPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { id } = await params

  const result = await getCompanyById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return <CompanyDetailPage initialData={result.data} />
}
