import { redirect } from "next/navigation"
import { ArrowLeft, Megaphone, Bell, ShieldCheck, ChevronRight } from "lucide-react"
import Link from "next/link"
import { TemplateForm } from "@/components/templates/template-form"
import { TemplateSubmitStateProvider } from "@/components/templates/template-submit-state"
import { createTemplate, createDraftTemplate } from "@/server/actions/templates"
import type { TemplateFormValues } from "@/lib/validations/template"

const VALID_TYPES = ["MARKETING", "UTILITY", "AUTHENTICATION"] as const
type TemplateCategory = (typeof VALID_TYPES)[number]

const TYPE_META: Record<
  TemplateCategory,
  {
    label: string
    icon: React.ElementType
    accent: string
    iconBg: string
    iconRing: string
    badge: string
  }
> = {
  MARKETING: {
    label: "Marketing",
    icon: Megaphone,
    accent: "text-violet-600",
    iconBg: "bg-violet-50",
    iconRing: "ring-violet-200",
    badge: "bg-violet-100 text-violet-700",
  },
  UTILITY: {
    label: "Utility",
    icon: Bell,
    accent: "text-blue-600",
    iconBg: "bg-blue-50",
    iconRing: "ring-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  AUTHENTICATION: {
    label: "Authentication",
    icon: ShieldCheck,
    accent: "text-emerald-600",
    iconBg: "bg-emerald-50",
    iconRing: "ring-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
  },
}

async function handleCreate(data: TemplateFormValues) {
  "use server"
  await createTemplate(data)
}

async function handleSaveDraft(data: TemplateFormValues) {
  "use server"
  await createDraftTemplate(data)
}

export default async function CreateTemplatePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const resolved = await searchParams
  const type = resolved?.type?.toUpperCase()

  if (!type || !VALID_TYPES.includes(type as TemplateCategory)) {
    redirect("/templates")
  }

  const category = type as TemplateCategory
  const meta = TYPE_META[category]
  const Icon = meta.icon

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
        <span className={`text-[13px] font-medium ${meta.accent}`}>
          {meta.label}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
        <span className="text-[13px] font-medium text-foreground">New Template</span>
      </div>

      <TemplateSubmitStateProvider>
        {/* ── Page title area ──────────────────────────── */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ring-1 ${meta.iconBg} ${meta.iconRing}`}>
              <Icon className={`w-6 h-6 ${meta.accent}`} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <h1 className="text-[22px] font-semibold tracking-tight text-foreground leading-none">
                  Create Template
                </h1>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
                  {meta.label}
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground">
                Templates require Meta approval before they can be sent to customers.
              </p>
            </div>
          </div>
        </div>

        {/* ── Form ────────────────────────────────────── */}
        <div className="px-6 pb-10">
          <TemplateForm
            initialData={{ name: "", category, language: "en_US", body: "" }}
            onSubmit={handleCreate}
            onSaveDraft={handleSaveDraft}
          />
        </div>
      </TemplateSubmitStateProvider>
    </div>
  )
}
