import type { Metadata } from "next"
import { requireAdmin } from "@/lib/auth/admin"
import NewClientForm from "./NewClientForm"

export const metadata: Metadata = { title: "Create Client" }

export default async function NewClientPage() {
  await requireAdmin()
  return <NewClientForm />
}
