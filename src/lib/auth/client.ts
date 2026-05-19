import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { decodeSession, encodeSession } from "./session"

export const CLIENT_SESSION_COOKIE = "wbm_client_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

export async function setClientSession(userId: string, clientId: string) {
  const cookieStore = await cookies()
  cookieStore.set({
    name: CLIENT_SESSION_COOKIE,
    value: encodeSession({
      userId,
      clientId,
      exp: Date.now() + SESSION_MAX_AGE * 1000,
    }),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
}

export async function clearClientSession() {
  const cookieStore = await cookies()
  cookieStore.delete(CLIENT_SESSION_COOKIE)
}

export async function getCurrentClientUser() {
  const cookieStore = await cookies()
  const payload = decodeSession(cookieStore.get(CLIENT_SESSION_COOKIE)?.value)
  if (!payload) return null

  const user = await prisma.clientUser.findUnique({
    where: { id: payload.userId },
    include: { client: true },
  })

  if (!user || user.clientId !== payload.clientId) return null
  return user
}

export async function requireClientUser(options?: { requireActive?: boolean }) {
  const user = await getCurrentClientUser()
  if (!user) redirect("/login")

  if (user.client.status === "SUSPENDED") {
    await clearClientSession()
    redirect("/login?error=suspended")
  }

  if (options?.requireActive && user.client.status !== "ACTIVE") {
    redirect("/onboarding")
  }

  return user
}
