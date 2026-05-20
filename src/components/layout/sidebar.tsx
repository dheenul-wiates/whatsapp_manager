"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Inbox,
  MessageSquare,
  Megaphone,
  Users,
  Settings,
  LogOut,
  ClipboardCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutClient } from "@/server/actions/client-auth"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inbox", href: "/inbox", icon: Inbox },
  { name: "Templates", href: "/templates", icon: MessageSquare },
  { name: "Campaigns", href: "/campaigns", icon: Megaphone },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Onboarding", href: "/onboarding", icon: ClipboardCheck },
]

const bottomNavigation = [{ name: "Business Settings", href: "/settings", icon: Settings }]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <aside className="flex h-full w-56 flex-col bg-white border-r border-border/60 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 h-[60px] px-5 border-b border-border/50">
        <div className="flex items-center justify-center w-8 h-8 shrink-0">
          <Image src="/images/light-icon.png" alt="Convora" width={32} height={32} className="object-contain" />
        </div>
        <div className="flex flex-col">
          <p className="text-[14px] font-bold text-foreground leading-none tracking-tight">
            Convora
          </p>
          <p className="text-[10px] font-medium text-muted-foreground mt-[3px] tracking-wide">
            Quality conversations
          </p>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex flex-1 flex-col px-3 pt-5 pb-2 gap-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/50 px-2.5 mb-2 select-none">
          Main
        </p>
        {navigation.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-colors duration-150 select-none",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-[#606770] hover:bg-zinc-50 hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 inset-y-[6px] w-[3px] bg-primary rounded-r-full" />
              )}
              <item.icon
                className={cn(
                  "h-[15px] w-[15px] shrink-0",
                  active ? "text-primary" : "text-[#9EA3AC]"
                )}
                strokeWidth={active ? 2.25 : 1.9}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 pt-2 border-t border-border/50">
        {bottomNavigation.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-colors duration-150 select-none",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-[#606770] hover:bg-zinc-50 hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 inset-y-[6px] w-[3px] bg-primary rounded-r-full" />
              )}
              <item.icon
                className={cn(
                  "h-[15px] w-[15px] shrink-0",
                  active ? "text-primary" : "text-[#9EA3AC]"
                )}
                strokeWidth={active ? 2.25 : 1.9}
              />
              {item.name}
            </Link>
          )
        })}
        <form action={logoutClient} className="mt-1">
          <button
            type="submit"
            className="relative flex w-full items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium text-[#606770] transition-colors duration-150 hover:bg-zinc-50 hover:text-foreground"
          >
            <LogOut className="h-[15px] w-[15px] shrink-0 text-[#9EA3AC]" strokeWidth={1.9} />
            Log out
          </button>
        </form>
      </div>
    </aside>
  )
}
