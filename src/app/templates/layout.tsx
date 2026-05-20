import { SidebarLayout } from "@/components/layout/sidebar-layout"
import { requireClientUser } from "@/lib/auth/client"

export default async function TemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireClientUser({ requireActive: true })

  return <SidebarLayout user={user}>{children}</SidebarLayout>
}
