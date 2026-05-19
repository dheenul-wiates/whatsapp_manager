import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, ChevronRight, MessageSquare, Pencil, Calendar, Globe, Link2, Phone } from "lucide-react"
import { getTemplate } from "@/server/actions/templates"
import { StatusBadge } from "@/components/templates/status-badge"
import { VariablePreview } from "@/components/templates/variable-preview"
import { DeleteTemplateDialog } from "@/components/templates/delete-template-dialog"
import { CopyButton } from "@/components/ui/copy-button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TemplateButton } from "@/lib/validations/template"

function formatCategory(cat: string) {
  return cat.charAt(0) + cat.slice(1).toLowerCase()
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date))
}

// Reusable details card
function DetailsCard({
  title,
  children,
  className
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-xl bg-white ring-1 ring-zinc-900/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden", className)}>
      <div className="px-5 py-3 border-b bg-zinc-50/70 border-zinc-100/80">
        <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

// Detail row component
function DetailRow({
  icon: Icon,
  label,
  value,
  badge
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-zinc-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <div className="text-[13px] text-foreground">
          {badge || value}
        </div>
      </div>
    </div>
  )
}

export default async function TemplateDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const template = await getTemplate(id)

  if (!template) {
    redirect("/templates")
  }

  const bodySamples = (template.bodySamples as string[]) || []
  const buttons = (template.buttons as TemplateButton[]) || []

  // Extract variables from body
  const variables = [...new Set([...template.body.matchAll(/\{\{(\d+)\}\}/g)].map(m => m[1]))]

  return (
    <div className="min-h-full flex flex-col bg-zinc-50/50">

      {/* ── Sticky breadcrumb header ─────────────────── */}
      <div className="sticky top-0 z-10 h-[52px] flex items-center px-6 gap-2 bg-white/95 backdrop-blur-sm border-b border-zinc-100 shrink-0">
        <Link
          href="/templates"
          className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Templates
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
        <span className="text-[13px] font-medium text-foreground font-mono">{template.name}</span>
      </div>

      {/* ── Main content area ─────────────────────────── */}
      <div className="flex gap-6 px-6 py-6">

        {/* Left column: Template details */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Header with name, status, actions */}
          <div className="bg-white rounded-xl ring-1 ring-zinc-900/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.05)] px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h1 className="text-[20px] font-semibold tracking-tight text-foreground font-mono">
                      {template.name}
                    </h1>
                    <CopyButton text={template.name} label="Copy template name" />
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={template.status} />
                    <span className="text-[11px] text-muted-foreground">•</span>
                    <span className="inline-flex items-center px-2 py-[3px] rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-600">
                      {formatCategory(template.category)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Link href={`/templates/${template.id}/edit`}>
                  <Button size="sm" className="h-8 px-3 text-[13px] gap-1.5">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </Link>
                <DeleteTemplateDialog templateId={template.id} templateName={template.name} />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <DetailsCard title="Basic Information">
            <div className="space-y-1 divide-y divide-zinc-100">
              <DetailRow
                icon={Globe}
                label="Language"
                value={template.language}
              />
              <DetailRow
                icon={Calendar}
                label="Created"
                value={formatDate(template.createdAt)}
              />
              <DetailRow
                icon={Calendar}
                label="Last Updated"
                value={formatDate(template.updatedAt)}
              />
            </div>
          </DetailsCard>

          {/* Message Content */}
          <DetailsCard title="Message Content">
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Body Text
                </p>
                <div className="text-[13px] leading-relaxed text-foreground whitespace-pre-wrap font-mono bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                  {template.body.split(/(\{\{\d+\}\})/).map((part, i) => {
                    if (/\{\{\d+\}\}/.test(part)) {
                      return (
                        <span key={i} className="bg-amber-100 text-amber-700 px-1 py-0.5 rounded font-bold">
                          {part}
                        </span>
                      )
                    }
                    return part
                  })}
                </div>
              </div>

              {/* Variable samples */}
              {variables.length > 0 && bodySamples.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Variable Samples
                  </p>
                  <div className="space-y-2">
                    {variables.map((varNum, idx) => (
                      <div key={varNum} className="flex items-center gap-2 text-[13px]">
                        <span className="font-mono font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-1 rounded text-[11px] w-[50px] text-center">
                          {`{{${varNum}}}`}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-foreground">{bodySamples[idx] || "-"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DetailsCard>

          {/* Interactive Buttons */}
          <DetailsCard title="Interactive Buttons">
            {buttons.length === 0 ? (
              <p className="text-[13px] text-muted-foreground italic">No buttons configured</p>
            ) : (
              <div className="space-y-2">
                {buttons.map((btn, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      btn.type === "URL" ? "bg-blue-50" : btn.type === "PHONE_NUMBER" ? "bg-emerald-50" : "bg-violet-50"
                    )}>
                      {btn.type === "URL" && <Link2 className="w-4 h-4 text-blue-500" />}
                      {btn.type === "PHONE_NUMBER" && <Phone className="w-4 h-4 text-emerald-500" />}
                      {btn.type === "QUICK_REPLY" && <MessageSquare className="w-4 h-4 text-violet-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {btn.type === "URL" ? "Visit Website" : btn.type === "PHONE_NUMBER" ? "Call" : "Quick Reply"}
                      </p>
                      <p className="text-[13px] text-foreground font-medium">{btn.text}</p>
                      {btn.url && <p className="text-[12px] text-muted-foreground mt-0.5">{btn.url}</p>}
                      {btn.phone_number && <p className="text-[12px] text-muted-foreground mt-0.5">{btn.phone_number}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DetailsCard>
        </div>

        {/* Right column: Live preview */}
        <div className="w-[320px] shrink-0 sticky top-[68px]">
          <VariablePreview
            body={template.body}
            samples={bodySamples}
            buttons={buttons}
          />
        </div>
      </div>
    </div>
  )
}
