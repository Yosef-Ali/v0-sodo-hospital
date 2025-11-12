import { PermitFormPage } from "@/components/pages/permit-form-page"

interface EditPermitPageProps {
  params: {
    id: string
  }
}

export default function EditPermitPage({ params }: EditPermitPageProps) {
  return <PermitFormPage permitId={params.id} mode="edit" />
}
