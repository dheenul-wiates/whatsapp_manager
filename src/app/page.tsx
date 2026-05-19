import { redirect } from "next/navigation"
import { getCurrentClientUser } from "@/lib/auth/client"

export default async function Home() {
  const user = await getCurrentClientUser()

  if (!user) redirect("/login")
  redirect(user.client.status === "ACTIVE" ? "/templates" : "/onboarding")
}
