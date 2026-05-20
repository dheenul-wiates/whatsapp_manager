"use server"

import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { verifyAccessKey } from "@/lib/access-keys"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { clearClientSession, setClientSession } from "@/lib/auth/client"

const SIGNUP_COOKIE_NAME = "wbm_signup_invite"

type SignupCookie = {
  clientId: string
  accessKeyId: string
  exp: number
}

import { cookies } from "next/headers"
import { decodeSession, encodeSession } from "@/lib/auth/session"

async function setSignupCookie(payload: SignupCookie) {
  const cookieStore = await cookies()
  const token = encodeSession({
    userId: payload.accessKeyId,
    clientId: payload.clientId,
    exp: payload.exp,
  })
  console.log("[setSignupCookie] Setting signup invite cookie:", {
    name: SIGNUP_COOKIE_NAME,
    payload,
    tokenLength: token.length
  })
  cookieStore.set({
    name: SIGNUP_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: false, // Explicitly false for local environments/proxies to prevent browser storage failures
    path: "/",
    maxAge: 60 * 15,
  })
}

async function getSignupCookie() {
  const cookieStore = await cookies()
  const rawCookie = cookieStore.get(SIGNUP_COOKIE_NAME)
  console.log("[getSignupCookie] Raw cookie object:", rawCookie)
  if (!rawCookie) {
    console.log("[getSignupCookie] Cookie not found in request headers!")
    return null
  }
  const payload = decodeSession(rawCookie.value)
  console.log("[getSignupCookie] Decoded payload:", payload)
  if (!payload) {
    console.log("[getSignupCookie] decodeSession returned null (possibly expired or invalid signature)")
    return null
  }
  return {
    clientId: payload.clientId,
    accessKeyId: payload.userId,
  }
}

async function clearSignupCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SIGNUP_COOKIE_NAME)
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export async function verifyClientInvite(formData: FormData) {
  const email = readString(formData, "email").toLowerCase()
  const accessKey = readString(formData, "accessKey")

  const client = await prisma.client.findUnique({
    where: { email },
    include: {
      accessKeys: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })

  const now = new Date()
  const matchingKey = client?.accessKeys.find((key) => {
    return key.expiresAt > now && !key.usedAt && verifyAccessKey(accessKey, key.keyHash)
  })

  if (!client || client.status === "SUSPENDED" || !matchingKey) {
    redirect("/signup?error=invite")
  }

  const existingUser = await prisma.clientUser.findUnique({ where: { email } })
  if (existingUser) redirect("/login?error=exists")

  await setSignupCookie({
    clientId: client.id,
    accessKeyId: matchingKey.id,
    exp: Date.now() + 1000 * 60 * 15,
  })

  redirect("/signup?step=account")
}

import { combinePhoneNumber } from "@/lib/country-codes"

export async function completeClientSignup(formData: FormData) {
  console.log("[completeClientSignup] Invoked")
  const invite = await getSignupCookie()
  console.log("[completeClientSignup] invite cookie payload:", invite)
  if (!invite) {
    console.log("[completeClientSignup] No invite payload found, redirecting to expired")
    redirect("/signup?error=expired")
  }

  const name = readString(formData, "name")
  const password = readString(formData, "password")
  const confirmPassword = readString(formData, "confirmPassword")
  const phoneCode = readString(formData, "phoneCountryCode")
  const phoneNumber = readString(formData, "phone")
  const phone = combinePhoneNumber(phoneCode, phoneNumber)

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/

  if (!name || password.length < 8 || password !== confirmPassword) {
    console.log("[completeClientSignup] Input validation failed, redirecting to step account error")
    redirect("/signup?step=account&error=account")
  }

  if (!passwordPattern.test(password)) {
    console.log("[completeClientSignup] Password regex validation failed")
    redirect("/signup?step=account&error=password")
  }

  const accessKey = await prisma.clientAccessKey.findFirst({
    where: {
      id: invite.accessKeyId,
      clientId: invite.clientId,
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    include: { client: true },
  })

  console.log("[completeClientSignup] Query result for active accessKey:", {
    found: !!accessKey,
    keyId: invite?.accessKeyId,
    clientId: invite?.clientId,
    clientStatus: accessKey?.client?.status,
    usedAt: accessKey?.usedAt
  })

  if (!accessKey || accessKey.usedAt || accessKey.client.status === "SUSPENDED") {
    console.log("[completeClientSignup] Access key validation failed (missing, already used, or client suspended), clearing cookie and redirecting to expired")
    await clearSignupCookie()
    redirect("/signup?error=expired")
  }

  const user = await prisma.clientUser.create({
    data: {
      clientId: accessKey.clientId,
      email: accessKey.client.email,
      name,
      passwordHash: hashPassword(password),
    },
  })

  await prisma.client.update({
    where: { id: accessKey.clientId },
    data: {
      name,
      ...(phone && { phone }),
      status: "ONBOARDING",
    },
  })

  await prisma.clientAccessKey.update({
    where: { id: accessKey.id },
    data: { status: "USED", usedAt: new Date() },
  })

  await prisma.auditLog.create({
    data: {
      actorType: "CLIENT",
      actorId: user.id,
      action: "CLIENT_SIGNED_UP",
      targetType: "CLIENT",
      targetId: accessKey.clientId,
    },
  })

  await clearSignupCookie()
  await setClientSession(user.id, accessKey.clientId)
  redirect("/onboarding")
}

export async function loginClient(formData: FormData) {
  const email = readString(formData, "email").toLowerCase()
  const password = readString(formData, "password")

  // Check if it is a platform admin first
  const admin = await prisma.adminUser.findUnique({
    where: { email },
  })

  if (admin && verifyPassword(password, admin.passwordHash)) {
    const { setAdminSession } = await import("@/lib/auth/admin")
    await setAdminSession(admin.id)
    redirect("/admin")
  }

  // Otherwise, handle as a client user
  const user = await prisma.clientUser.findUnique({
    where: { email },
    include: { client: true },
  })

  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect("/login?error=credentials")
  }

  if (user.client.status === "SUSPENDED") {
    redirect("/login?error=suspended")
  }

  await setClientSession(user.id, user.clientId)
  redirect(user.client.status === "ACTIVE" ? "/templates" : "/onboarding")
}

export async function logoutClient() {
  await clearClientSession()
  redirect("/login")
}
