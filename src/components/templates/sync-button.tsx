"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { syncWithMeta } from "@/server/actions/templates"

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const result = await syncWithMeta()
      if (result.success) {
        toast.success(`Synced successfully! Added/updated ${result.count} templates.`)
      } else {
        toast.error(result.error || "Failed to sync with Meta")
      }
    } catch {
      toast.error("An unexpected error occurred during sync")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleSync}
      disabled={isSyncing}
      className="h-8 px-3 text-[13px] gap-1.5 border-border/70 text-muted-foreground hover:text-foreground"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
      {isSyncing ? "Syncing..." : "Sync with Meta"}
    </Button>
  )
}
