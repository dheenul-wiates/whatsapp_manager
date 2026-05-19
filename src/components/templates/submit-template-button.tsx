"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { submitTemplateForReview } from "@/server/actions/templates"
import { useOptionalTemplateSubmitState } from "./template-submit-state"

type SubmitTemplateButtonProps =
  | { templateId: string; formId?: never }
  | { templateId?: never; formId: string }

export function SubmitTemplateButton({ templateId, formId }: SubmitTemplateButtonProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const sharedSubmitState = useOptionalTemplateSubmitState()

  const buttonIsSubmitting = sharedSubmitState
    ? sharedSubmitState.action === "review"
    : isSubmitting

  const handleSubmit = async () => {
    if (!templateId) return

    setIsSubmitting(true)
    try {
      await submitTemplateForReview(templateId)
      toast.success("Template submitted for review")
      router.push(`/templates/${templateId}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit template for review")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button
      type={formId ? "submit" : "button"}
      size="sm"
      form={formId}
      onClick={formId ? undefined : handleSubmit}
      disabled={buttonIsSubmitting}
      className="h-8 px-3.5 text-[13px] gap-1.5 shrink-0"
    >
      {buttonIsSubmitting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Send className="w-3.5 h-3.5" />
      )}
      {buttonIsSubmitting ? "Submitting..." : "Submit for Review"}
    </Button>
  )
}
