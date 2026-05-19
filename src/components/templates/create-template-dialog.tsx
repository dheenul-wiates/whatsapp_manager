"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Megaphone, Bell, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

const TEMPLATE_TYPES = [
  {
    id: "MARKETING",
    label: "Marketing",
    description: "Promotions, offers, and product announcements.",
    icon: Megaphone,
    accent: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
  },
  {
    id: "UTILITY",
    label: "Utility",
    description: "Order updates, delivery notifications, and transactional alerts.",
    icon: Bell,
    accent: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
  },
  {
    id: "AUTHENTICATION",
    label: "Authentication",
    description: "OTP codes and account verification messages.",
    icon: ShieldCheck,
    accent: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
  },
]

export function CreateTemplateDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleSelect = (type: string) => {
    setOpen(false)
    router.push(`/templates/create?type=${type}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-1.5 h-8 px-3 text-[13px]" />
        }
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
        Create Template
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Choose Template Type
          </DialogTitle>
          <DialogDescription>
            Select the type of message template you want to create.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 mt-2">
          {TEMPLATE_TYPES.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => handleSelect(type.id)}
                className={`group w-full text-left rounded-xl border ${type.border} ${type.bg} p-4 transition-all duration-150 hover:shadow-sm hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 border ${type.border} bg-white/60 dark:bg-black/20`}>
                      <Icon className={`w-4 h-4 ${type.accent}`} />
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${type.accent}`}>{type.label}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        {type.description}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 ${type.accent} opacity-0 group-hover:opacity-100 transition-opacity shrink-0`} />
                </div>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
