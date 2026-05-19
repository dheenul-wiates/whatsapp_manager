"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import type { FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertCircle, Loader2, Plus, X, Hash, Link2, Phone, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VariablePreview } from "./variable-preview"
import { templateSchema, type TemplateFormValues } from "@/lib/validations/template"
import { useTemplateSubmitState } from "./template-submit-state"

interface TemplateFormProps {
  initialData?: Partial<TemplateFormValues> & { id?: string }
  onSubmit: (data: TemplateFormValues) => Promise<void>
  onSaveDraft?: (data: TemplateFormValues) => Promise<void>
  isEditing?: boolean
}

type ButtonSectionType = "NONE" | "QUICK_REPLY" | "CALL_TO_ACTION"
type TemplateCategory = TemplateFormValues["category"]
type TemplateButtonType = NonNullable<TemplateFormValues["buttons"]>[number]["type"]

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function inferButtonSectionType(buttons?: TemplateFormValues["buttons"]): ButtonSectionType {
  if (!buttons?.length) return "NONE"
  return buttons[0].type === "QUICK_REPLY" ? "QUICK_REPLY" : "CALL_TO_ACTION"
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="flex items-start gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-[12px] leading-snug text-red-700">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  )
}

// ─── Reusable section wrapper ───────────────────────────
function Section({
  step,
  title,
  hint,
  children,
  variant = "default",
}: {
  step: number
  title: string
  hint?: string
  children: React.ReactNode
  variant?: "default" | "amber"
}) {
  return (
    <div
      className={`rounded-2xl bg-white overflow-hidden ${
        variant === "amber"
          ? "ring-1 ring-amber-200/80 shadow-[0_1px_6px_rgba(251,191,36,0.12)]"
          : "ring-1 ring-zinc-900/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
      }`}
    >
      <div
        className={`px-5 py-3.5 border-b flex items-center gap-2.5 ${
          variant === "amber"
            ? "bg-amber-50/70 border-amber-100"
            : "bg-zinc-50/70 border-zinc-100/80"
        }`}
      >
        <span
          className={`w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
            variant === "amber"
              ? "bg-amber-500 text-white"
              : "bg-foreground text-background"
          }`}
        >
          {step}
        </span>
        <span className="text-[13px] font-semibold text-foreground">{title}</span>
        {hint && (
          <span className="text-[11px] text-muted-foreground ml-auto">{hint}</span>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

export function TemplateForm({ initialData, onSubmit, onSaveDraft, isEditing }: TemplateFormProps) {
  const router = useRouter()
  const { action: submitAction, isSubmitting, setAction: setSubmitAction } = useTemplateSubmitState()
  const [buttonSectionType, setButtonSectionType] = useState<ButtonSectionType>(
    () => inferButtonSectionType(initialData?.buttons)
  )
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      category: undefined,
      language: "en_US",
      body: "",
      bodySamples: [],
      buttons: [],
      ...initialData,
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue, getValues, control } = form

  const { fields: buttonFields, append: appendButton, remove: removeButton, replace: replaceButtons } =
    useFieldArray({ control, name: "buttons" })

  const bodyValue = useWatch({ control, name: "body" }) || ""
  const bodySamples = useWatch({ control, name: "bodySamples" }) || []
  const buttons = useWatch({ control, name: "buttons" }) || []
  const categoryValue = useWatch({ control, name: "category" })
  const languageValue = useWatch({ control, name: "language" })

  const detectedVars = useMemo(() => {
    const matches = [...bodyValue.matchAll(/\{\{(\d+)\}\}/g)]
    return [...new Set(matches.map((m) => parseInt(m[1])))].sort((a, b) => a - b)
  }, [bodyValue])

  useEffect(() => {
    if (categoryValue === "AUTHENTICATION") {
      const authBody = "Your code is {{1}}.\n\nFor your security, do not share this code."
      if (getValues("body") !== authBody) {
        setValue("body", authBody, { shouldValidate: true })
        // Clear variables
        setValue("bodySamples", ["123456"], { shouldValidate: true })
      }
      setButtonSectionType("NONE")
      replaceButtons([])
    }
  }, [categoryValue, setValue, getValues, replaceButtons])

  let bodyPlaceholder = "Start typing your message..."
  
  if (categoryValue === "MARKETING") {
    bodyPlaceholder = "Hi {{1}}, our Summer Sale starts now! Enjoy 20% off all items using code *{{2}}*."
  } else if (categoryValue === "UTILITY") {
    bodyPlaceholder = "Hi {{1}}, your order *{{2}}* has shipped! It will arrive on {{3}}."
  }

  const isAuth = categoryValue === "AUTHENTICATION"

  const insertVariable = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    const current = getValues("body")
    const maxNum = detectedVars.length > 0 ? Math.max(...detectedVars) : 0
    const variable = `{{${maxNum + 1}}}`
    const start = textarea.selectionStart ?? current.length
    const end = textarea.selectionEnd ?? current.length
    setValue("body", current.slice(0, start) + variable + current.slice(end), {
      shouldValidate: true,
    })
    setTimeout(() => {
      textarea.selectionStart = start + variable.length
      textarea.selectionEnd = start + variable.length
      textarea.focus()
    }, 0)
  }

  const handleButtonTypeChange = (type: ButtonSectionType) => {
    setButtonSectionType(type)
    if (type === "NONE") replaceButtons([])
    else if (type === "QUICK_REPLY") replaceButtons([{ type: "QUICK_REPLY", text: "" }])
    else replaceButtons([{ type: "URL", text: "", url: "" }])
  }

  const submitHandler = async (data: TemplateFormValues) => {
    try {
      setSubmitAction("review")
      await onSubmit(data)
      toast.success(isEditing ? "Template saved & submitted for review" : "Template submitted for review")
      const dest = isEditing && initialData?.id ? `/templates/${initialData.id}` : "/templates"
      router.push(dest)
      router.refresh()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Something went wrong. Please try again."))
    } finally {
      setSubmitAction(null)
    }
  }

  const invalidSubmitHandler = (validationErrors: FieldErrors<TemplateFormValues>) => {
    setSubmitAction(null)
    const count = Object.keys(validationErrors).length
    toast.warning(
      count > 1
        ? `Please fix ${count} highlighted fields before submitting.`
        : "Please fix the highlighted field before submitting."
    )
  }

  const { ref: rhfRef, ...bodyRegisterProps } = register("body")

  // Step counter — variable samples only shows if vars detected
  const sectionStep = { details: 1, body: 2, samples: 3, buttons: detectedVars.length > 0 ? 4 : 3 }

  return (
    <div className="flex gap-6 items-start">

      {/* ── Left: Form ─────────────────────────────── */}
      <form
        id="template-form"
        onSubmit={handleSubmit(submitHandler, invalidSubmitHandler)}
        className="flex-1 min-w-0 space-y-3.5"
      >

        {/* Section 1 — Template Details */}
        <Section step={sectionStep.details} title="Template Details">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className={`text-[13px] ${errors.name ? "text-destructive" : "text-foreground/80"}`}>
                Template Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. spring_sale_promo"
                {...register("name")}
                aria-invalid={!!errors.name}
                className={`h-9 text-[13px] ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.name
                ? <FieldError message={errors.name.message} />
                : <p className="text-[12px] text-muted-foreground">Lowercase letters, numbers and underscores only.</p>
              }
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={`text-[13px] ${errors.category ? "text-destructive" : "text-foreground/80"}`}>
                  Category
                </Label>
                <Select
                  value={categoryValue}
                  onValueChange={(val) => {
                    if (val) setValue("category", val as TemplateCategory, { shouldValidate: true })
                  }}
                  disabled={!isEditing}
                >
                  <SelectTrigger
                    aria-invalid={!!errors.category}
                    className={`h-9 text-[13px] ${errors.category ? "border-destructive" : ""}`}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="UTILITY">Utility</SelectItem>
                    <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={errors.category?.message} />
                {!isEditing && <p className="text-[12px] text-muted-foreground">Category is set from template type selection.</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[13px] text-foreground/80">Language</Label>
                <Select
                  value={languageValue}
                  onValueChange={(val) => {
                    if (val) setValue("language", val, { shouldValidate: true })
                  }}
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_US">English (US)</SelectItem>
                    <SelectItem value="en_GB">English (UK)</SelectItem>
                    <SelectItem value="es_ES">Spanish (Spain)</SelectItem>
                    <SelectItem value="pt_BR">Portuguese (BR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Section>

        {/* Section 2 — Message Body */}
        <Section
          step={sectionStep.body}
          title="Message Body"
          hint={`${bodyValue.length} / 1024`}
        >
          <div className="space-y-3">
            <div className="relative">
              <Textarea
                placeholder={bodyPlaceholder}
                disabled={isAuth}
                className={`min-h-[148px] resize-y text-[13px] pr-3 pb-10 ${
                  errors.body ? "border-destructive focus-visible:ring-destructive" : ""
                } ${isAuth ? "bg-zinc-100 text-zinc-500 cursor-not-allowed" : ""}`}
                aria-invalid={!!errors.body}
                {...bodyRegisterProps}
                ref={(el) => {
                  rhfRef(el)
                  textareaRef.current = el
                }}
              />
              {/* Add variable button — sits inside textarea bottom */}
              {!isAuth && (
                <button
                  type="button"
                  onClick={insertVariable}
                  className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[11px] font-medium text-primary hover:text-primary/80 bg-primary/8 hover:bg-primary/12 px-2.5 py-1 rounded-md transition-colors"
                >
                  <Hash className="w-3 h-3" />
                  Add Variable
                </button>
              )}
            </div>
            <FieldError message={errors.body?.message} />
            
            {isAuth ? (
              <p className="text-[12px] text-muted-foreground leading-relaxed mt-2">
                Meta enforces a strict, standard format for authentication. Custom text is disabled.
              </p>
            ) : (
              <div className="bg-zinc-50 border border-zinc-100/80 rounded-xl p-3.5 mt-3 shadow-sm">
                <p className="text-[12px] font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                  Meta Message Formatting Rules
                </p>
                <ul className="text-[11.5px] text-muted-foreground space-y-1.5 list-disc pl-4 marker:text-zinc-300">
                  <li>Variables must be sequential (e.g., <code className="text-zinc-600 bg-white px-1 py-px rounded border border-zinc-100">{"{{1}}"}</code>, <code className="text-zinc-600 bg-white px-1 py-px rounded border border-zinc-100">{"{{2}}"}</code>)</li>
                  <li>Messages cannot start or end with a variable.</li>
                  <li>Variables cannot be placed directly next to each other.</li>
                  <li>
                    <strong>Tip:</strong> Wrap important text or variables in asterisks for bolding (e.g., *<code className="text-zinc-600 bg-white px-1 py-px rounded border border-zinc-100">{"{{1}}"}</code>*).
                  </li>
                </ul>
              </div>
            )}
          </div>
        </Section>

        {/* Section 3 — Variable Samples (conditional) */}
        {detectedVars.length > 0 && (
          <Section step={sectionStep.samples} title="Variable Samples" variant="amber" hint="Required by Meta">
            <div className="space-y-2.5">
              <p className="text-[12px] text-amber-700/80 -mt-1">
                Provide realistic example values so Meta reviewers can evaluate your template.
              </p>
              {detectedVars.map((varNum) => (
                <div key={varNum} className="flex items-center gap-3">
                  <span className="shrink-0 text-[11px] font-mono font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg w-[52px] text-center">
                    {`{{${varNum}}}`}
                  </span>
                  <Input
                    placeholder={`e.g. ${varNum === 1 ? "John Doe" : varNum === 2 ? "Order #1024" : "sample value"}`}
                    value={bodySamples[varNum - 1] || ""}
                    onChange={(e) => {
                      const updated = [...bodySamples]
                      updated[varNum - 1] = e.target.value
                      setValue("bodySamples", updated, { shouldValidate: true })
                    }}
                    className="h-8 text-[13px]"
                  />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Section 4 — Buttons */}
        <Section step={sectionStep.buttons} title="Interactive Buttons">
          <div className={`space-y-4 ${isAuth ? "opacity-50 pointer-events-none" : ""}`}>
            {/* Type tabs */}
            <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 p-1 gap-1">
              {(["NONE", "QUICK_REPLY", "CALL_TO_ACTION"] as ButtonSectionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleButtonTypeChange(type)}
                  className={`flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                    buttonSectionType === type
                      ? "bg-white text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type === "NONE" ? "None" : type === "QUICK_REPLY" ? "Quick Reply" : "Call to Action"}
                </button>
              ))}
            </div>

            {isAuth && (
              <p className="text-[12px] text-amber-600 bg-amber-50 rounded-lg p-3 font-medium text-center">
                Authentication templates automatically include a mandatory "Copy code" button.
              </p>
            )}

            {buttonSectionType === "NONE" && !isAuth && (
              <p className="text-[12px] text-muted-foreground italic text-center py-2">
                No buttons — message only.
              </p>
            )}

            {/* Quick Reply */}
            {buttonSectionType === "QUICK_REPLY" && (
              <div className="space-y-2.5">
                {buttonFields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-violet-50 border border-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-500 shrink-0">
                      {idx + 1}
                    </div>
                    <Input
                      placeholder={`Button label (e.g. ${["Yes", "No", "Learn More"][idx] || "Option"})`}
                      {...register(`buttons.${idx}.text`)}
                      aria-invalid={!!errors.buttons?.[idx]?.text}
                      className="h-8 text-[13px]"
                    />
                    {buttonFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeButton(idx)}
                        className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {buttonFields.map((field, idx) => (
                  <FieldError key={`${field.id}-error`} message={errors.buttons?.[idx]?.text?.message} />
                ))}
                {buttonFields.length < 3 && (
                  <button
                    type="button"
                    onClick={() => appendButton({ type: "QUICK_REPLY", text: "" })}
                    className="w-full h-8 flex items-center justify-center gap-1.5 text-[12px] font-medium text-muted-foreground border border-dashed border-zinc-300 rounded-lg hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add button
                  </button>
                )}
                <p className="text-[11px] text-muted-foreground">Up to 3 quick reply buttons · max 25 characters each.</p>
              </div>
            )}

            {/* Call to Action */}
            {buttonSectionType === "CALL_TO_ACTION" && (
              <div className="space-y-3">
                {buttonFields.map((field, idx) => {
                  const btnType = buttons[idx]?.type || "URL"
                  return (
                    <div key={field.id} className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <Select
                          value={btnType}
                          onValueChange={(val) => {
                            if (!val) return
                            setValue(`buttons.${idx}.type`, val as TemplateButtonType)
                            setValue(`buttons.${idx}.url`, "")
                            setValue(`buttons.${idx}.phone_number`, "")
                          }}
                        >
                          <SelectTrigger className="h-8 w-[200px] text-[12px] bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="URL">
                              <span className="flex items-center gap-2">
                                <Link2 className="w-3.5 h-3.5 text-blue-500" />
                                Visit Website
                              </span>
                            </SelectItem>
                            <SelectItem value="PHONE_NUMBER">
                              <span className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                Call Phone Number
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {buttonFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeButton(idx)}
                            className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="space-y-1.5">
                          <Label className="text-[12px] text-muted-foreground">Button Label</Label>
                          <Input
                            placeholder={btnType === "URL" ? "Visit Website" : "Call Us"}
                            {...register(`buttons.${idx}.text`)}
                            aria-invalid={!!errors.buttons?.[idx]?.text}
                            className="h-8 text-[13px] bg-white"
                          />
                          <FieldError message={errors.buttons?.[idx]?.text?.message} />
                        </div>
                        {btnType === "URL" && (
                          <div className="space-y-1.5">
                            <Label className="text-[12px] text-muted-foreground">Website URL</Label>
                            <Input
                              placeholder="https://example.com"
                              {...register(`buttons.${idx}.url`)}
                              aria-invalid={!!errors.buttons?.[idx]?.url}
                              className="h-8 text-[13px] bg-white"
                            />
                            <FieldError message={errors.buttons?.[idx]?.url?.message} />
                          </div>
                        )}
                        {btnType === "PHONE_NUMBER" && (
                          <div className="space-y-1.5">
                            <Label className="text-[12px] text-muted-foreground">Phone Number</Label>
                            <Input
                              placeholder="+1 234 567 8900"
                              {...register(`buttons.${idx}.phone_number`)}
                              aria-invalid={!!errors.buttons?.[idx]?.phone_number}
                              className="h-8 text-[13px] bg-white"
                            />
                            <FieldError message={errors.buttons?.[idx]?.phone_number?.message} />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {buttonFields.length < 2 && (
                  <button
                    type="button"
                    onClick={() => appendButton({ type: "URL", text: "", url: "" })}
                    className="w-full h-8 flex items-center justify-center gap-1.5 text-[12px] font-medium text-muted-foreground border border-dashed border-zinc-300 rounded-lg hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add button
                  </button>
                )}
                <p className="text-[11px] text-muted-foreground">Up to 2 buttons — one website link and one phone number.</p>
              </div>
            )}
          </div>
        </Section>

        {/* ── Submit actions ─────────────────────────── */}
        <div className="flex items-center justify-between pt-1 pb-2">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {/* Save as Draft - only show if handler provided and not editing */}
            {onSaveDraft && !isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  setSubmitAction("draft")
                  const isValid = await form.trigger()
                  if (!isValid) {
                    invalidSubmitHandler(form.formState.errors)
                    return
                  }

                  const data = form.getValues()
                  try {
                    await onSaveDraft(data)
                    toast.success("Template saved as draft")
                    router.push("/templates")
                    router.refresh()
                  } catch (error: unknown) {
                    toast.error(getErrorMessage(error, "Failed to save draft"))
                  } finally {
                    setSubmitAction(null)
                  }
                }}
                disabled={isSubmitting}
                className="h-9 px-5 text-[13px] font-semibold"
              >
                {isSubmitting && submitAction === 'draft' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save as Draft"
                )}
              </Button>
            )}

            {/* Submit for Review / Save Changes */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-5 text-[13px] font-semibold gap-2"
            >
              {isSubmitting && submitAction === 'review' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? "Saving & submitting…" : "Submitting…"}
                </>
              ) : (
                <>
                  {isEditing ? "Save & Submit for Review" : "Submit for Review"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* ── Right: Live Preview ─────────────────────── */}
      <div className="w-[320px] shrink-0 sticky top-[52px]">
        <VariablePreview body={bodyValue} samples={bodySamples} buttons={buttons} />
      </div>
    </div>
  )
}
