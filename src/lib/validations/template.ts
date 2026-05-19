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
}).superRefine((data, ctx) => {
  // Skip body validation for AUTHENTICATION since the body is auto-generated
  if (data.category === "AUTHENTICATION") return

  const body = data.body
  
  // Rule 1: Cannot start with a variable
  if (/^\s*\{\{\d+\}\}/.test(body)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["body"],
      message: "Message cannot start with a variable. Add some text before it.",
    })
  }
  
  // Rule 2: Cannot end with a variable
  if (/\{\{\d+\}\}\s*$/.test(body)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["body"],
      message: "Message cannot end with a variable. Add some punctuation or text after it.",
    })
  }

  // Rule 3: Cannot have consecutive variables
  if (/\{\{\d+\}\}[^a-zA-Z0-9]*\{\{\d+\}\}/.test(body)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["body"],
      message: "Variables cannot be placed next to each other. Add words between them.",
    })
  }

  // Rule 4: Variables must be sequential starting from 1
  const vars = [...body.matchAll(/\{\{(\d+)\}\}/g)].map((m) => parseInt(m[1], 10))
  if (vars.length > 0) {
    const uniqueVars = [...new Set(vars)].sort((a, b) => a - b)
    if (uniqueVars[0] !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body"],
        message: "Variables must start from {{1}}.",
      })
    }
    for (let i = 0; i < uniqueVars.length - 1; i++) {
      if (uniqueVars[i + 1] !== uniqueVars[i] + 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["body"],
          message: `Variables must be sequential. Missing {{${uniqueVars[i] + 1}}}.`,
        })
      }
    }
  }
})

export type TemplateFormValues = z.infer<typeof templateSchema>
export type TemplateButton = z.infer<typeof buttonSchema>
