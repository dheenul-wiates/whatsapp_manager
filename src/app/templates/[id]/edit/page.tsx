import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Megaphone, Bell, ShieldCheck } from "lucide-react"
import { getTemplate, updateTemplate, submitTemplateForReview } from "@/server/actions/templates"
import { TemplateForm } from "@/components/templates/template-form"
import { SubmitTemplateButton } from "@/components/templates/submit-template-button"
import { TemplateSubmitStateProvider } from "@/components/templates/template-submit-state"
import type { TemplateFormValues } from "@/lib/validations/template"

const CATEGORY_META = {
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
} as const

async function handleUpdate(id: string, data: TemplateFormValues) {
  "use server"
  await updateTemplate(id, {
    name: data.name,
    category: data.category,
    language: data.language,
    body: data.body,
    bodySamples: data.bodySamples,
    buttons: data.buttons,
  })
  await submitTemplateForReview(id)
}

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const template = await getTemplate(id)

  if (!template) {
    redirect("/templates")
  }

  // Check if template can be edited
  if (template.status === "APPROVED") {
    // Cannot edit approved templates - redirect to details page
    redirect(`/templates/${id}`)
  }

  const meta = CATEGORY_META[template.category as keyof typeof CATEGORY_META]
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
        <Link
          href={`/templates/${id}`}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          {template.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
        <span className="text-[13px] font-medium text-foreground">Edit</span>
      </div>

      <TemplateSubmitStateProvider>
        {/* ── Page title area ──────────────────────────── */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ring-1 ${meta.iconBg} ${meta.iconRing}`}>
                <Icon className={`w-6 h-6 ${meta.accent}`} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-0.5">
                  <h1 className="text-[22px] font-semibold tracking-tight text-foreground leading-none">
                    Edit Template
                  </h1>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
                    {meta.label}
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground">
                  Editing will reset status to DRAFT and require re-review by Meta.
                </p>
              </div>
            </div>

            {template.status === "DRAFT" && (
              <SubmitTemplateButton formId="template-form" />
            )}
          </div>
        </div>

        {/* ── Form ────────────────────────────────────── */}
        <div className="px-6 pb-10">
          <TemplateForm
            initialData={{
              id: template.id,
              name: template.name,
              category: template.category as TemplateFormValues["category"],
              language: template.language,
              body: template.body,
              bodySamples: (template.bodySamples as string[]) || [],
              buttons: (template.buttons as TemplateFormValues["buttons"]) || [],
            }}
            onSubmit={handleUpdate.bind(null, id)}
            isEditing={true}
          />
        </div>
      </TemplateSubmitStateProvider>
    </div>
  )
}
