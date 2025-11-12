import { PersonDetailPage } from "@/components/pages/person-detail-page"

interface PersonPageProps {
  params: {
    id: string
  }
}

export default function PersonPage({ params }: PersonPageProps) {
  return <PersonDetailPage personId={params.id} />
}
