import { getCurrentClientUser } from "@/lib/auth/client"
import { redirect } from "next/navigation"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentClientUser()

  if (user) {
    redirect(user.client.status === "ACTIVE" ? "/templates" : "/onboarding")
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-foreground">
      {children}
    </main>
  )
}
