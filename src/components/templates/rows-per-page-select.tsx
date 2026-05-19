"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RowsPerPageSelectProps {
  value: number
}

export function RowsPerPageSelect({ value }: RowsPerPageSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (newPageSize: string | null) => {
    if (!newPageSize) return

    const params = new URLSearchParams(searchParams.toString())
    params.set("page", "1") // Reset to page 1
    params.set("pageSize", newPageSize)
    router.push(`/templates?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] text-muted-foreground">Rows per page:</span>
      <Select value={String(value)} onValueChange={handleChange}>
        <SelectTrigger className="w-[70px] h-8 text-[13px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[5, 10, 15, 25, 50, 100].map(size => (
            <SelectItem key={size} value={String(size)}>{size}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
