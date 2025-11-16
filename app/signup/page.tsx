import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  // Redirect to login since we use Google OAuth (no separate signup)
  redirect('/login')
}
