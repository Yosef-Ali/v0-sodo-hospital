import { CompanyPage } from "@/components/pages/company-page"
import { getCompanies, getCompanyStats } from "@/lib/actions/v2/companies"
import { unstable_cache } from "next/cache"

// Cache company data for 60 seconds
const getCachedCompanyData = unstable_cache(
  async (): Promise<{
    companies: any[]
    stats: { total: number; documentPrep: number; applyOnline: number; approval: number; completed: number }
  }> => {
    const [companiesResult, statsResult] = await Promise.all([
      getCompanies({ limit: 100 }),
      getCompanyStats()
    ])

    return {
      companies: companiesResult.success ? companiesResult.data ?? [] : [],
      stats: statsResult.success && statsResult.data ? statsResult.data : { total: 0, documentPrep: 0, applyOnline: 0, approval: 0, completed: 0 }
    }
  },
  ['company-data'],
  {
    revalidate: 60,
    tags: ['companies']
  }
)

export default async function CompanyRoute() {
  const companyData = await getCachedCompanyData()
  return <CompanyPage initialData={companyData} />
}
