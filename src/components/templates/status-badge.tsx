type Status = "APPROVED" | "PENDING" | "REJECTED" | "DRAFT"

const STATUS_CONFIG: Record<
  Status,
  { dot: string; bg: string; text: string; label: string }
> = {
  APPROVED: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 border border-emerald-100",
    text: "text-emerald-700",
    label: "Approved",
  },
  PENDING: {
    dot: "bg-amber-400",
    bg: "bg-amber-50 border border-amber-100",
    text: "text-amber-700",
    label: "Pending",
  },
  REJECTED: {
    dot: "bg-red-400",
    bg: "bg-red-50 border border-red-100",
    text: "text-red-600",
    label: "Rejected",
  },
  DRAFT: {
    dot: "bg-zinc-400",
    bg: "bg-zinc-100 border border-zinc-200",
    text: "text-zinc-600",
    label: "Draft",
  },
}

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status.toUpperCase() as Status] ?? {
    dot: "bg-zinc-400",
    bg: "bg-zinc-100 border border-zinc-200",
    text: "text-zinc-600",
    label: status,
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-[3px] rounded-md text-[11px] font-medium tracking-wide ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  )
}
