import { redirect } from "next/navigation"

export default function WhatsappRedirectPage() {
  redirect("/onboarding?step=3")
}
