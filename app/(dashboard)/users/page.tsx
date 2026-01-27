import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { UsersManagement } from "@/components/users/users-management"

export default async function UsersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return <UsersManagement />
}
