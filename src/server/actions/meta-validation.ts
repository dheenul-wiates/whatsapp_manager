"use server"

import prisma from "@/lib/db"
import { requireClientUser } from "@/lib/auth/client"
import { decryptSecret } from "@/lib/token-encryption"
import { revalidatePath } from "next/cache"

const META_GRAPH_API_VERSION = process.env.WHATSAPP_GRAPH_API_VERSION || "v23.0"

type MetaWabaResponse = {
  id?: string
  name?: string
  timezone_id?: string
  message_template_namespace?: string
  error?: {
    message?: string
    code?: number
    error_subcode?: number
  }
}

type MetaPhoneNumbersResponse = {
  data?: Array<{
    id: string
    verified_name: string
    display_phone_number: string
    quality_rating: string
  }>
  error?: {
    message?: string
    code?: number
    error_subcode?: number
  }
}

export type ValidationResult =
  | { success: true; message: string }
  | { success: false; error: string }

export async function validateMetaConnection(): Promise<ValidationResult> {
  const user = await requireClientUser()
  const client = await prisma.client.findUnique({
    where: { id: user.clientId },
  })

  if (!client) {
    return { success: false, error: "Client not found." }
  }

  const wabaId = client.whatsappBusinessAccountId
  const phoneId = client.phoneNumberId
  const tokenSecret = client.whatsappAccessTokenSecret

  if (!wabaId || !phoneId || !tokenSecret) {
    return {
      success: false,
      error: "Missing WhatsApp WABA ID, Phone ID, or Access Token. Save them first before validating.",
    }
  }

  const token = decryptSecret(tokenSecret)
  if (!token) {
    return { success: false, error: "Unable to decrypt access token." }
  }

  try {
    // 1. Validate WABA ID and Token
    const wabaResponse = await fetch(
      `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${wabaId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    const wabaData: MetaWabaResponse = await wabaResponse.json()

    if (!wabaResponse.ok || wabaData.error) {
      const errMsg = wabaData.error?.message || "Failed to access WhatsApp Business Account"
      const errCode = wabaData.error?.code ? ` (code ${wabaData.error.code})` : ""
      await prisma.client.update({
        where: { id: client.id },
        data: { whatsappSetupStatus: "FAILED" },
      })
      revalidatePath("/onboarding")
      return { success: false, error: `Meta API Error: ${errMsg}${errCode}` }
    }

    // 2. Validate Phone Number ID belongs to the WABA
    const phoneResponse = await fetch(
      `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${wabaId}/phone_numbers`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    const phoneData: MetaPhoneNumbersResponse = await phoneResponse.json()

    if (!phoneResponse.ok || phoneData.error) {
      const errMsg = phoneData.error?.message || "Failed to fetch phone numbers"
      const errCode = phoneData.error?.code ? ` (code ${phoneData.error.code})` : ""
      await prisma.client.update({
        where: { id: client.id },
        data: { whatsappSetupStatus: "FAILED" },
      })
      revalidatePath("/onboarding")
      return { success: false, error: `Meta API Phone Error: ${errMsg}${errCode}` }
    }

    const matchingPhone = phoneData.data?.find((p) => p.id === phoneId)

    if (!matchingPhone) {
      await prisma.client.update({
        where: { id: client.id },
        data: { whatsappSetupStatus: "FAILED" },
      })
      revalidatePath("/onboarding")
      return {
        success: false,
        error: `Validation Error: Phone Number ID "${phoneId}" was not found under WABA "${wabaId}". Available IDs under this WABA: ${phoneData.data
          ?.map((p) => p.id)
          .join(", ") || "none"}`,
      }
    }

    // If both checks pass, set to CONNECTED and update status
    await prisma.client.update({
      where: { id: client.id },
      data: {
        whatsappSetupStatus: "CONNECTED",
        businessVerificationStatus: "VERIFIED", // Mark as verified since connection succeeds
      },
    })

    await prisma.auditLog.create({
      data: {
        actorType: "CLIENT",
        actorId: user.id,
        action: "META_CONNECTION_VALIDATED",
        targetType: "CLIENT",
        targetId: client.id,
        metadata: {
          wabaId,
          phoneNumberId: phoneId,
          verifiedName: matchingPhone.verified_name,
          displayNumber: matchingPhone.display_phone_number,
        },
      },
    })

    revalidatePath("/onboarding")
    return {
      success: true,
      message: `Successfully connected to Meta! Account: "${wabaData.name || "Default"}" • Phone: ${matchingPhone.display_phone_number} (${matchingPhone.verified_name})`,
    }
  } catch (error) {
    await prisma.client.update({
      where: { id: client.id },
      data: { whatsappSetupStatus: "FAILED" },
    })
    revalidatePath("/onboarding")
    return {
      success: false,
      error: `System Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`,
    }
  }
}
