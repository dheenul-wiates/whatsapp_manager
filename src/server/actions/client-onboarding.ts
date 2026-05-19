"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { requireClientUser } from "@/lib/auth/client"
import { encryptSecret } from "@/lib/token-encryption"

function readString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

import { combinePhoneNumber } from "@/lib/country-codes"

export async function saveBusinessDetails(formData: FormData) {
  const user = await requireClientUser()

  const businessLegalName = readString(formData, "businessLegalName")
  const businessName = readString(formData, "businessName")
  const businessWebsite = readString(formData, "businessWebsite")
  const businessEmail = readString(formData, "businessEmail")
  const phoneCode = readString(formData, "phoneCountryCode")
  const phoneNumber = readString(formData, "phone")
  const phone = combinePhoneNumber(phoneCode, phoneNumber)
  const businessAddress = readString(formData, "businessAddress")
  const country = readString(formData, "country")
  const businessCategory = readString(formData, "businessCategory")
  const metaBusinessId = readString(formData, "metaBusinessId")

  if (!businessName || !businessLegalName || !businessEmail || !metaBusinessId) {
    redirect("/onboarding?step=1&error=required")
  }

  const existingClient = await prisma.client.findUnique({
    where: { id: user.clientId },
    select: { businessVerificationStatus: true },
  })

  const nextVerificationStatus = 
    existingClient?.businessVerificationStatus === "VERIFIED" 
      ? "VERIFIED" 
      : (metaBusinessId ? "PENDING" : "NOT_STARTED")

  await prisma.client.update({
    where: { id: user.clientId },
    data: {
      businessLegalName,
      businessName,
      businessWebsite,
      businessEmail,
      phone,
      businessAddress,
      country,
      businessCategory,
      metaBusinessId,
      businessVerificationStatus: nextVerificationStatus,
      status: user.client.status === "INVITED" ? "ONBOARDING" : user.client.status,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorType: "CLIENT",
      actorId: user.id,
      action: "BUSINESS_DETAILS_UPDATED",
      targetType: "CLIENT",
      targetId: user.clientId,
    },
  })

  revalidatePath("/onboarding")
  redirect("/onboarding?step=2")
}

export async function saveWhatsappDetails(formData: FormData) {
  const user = await requireClientUser()

  const whatsappBusinessAccountId = readString(formData, "whatsappBusinessAccountId")
  const phoneNumberId = readString(formData, "phoneNumberId")
  const accessToken = readString(formData, "accessToken")
  const webhookVerifyToken = readString(formData, "webhookVerifyToken")

  if (!whatsappBusinessAccountId || !phoneNumberId || !webhookVerifyToken) {
    redirect("/onboarding?step=3&error=required")
  }

  await prisma.client.update({
    where: { id: user.clientId },
    data: {
      whatsappBusinessAccountId,
      phoneNumberId,
      webhookVerifyToken,
      ...(accessToken && { whatsappAccessTokenSecret: encryptSecret(accessToken) }),
      whatsappSetupStatus: accessToken ? "PENDING" : "NOT_STARTED",
    },
  })

  await prisma.auditLog.create({
    data: {
      actorType: "CLIENT",
      actorId: user.id,
      action: "WHATSAPP_DETAILS_UPDATED",
      targetType: "CLIENT",
      targetId: user.clientId,
    },
  })

  revalidatePath("/onboarding")
  redirect("/onboarding?step=3")
}

export async function verifyMetaBusiness() {
  const user = await requireClientUser()

  await prisma.client.update({
    where: { id: user.clientId },
    data: {
      businessVerificationStatus: "VERIFIED",
    },
  })

  await prisma.auditLog.create({
    data: {
      actorType: "CLIENT",
      actorId: user.id,
      action: "BUSINESS_VERIFICATION_SIMULATED",
      targetType: "CLIENT",
      targetId: user.clientId,
    },
  })

  revalidatePath("/onboarding")
  redirect("/onboarding?step=4")
}

export async function finishOnboarding() {
  const user = await requireClientUser()
  const client = await prisma.client.findUnique({ where: { id: user.clientId } })

  if (!client?.businessLegalName || !client.metaBusinessId || !client.whatsappBusinessAccountId || !client.phoneNumberId) {
    redirect("/onboarding?error=incomplete")
  }

  await prisma.client.update({
    where: { id: user.clientId },
    data: {
      status: "ACTIVE",
      onboardedAt: new Date(),
      whatsappSetupStatus: client.whatsappSetupStatus === "NOT_STARTED" ? "PENDING" : client.whatsappSetupStatus,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorType: "CLIENT",
      actorId: user.id,
      action: "ONBOARDING_COMPLETED",
      targetType: "CLIENT",
      targetId: user.clientId,
    },
  })

  redirect("/templates")
}
