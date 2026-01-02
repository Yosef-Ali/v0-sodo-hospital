import { VehiclePage } from "@/components/pages/vehicle-page"
import { getVehicles, getVehicleStats } from "@/lib/actions/v2/vehicles"
import { unstable_cache } from "next/cache"

// Cache vehicle data for 60 seconds
const getCachedVehicleData = unstable_cache(
  async () => {
    const [vehiclesResult, statsResult] = await Promise.all([
      getVehicles({ limit: 100 }),
      getVehicleStats()
    ])

    return {
      vehicles: vehiclesResult.success ? vehiclesResult.data : [],
      stats: statsResult.success ? statsResult.data : { total: 0, inspection: 0, roadFund: 0, insurance: 0, roadTransport: 0 }
    }
  },
  ['vehicle-data'],
  {
    revalidate: 60,
    tags: ['vehicles']
  }
)

export default async function VehicleRoute() {
  const vehicleData = await getCachedVehicleData()
  return <VehiclePage initialData={vehicleData} />
}
