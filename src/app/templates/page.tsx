import Link from "next/link"
import { getTemplates } from "@/server/actions/templates"
import { StatusBadge } from "@/components/templates/status-badge"
import { SyncButton } from "@/components/templates/sync-button"
import { CreateTemplateDialog } from "@/components/templates/create-template-dialog"
import { RowsPerPageSelect } from "@/components/templates/rows-per-page-select"
import { AutoSync } from "@/components/templates/auto-sync"
import { Pagination } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, MessageSquare, ChevronRight, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_TABS = [
  { label: "All", value: "ALL" },
  { label: "Approved", value: "APPROVED" },
  { label: "Pending", value: "PENDING" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Draft", value: "DRAFT" },
]

function buildTabUrl(search: string, category: string, status: string, page?: number, pageSize?: number) {
  const params = new URLSearchParams()
  if (search) params.set("search", search)
  if (category && category !== "ALL") params.set("category", category)
  if (status !== "ALL") params.set("status", status)
  if (page && page !== 1) params.set("page", String(page))
  if (pageSize && pageSize !== 15) params.set("pageSize", String(pageSize))
  const qs = params.toString()
  return `/templates${qs ? `?${qs}` : ""}`
}

function formatCategory(cat: string) {
  return cat.charAt(0) + cat.slice(1).toLowerCase()
}

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; status?: string; page?: string; pageSize?: string }>
}) {
  const resolved = await searchParams
  const search = resolved?.search || ""
  const category = resolved?.category || "ALL"
  const status = resolved?.status || "ALL"
  const page = Math.max(1, parseInt(resolved?.page || "1"))
  const pageSize = parseInt(resolved?.pageSize || "15")

  const { templates, pagination } = await getTemplates(search, category, status, page, pageSize)
  const hasActiveFilters = search !== "" || category !== "ALL" || status !== "ALL"

  return (
    <div className="flex flex-col gap-4 px-6 py-6 max-w-[1200px] mx-auto w-full">

      {/* ── Page Header ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground leading-none mb-1">
            Templates
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Manage your WhatsApp message templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SyncButton />
          <CreateTemplateDialog />
        </div>
      </div>

      {/* ── Unified Card: Tabs + Filters + Table + Pagination ── */}
      <div className="bg-white rounded-xl border border-border/60 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">

        {/* Status Tabs */}
        <div className="flex items-center gap-0 px-2 border-b border-border/50">
          {STATUS_TABS.map((tab) => {
            const active = status === tab.value
            return (
              <Link
                key={tab.value}
                href={buildTabUrl(search, category, tab.value, 1, pageSize)}
                className={cn(
                  "relative px-3.5 py-2.5 text-[13px] font-medium transition-colors duration-100 select-none whitespace-nowrap",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {active && (
                  <span className="absolute bottom-0 inset-x-1 h-[2px] bg-primary rounded-full" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Search + Category Row */}
        <form className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-zinc-50/40">
          <div className="relative flex-1 max-w-[260px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
            <Input
              name="search"
              placeholder="Search templates..."
              defaultValue={search}
              className="pl-8 h-8 text-[13px] bg-white border-border/60 focus-visible:bg-white placeholder:text-muted-foreground/40 shadow-none"
            />
            {status !== "ALL" && (
              <input type="hidden" name="status" value={status} />
            )}
          </div>
          <Select name="category" defaultValue={category}>
            <SelectTrigger className="w-[150px] h-8 text-[13px] bg-white border-border/60 shadow-none">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="MARKETING">Marketing</SelectItem>
              <SelectItem value="UTILITY">Utility</SelectItem>
              <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            className="h-8 px-3 text-[13px] border border-border/60"
          >
            Apply
          </Button>
        </form>

        {/* Content: empty state or table */}
        {templates.length === 0 ? (
          hasActiveFilters ? (
            /* ── No Results State ── */
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 mb-4">
                <Search className="w-5 h-5 text-zinc-300" />
              </div>
              <h3 className="text-[15px] font-semibold text-foreground mb-1.5">
                No results found
              </h3>
              <p className="text-[13px] text-muted-foreground max-w-[300px] leading-relaxed">
                No templates match your current filters. Try adjusting your search or clearing the filters.
              </p>
              <Link href="/templates" className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 text-[12px] border-border/60"
                >
                  Clear filters
                </Button>
              </Link>
            </div>
          ) : (
            /* ── Empty State ── */
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
              <div className="relative w-[96px] h-[80px] mx-auto mb-8">
                <div className="absolute inset-0 rounded-2xl bg-primary/5 border border-primary/10 rotate-3" />
                <div className="absolute inset-0 rounded-2xl bg-primary/8 border border-primary/15 rotate-1" />
                <div className="absolute inset-0 bg-white rounded-2xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.07)] flex flex-col items-start justify-center px-4 gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-primary/12 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-[10px] h-[10px] text-primary" />
                    </div>
                    <div className="h-2 w-[48px] bg-zinc-200/80 rounded-full" />
                  </div>
                  <div className="space-y-1.5 pl-7">
                    <div className="h-1.5 w-[44px] bg-zinc-100 rounded-full" />
                    <div className="h-1.5 w-[32px] bg-zinc-100 rounded-full" />
                  </div>
                </div>
              </div>

              <h3 className="text-[18px] font-semibold text-foreground mb-2 tracking-tight">
                No templates yet
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[360px] mb-6">
                Create reusable WhatsApp message templates to automate notifications, marketing campaigns, and customer communication.
              </p>

              <CreateTemplateDialog />

              <p className="mt-4 text-[11px] text-muted-foreground/50 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Templates require approval from Meta before use
              </p>
            </div>
          )
        ) : (
          /* ── Templates Table ── */
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/60 bg-zinc-50/60 w-[300px]">
                    Template
                  </TableHead>
                  <TableHead className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/60 bg-zinc-50/60">
                    Category
                  </TableHead>
                  <TableHead className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/60 bg-zinc-50/60">
                    Language
                  </TableHead>
                  <TableHead className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/60 bg-zinc-50/60">
                    Status
                  </TableHead>
                  <TableHead className="px-4 py-2.5 bg-zinc-50/60 w-[72px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template, i) => (
                  <TableRow
                    key={template.id}
                    className={cn(
                      "group border-b border-border/40 hover:bg-zinc-50/50 transition-colors duration-100",
                      i === templates.length - 1 && "border-b-0"
                    )}
                  >
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/8 shrink-0">
                          <MessageSquare className="w-[13px] h-[13px] text-primary" />
                        </div>
                        <span className="text-[13px] font-medium text-foreground font-mono tracking-tight">
                          {template.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-[3px] rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-600 tracking-wide">
                        {formatCategory(template.category)}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <span className="text-[13px] text-muted-foreground">
                        {template.language}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <StatusBadge status={template.status} />
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-right">
                      <Link href={`/templates/${template.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[12px] gap-0.5 text-muted-foreground/50 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                        >
                          View
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination inside card */}
            {pagination.total > 0 && (
              <div className="px-5 py-3 border-t border-border/50 bg-zinc-50/30 flex items-center justify-between">
                <p className="text-[12px] text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {(pagination.page - 1) * pagination.pageSize + 1}
                  </span>
                  –
                  <span className="font-medium text-foreground">
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                  </span>
                  {" "}of{" "}
                  <span className="font-medium text-foreground">{pagination.total}</span>
                  {" "}template{pagination.total !== 1 ? "s" : ""}
                </p>

                <div className="flex items-center gap-4">
                  {pagination.totalPages > 1 && (
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      buildUrl={(page) => buildTabUrl(search, category, status, page, pageSize)}
                    />
                  )}
                  <RowsPerPageSelect value={pageSize} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Auto-sync when templates are empty (no filters) */}
      <AutoSync isEmpty={pagination.total === 0 && !hasActiveFilters} />
    </div>
  )
}
