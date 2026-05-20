import { SidebarLayout } from "@/components/layout/sidebar-layout"
import { requireClientUser } from "@/lib/auth/client"

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireClientUser()

  return <SidebarLayout user={user}>{children}</SidebarLayout>
}
