import * as z from "zod"

export const buttonSchema = z.object({
  type: z.enum(["QUICK_REPLY", "URL", "PHONE_NUMBER"]),
  text: z.string().min(1, "Button text is required").max(25, "Max 25 characters"),
  url: z.string().optional(),
  phone_number: z.string().optional(),
})

export const templateSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-z0-9_]+$/, "Name can only contain lowercase letters, numbers, and underscores (e.g. welcome_message)"),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"], {
    error: "Please select a category",
  }),
  language: z.string().min(2, "Language is required"),
  body: z.string()
    .min(1, "Message body cannot be empty")
    .max(1024, "Message body is too long (max 1024 characters)")
    .refine((val) => val.trim().length > 0, "Message body cannot be just whitespace"),
  bodySamples: z.array(z.string()).optional(),
  buttons: z.array(buttonSchema).max(3).optional(),
})

export type TemplateFormValues = z.infer<typeof templateSchema>
export type TemplateButton = z.infer<typeof buttonSchema>
