import { PersonFormPage } from "@/components/pages/person-form-page"

interface EditPersonPageProps {
  params: {
    id: string
  }
}

export default function EditPersonPage({ params }: EditPersonPageProps) {
  return <PersonFormPage personId={params.id} mode="edit" />
}
