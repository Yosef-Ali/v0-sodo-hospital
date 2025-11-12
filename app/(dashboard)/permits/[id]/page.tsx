import { PermitDetailPage } from "@/components/pages/permit-detail-page"

interface PermitPageProps {
  params: {
    id: string
  }
}

export default function PermitPage({ params }: PermitPageProps) {
  return <PermitDetailPage permitId={params.id} />
}
