import { getVehicleById } from "@/lib/actions/v2/vehicles"
import { notFound } from "next/navigation"
import { VehicleDetailPage } from "@/components/pages/vehicle-detail-page"

interface VehiclePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { id } = await params

  const result = await getVehicleById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return <VehicleDetailPage initialData={result.data} />
}
