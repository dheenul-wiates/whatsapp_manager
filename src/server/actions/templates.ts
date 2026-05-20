"use server"

import { revalidatePath } from "next/cache"
import type { Prisma } from "@prisma/client"
import prisma from "@/lib/db"
import { requireClientUser } from "@/lib/auth/client"
import { decryptSecret } from "@/lib/token-encryption"

const META_GRAPH_API_VERSION = process.env.WHATSAPP_GRAPH_API_VERSION || "v23.0"

type MetaErrorResponse = {
  error?: {
    message?: string
    error_user_msg?: string
    code?: number
    error_subcode?: number
    error_data?: {
      details?: string
    }
    fbtrace_id?: string
  }
}

type TemplateButtonInput = {
  type: string
  text: string
  url?: string
  phone_number?: string
}

type TemplateInput = {
  name: string
  category: string
  language: string
  body: string
  bodySamples?: string[]
  buttons?: TemplateButtonInput[]
}

type MetaButton = {
  type: string
  text: string
  url?: string
  phone_number?: string
}

type MetaBodyComponent = {
  type: "BODY"
  text: string
  example?: {
    body_text: string[][]
  }
}

type MetaButtonsComponent = {
  type: "BUTTONS"
  buttons: MetaButton[]
}

type MetaComponent = MetaBodyComponent | MetaButtonsComponent

type MetaAuthBodyComponent = {
  type: "BODY"
  add_security_recommendation: boolean
}

type MetaAuthButtonsComponent = {
  type: "BUTTONS"
  buttons: Array<{
    type: "OTP"
    otp_type: "COPY_CODE"
    text: string
  }>
}

type MetaPayloadComponent = MetaComponent | MetaAuthBodyComponent | MetaAuthButtonsComponent

type MetaTemplate = {
  name: string
  language: string
  status: string
  category: string
  components?: MetaComponent[]
}

type MetaTemplateListResponse = MetaErrorResponse & {
  data?: MetaTemplate[]
  paging?: {
    next?: string
  }
}

type MetaTemplateCreateResponse = MetaErrorResponse & {
  id?: string
  status?: string
  category?: string
}

function metaGraphUrl(path: string) {
  return `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${path}`
}

function getMetaErrorMessage(responseData: MetaErrorResponse, fallback: string) {
  const error = responseData?.error
  if (!error) return fallback

  const parts = [
    error.error_user_msg || error.message || fallback,
    error.code ? `code ${error.code}` : undefined,
    error.error_subcode ? `subcode ${error.error_subcode}` : undefined,
    error.error_data?.details ? `details: ${error.error_data.details}` : undefined,
    error.fbtrace_id ? `fbtrace_id: ${error.fbtrace_id}` : undefined,
  ].filter(Boolean)

  const message = parts.join(" | ")

  if (error.code === 200) {
    return `${message}. The token can be valid and still fail here if the system user/app only has read access to this WhatsApp Business Account. In Meta Business Settings, assign the system user full control or template management access on the WABA asset, then regenerate a token with whatsapp_business_management.`
  }

  return message
}

function toMetaButton(btn: TemplateButtonInput): MetaButton {
  if (btn.type === "QUICK_REPLY") return { type: "QUICK_REPLY", text: btn.text }
  if (btn.type === "URL") return { type: "URL", text: btn.text, url: btn.url }
  return { type: "PHONE_NUMBER", text: btn.text, phone_number: btn.phone_number }
}

function buildMetaComponents(category: string, body: string, bodySamples?: string[], buttons?: TemplateButtonInput[]): MetaPayloadComponent[] {
  // Meta enforces a strict, pre-defined format for AUTHENTICATION templates.
  // Custom text in the BODY and custom buttons are NOT allowed.
  if (category === "AUTHENTICATION") {
    return [
      {
        type: "BODY",
        add_security_recommendation: true,
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "OTP",
            otp_type: "COPY_CODE",
            text: "Copy code",
          },
        ],
      },
    ]
  }

  const bodyComponent: MetaBodyComponent = { type: "BODY", text: body }
  if (bodySamples?.length) {
    bodyComponent.example = { body_text: [bodySamples] }
  }

  const components: MetaComponent[] = [bodyComponent]

  if (buttons?.length) {
    components.push({
      type: "BUTTONS",
      buttons: buttons.map(toMetaButton),
    })
  }

  return components
}

async function getClientMetaCredentials() {
  const user = await requireClientUser({ requireActive: true })
  
  if (!user.client.whatsappAccessTokenSecret || !user.client.whatsappBusinessAccountId) {
    throw new Error("Missing WhatsApp API credentials. Complete WhatsApp setup before submitting templates.")
  }

  const token = decryptSecret(user.client.whatsappAccessTokenSecret)
  const wabaId = user.client.whatsappBusinessAccountId

  return { user, token, wabaId }
}

async function submitTemplatePayload(data: TemplateInput) {
  const { token, wabaId } = await getClientMetaCredentials()

  console.log(`[DEBUG] submitTemplatePayload using token: ${token.substring(0, 10)}...${token.slice(-5)} for WABA: ${wabaId}`);
  const response = await fetch(
    metaGraphUrl(`${wabaId}/message_templates`),
    {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        language: data.language,
        category: data.category,
        components: buildMetaComponents(data.category, data.body, data.bodySamples, data.buttons),
      }),
    }
  )

  const responseData: MetaTemplateCreateResponse = await response.json()

  if (!response.ok) {
    throw new Error(getMetaErrorMessage(responseData, "Failed to submit template to Meta"))
  }

  return responseData.status || "PENDING"
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unknown error occurred"
}

function isTemplateButton(value: unknown): value is TemplateButtonInput {
  if (!value || typeof value !== "object") return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.type === "string" && typeof candidate.text === "string"
}

function readTemplateButtons(value: Prisma.JsonValue | null): TemplateButtonInput[] {
  return Array.isArray(value) ? value.filter(isTemplateButton) : []
}

function readBodySamples(value: Prisma.JsonValue | null): string[] {
  return Array.isArray(value) ? value.filter((sample): sample is string => typeof sample === "string") : []
}

export async function getTemplates(
  search?: string,
  category?: string,
  status?: string,
  page?: number,
  pageSize?: number
) {
  const user = await requireClientUser({ requireActive: true })
  const where: Prisma.TemplateWhereInput = {
    clientId: user.clientId,
  }

  if (search) {
    where.name = { contains: search }
  }

  if (category && category !== "ALL") {
    where.category = category
  }

  if (status && status !== "ALL") {
    where.status = status
  }

  // Calculate skip/take for pagination
  const skip = page && pageSize ? (page - 1) * pageSize : undefined
  const take = pageSize

  // Get total count for pagination metadata
  const total = await prisma.template.count({ where })

  const templates = await prisma.template.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take,
  })

  return {
    templates,
    pagination: {
      page: page || 1,
      pageSize: pageSize || total,
      total,
      totalPages: pageSize ? Math.ceil(total / pageSize) : 1,
      hasNext: page && pageSize ? page * pageSize < total : false,
      hasPrev: page ? page > 1 : false,
    }
  }
}

export async function getTemplate(id: string) {
  const user = await requireClientUser({ requireActive: true })
  return prisma.template.findFirst({
    where: { id, clientId: user.clientId },
  })
}

export async function createTemplate(data: TemplateInput) {
  const user = await requireClientUser({ requireActive: true })
  let status: string

  try {
    status = await submitTemplatePayload(data)
  } catch (error) {
    throw new Error(`Meta API Error: ${getErrorMessage(error)}`)
  }

  const template = await prisma.template.create({
    data: {
      clientId: user.clientId,
      name: data.name,
      category: data.category,
      language: data.language,
      body: data.body,
      status,
      ...(data.bodySamples && data.bodySamples.length > 0 && { bodySamples: data.bodySamples }),
      ...(data.buttons && data.buttons.length > 0 && { buttons: data.buttons }),
    },
  })

  revalidatePath("/templates")
  return template
}

export async function createDraftTemplate(data: TemplateInput) {
  const user = await requireClientUser({ requireActive: true })
  // Create template with DRAFT status WITHOUT Meta API submission
  const template = await prisma.template.create({
    data: {
      clientId: user.clientId,
      name: data.name,
      category: data.category,
      language: data.language,
      body: data.body,
      status: "DRAFT",
      ...(data.bodySamples && data.bodySamples.length > 0 && { bodySamples: data.bodySamples }),
      ...(data.buttons && data.buttons.length > 0 && { buttons: data.buttons }),
    },
  })

  revalidatePath("/templates")
  return template
}



export async function updateTemplate(
  id: string,
  data: {
    name?: string
    category?: string
    language?: string
    body?: string
    bodySamples?: string[]
    buttons?: TemplateButtonInput[]
    status?: string
  }
) {
  const user = await requireClientUser({ requireActive: true })
  // Validate template exists and is editable
  const existing = await prisma.template.findFirst({ where: { id, clientId: user.clientId } })

  if (!existing) {
    throw new Error("Template not found")
  }

  // Meta doesn't allow editing approved templates
  if (existing.status === "APPROVED" && data.body) {
    throw new Error("Cannot edit approved templates. Create a new version instead.")
  }

  const updateData: Prisma.TemplateUpdateInput = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.category !== undefined) updateData.category = data.category
  if (data.language !== undefined) updateData.language = data.language
  if (data.body !== undefined) updateData.body = data.body
  if (data.bodySamples !== undefined) updateData.bodySamples = data.bodySamples
  if (data.buttons !== undefined) updateData.buttons = data.buttons
  updateData.status = data.body ? "DRAFT" : (data.status || existing.status)

  const template = await prisma.template.update({
    where: { id },
    data: updateData,
  })

  revalidatePath("/templates")
  revalidatePath(`/templates/${id}`)
  revalidatePath(`/templates/${id}/edit`)
  return template
}

export async function submitTemplateForReview(id: string) {
  const user = await requireClientUser({ requireActive: true })
  const template = await prisma.template.findFirst({ where: { id, clientId: user.clientId } })
  if (!template) throw new Error("Template not found")
  if (template.status !== "DRAFT") throw new Error("Only draft templates can be submitted for review")

  const status = await submitTemplatePayload({
    name: template.name,
    language: template.language,
    category: template.category,
    body: template.body,
    bodySamples: readBodySamples(template.bodySamples),
    buttons: readTemplateButtons(template.buttons),
  })

  await prisma.template.update({
    where: { id },
    data: { status },
  })

  revalidatePath("/templates")
  revalidatePath(`/templates/${id}`)
  revalidatePath(`/templates/${id}/edit`)
}

export async function deleteTemplate(id: string) {
  const user = await requireClientUser({ requireActive: true })
  const template = await prisma.template.findFirst({ where: { id, clientId: user.clientId } })
  if (!template) return

  if (!user.client.whatsappAccessTokenSecret || !user.client.whatsappBusinessAccountId) return

  const token = decryptSecret(user.client.whatsappAccessTokenSecret)
  const wabaId = user.client.whatsappBusinessAccountId

  if (token && wabaId) {
    try {
      const response = await fetch(
        metaGraphUrl(`${wabaId}/message_templates?name=${template.name}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      
      const responseData = await response.json()
      
      if (!response.ok && responseData?.error?.code !== 100) {
        // Code 100 is typically "not found" / "does not exist", which is fine if it was only a local draft
        console.error("Failed to delete template from Meta:", getMetaErrorMessage(responseData, "Unknown error"))
      }
    } catch (error) {
      console.error("Error calling Meta API for deletion:", error)
    }
  }

  await prisma.template.delete({
    where: { id },
  })
  
  revalidatePath("/templates")
}

export async function syncWithMeta() {
  const user = await requireClientUser({ requireActive: true })
  if (!user.client.whatsappAccessTokenSecret || !user.client.whatsappBusinessAccountId) {
    return { success: false, error: "Missing WhatsApp API credentials. Complete WhatsApp setup first." }
  }

  const token = decryptSecret(user.client.whatsappAccessTokenSecret)
  const wabaId = user.client.whatsappBusinessAccountId

  try {
    let allMetaTemplates: MetaTemplate[] = []
    let nextUrl: string | undefined =
      metaGraphUrl(`${wabaId}/message_templates?limit=100`)

    // Fetch all pages using cursor-based pagination
    while (nextUrl) {
      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: getMetaErrorMessage(errorData, "Failed to fetch from Meta") }
      }

      const data: MetaTemplateListResponse = await response.json()
      allMetaTemplates = allMetaTemplates.concat(data.data || [])

      // Meta Graph API provides 'next' URL in paging object
      nextUrl = data.paging?.next
    }

    console.log(`Fetched ${allMetaTemplates.length} templates from Meta`)

    let updatedCount = 0
    let createdCount = 0

    // Update local DB with all Meta templates
    for (const metaTpl of allMetaTemplates) {
      try {
        // Extract body text from components
        const bodyComponent = metaTpl.components?.find((c) => c.type === "BODY")
        const bodyText = bodyComponent?.text || ""

        // Skip templates without body text
        if (!bodyText) {
          console.log(`Skipping template ${metaTpl.name} - no body text`)
          continue
        }

        // Extract buttons if they exist
        const buttonsComponent = metaTpl.components?.find((c) => c.type === "BUTTONS")
        const buttons = buttonsComponent?.buttons || []

        // Extract body samples if they exist
        const bodySamples = bodyComponent?.example?.body_text?.[0] || []

        // Find existing template by name and language to prevent duplicates
        const existing = await prisma.template.findFirst({
          where: {
            clientId: user.clientId,
            name: metaTpl.name,
            language: metaTpl.language,
          },
        })

        if (existing) {
          await prisma.template.update({
            where: { id: existing.id },
            data: {
              status: metaTpl.status,
              category: metaTpl.category,
              body: bodyText,
              ...(bodySamples && bodySamples.length > 0 && { bodySamples }),
              ...(buttons && buttons.length > 0 && { buttons }),
            },
          })
          updatedCount++
        } else {
          // Create it locally if it exists on Meta but not locally
          await prisma.template.create({
            data: {
              clientId: user.clientId,
              name: metaTpl.name,
              language: metaTpl.language,
              category: metaTpl.category,
              status: metaTpl.status,
              body: bodyText,
              ...(bodySamples && bodySamples.length > 0 && { bodySamples }),
              ...(buttons && buttons.length > 0 && { buttons }),
            },
          })
          createdCount++
        }
      } catch (err) {
        console.error(`Error processing template ${metaTpl.name}:`, err)
      }
    }

    console.log(`Sync complete: ${createdCount} created, ${updatedCount} updated`)

    revalidatePath("/templates")
    return { success: true, count: createdCount + updatedCount, created: createdCount, updated: updatedCount }
  } catch (error) {
    console.error("Sync error:", error)
    return { success: false, error: getErrorMessage(error) || "An error occurred during sync" }
  }
}
