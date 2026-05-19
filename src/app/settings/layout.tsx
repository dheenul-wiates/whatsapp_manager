import { SidebarLayout } from "@/components/layout/sidebar-layout"
import { requireClientUser } from "@/lib/auth/client"

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireClientUser()

  return <SidebarLayout>{children}</SidebarLayout>
}
