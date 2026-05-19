"use client"

import { Sidebar } from "./sidebar"

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background pb-10">
        {children}
      </main>
    </div>
  )
}
