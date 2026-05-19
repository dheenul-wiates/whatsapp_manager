import { MessageSquare, LogOut } from "lucide-react"
import { requireClientUser } from "@/lib/auth/client"
import { logoutClient } from "@/server/actions/client-auth"

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireClientUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-50 to-[#E9F8EF]/20 flex flex-col font-sans">
      {/* Premium Full-Screen Setup Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-zinc-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          
          {/* Logo & Setup Status indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#25D366] shrink-0">
              <MessageSquare className="w-[14px] h-[14px] text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <p className="text-[13px] font-bold text-foreground leading-none tracking-tight">
                WhatsApp Business Suite
              </p>
              <span className="inline-flex items-center gap-1 mt-0.5 sm:mt-0 text-[10px] font-semibold text-[#128C7E] bg-[#E9F8EF] px-1.5 py-0.5 rounded-full select-none max-w-fit">
                <span className="w-1 h-1 rounded-full bg-[#25D366] animate-pulse" />
                Setup Mode
              </span>
            </div>
          </div>

          {/* Secure Logout & Workspace User Panel */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-foreground leading-none">{user.email}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Workspace Setup</p>
            </div>
            <div className="h-6 w-px bg-zinc-200 hidden sm:block" />
            <form action={logoutClient}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold px-2.5 py-1.5 rounded-lg hover:bg-zinc-100/80 transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 text-muted-foreground/80" />
                <span>Log out</span>
              </button>
            </form>
          </div>

        </div>
      </header>

      {/* Main onboarding workspace area */}
      <main className="flex-1 w-full flex flex-col justify-start">
        {children}
      </main>
    </div>
  )
}
