"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, AlertTriangle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { deleteTemplate } from "@/server/actions/templates"

interface DeleteTemplateDialogProps {
  templateId: string
  templateName: string
}

export function DeleteTemplateDialog({ templateId, templateName }: DeleteTemplateDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteTemplate(templateId)
      toast.success("Template deleted successfully")
      setOpen(false)
      router.push("/templates")
      router.refresh()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete template")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="inline-flex items-center justify-center h-8 px-3 text-[13px] gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border border-input bg-background rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        }
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <DialogTitle className="text-[17px]">Delete Template</DialogTitle>
          </div>
          <DialogDescription className="text-[13px] leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-mono font-semibold text-foreground">{templateName}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
            className="text-[13px]"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-[13px] gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
