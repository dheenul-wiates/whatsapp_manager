import { redirect } from "next/navigation"

export default function BusinessRedirectPage() {
  redirect("/onboarding?step=1")
}
