"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { syncWithMeta } from "@/server/actions/templates"
import { toast } from "sonner"

interface AutoSyncProps {
  isEmpty: boolean
}

export function AutoSync({ isEmpty }: AutoSyncProps) {
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState(false)
  const [hasSynced, setHasSynced] = useState(false)

  useEffect(() => {
    // Only auto-sync once when templates are empty
    if (isEmpty && !hasSynced && !isSyncing) {
      const performSync = async () => {
        setIsSyncing(true)
        try {
          const result = await syncWithMeta()
          if (result.success) {
            const created = "created" in result ? result.created : 0
            const updated = "updated" in result ? result.updated : 0
            toast.success(`Synced ${result.count} templates (${created} new, ${updated} updated)`)
            setHasSynced(true)

            // Force a hard refresh to show the templates
            setTimeout(() => {
              window.location.reload()
            }, 500)
          } else {
            toast.error(result.error || "Failed to sync templates")
            setIsSyncing(false)
          }
        } catch (error: unknown) {
          toast.error(error instanceof Error ? error.message : "Failed to sync templates")
          setIsSyncing(false)
        }
      }

      performSync()
    }
  }, [isEmpty, hasSynced, isSyncing, router])

  if (!isSyncing) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <div>
            <p className="text-[14px] font-semibold text-foreground">
              Syncing templates from Meta...
            </p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              This will only happen once
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
