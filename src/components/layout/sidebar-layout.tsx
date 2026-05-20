"use client"

import { Sidebar } from "./sidebar"

export function SidebarLayout({ children, user }: { children: React.ReactNode, user?: any }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background flex flex-col relative">
        {user && (
          <header className="h-14 border-b border-border/50 bg-white/80 backdrop-blur-md px-6 flex items-center justify-end sticky top-0 z-40 shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-semibold text-foreground leading-none">
                  {user.client?.businessName || user.client?.businessLegalName || "Business Profile"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{user.email}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {(user.client?.businessName || user.email || "B")[0]}
              </div>
            </div>
          </header>
        )}
        <div className="flex-1 pb-10">
          {children}
        </div>
      </main>
    </div>
  )
}
