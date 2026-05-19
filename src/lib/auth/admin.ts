import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { createHmac, timingSafeEqual } from "crypto"

export const ADMIN_SESSION_COOKIE = "wbm_admin_session"
const SESSION_MAX_AGE = 60 * 60 * 8 // 8 hours

type AdminSessionPayload = {
  adminId: string
  exp: number
}

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "development-admin-session-secret"
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url")
}

function encodeAdminSession(payload: AdminSessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${body}.${sign(body)}`
}

function decodeAdminSession(value?: string): AdminSessionPayload | null {
  if (!value) return null
  const [body, signature] = value.split(".")
  if (!body || !signature) return null

  const expected = sign(body)
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as AdminSessionPayload
    if (!payload.adminId || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export async function setAdminSession(adminId: string) {
  const cookieStore = await cookies()
  cookieStore.set({
    name: ADMIN_SESSION_COOKIE,
    value: encodeAdminSession({
      adminId,
      exp: Date.now() + SESSION_MAX_AGE * 1000,
    }),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: SESSION_MAX_AGE,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete({ name: ADMIN_SESSION_COOKIE, path: "/admin" })
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies()
  const payload = decodeAdminSession(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  )
  if (!payload) return null

  const admin = await prisma.adminUser.findUnique({
    where: { id: payload.adminId },
  })
  return admin
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect("/login")
  return admin
}
