"use client"

import { Copy } from "lucide-react"
import { toast } from "sonner"

interface CopyButtonProps {
  text: string
  label?: string
}

export function CopyButton({ text, label = "Copy to clipboard" }: CopyButtonProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1 hover:bg-zinc-100 rounded transition-colors"
      title={label}
    >
      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
    </button>
  )
}
