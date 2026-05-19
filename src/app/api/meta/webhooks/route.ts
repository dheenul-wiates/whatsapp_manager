import crypto from "crypto"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"

type WebhookChange = {
  field?: string
  value?: {
    event?: string
    message_template_name?: string
    template_name?: string
    message_template_language?: string
    message_template_language_and_locale_code?: string
    template_language?: string
    message_template_category?: string
  }
}

type WebhookBody = {
  object?: string
  entry?: Array<{
    id?: string // WhatsApp Business Account ID
    changes?: WebhookChange[]
  }>
}

function verifySignature(rawBody: string, signature: string | null) {
  const appSecret = process.env.META_APP_SECRET
  if (!appSecret) return true
  if (!signature?.startsWith("sha256=")) return false

  const received = signature.slice("sha256=".length)
  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex")

  if (!/^[a-f0-9]+$/i.test(received) || received.length !== expected.length) {
    return false
  }

  return crypto.timingSafeEqual(
    Buffer.from(received, "hex"),
    Buffer.from(expected, "hex")
  )
}

function normalizeLocale(locale: string) {
  return locale.replace("-", "_")
}

async function handleTemplateStatusUpdate(change: WebhookChange, wabaId?: string) {
  const value = change.value
  const name = value?.message_template_name || value?.template_name
  const language =
    value?.message_template_language ||
    value?.message_template_language_and_locale_code ||
    value?.template_language
  const status = value?.event

  if (!name || !language || !status) return false

  const normalizedLanguage = normalizeLocale(language)

  // Resolve client by WABA ID to prevent cross-tenant updates
  let clientId: string | undefined
  if (wabaId) {
    const client = await prisma.client.findFirst({
      where: { whatsappBusinessAccountId: wabaId },
      select: { id: true },
    })
    clientId = client?.id
  }

  if (wabaId && !clientId) {
    console.warn(`[Webhook] Received template update for unknown WABA ID: ${wabaId}`)
    return false
  }

  const result = await prisma.template.updateMany({
    where: {
      name,
      ...(clientId && { clientId }),
      OR: [
        { language },
        { language: normalizedLanguage },
      ],
    },
    data: {
      status,
      ...(value?.message_template_category && { category: value.message_template_category }),
    },
  })

  return result.count > 0
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get("hub.mode")
  const token = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")

  if (
    mode === "subscribe" &&
    token &&
    token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN &&
    challenge
  ) {
    return new Response(challenge, { status: 200 })
  }

  return new Response("Forbidden", { status: 403 })
}

export async function POST(request: Request) {
  const rawBody = await request.text()

  if (!verifySignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return new Response("Invalid signature", { status: 401 })
  }

  let body: WebhookBody
  try {
    body = JSON.parse(rawBody) as WebhookBody
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }
  let updated = 0

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== "message_template_status_update") continue
      if (await handleTemplateStatusUpdate(change, entry.id)) updated++
    }
  }

  if (updated > 0) {
    revalidatePath("/templates")
  }

  return NextResponse.json({ received: true, updated })
}

