"use server"

import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { verifyPassword } from "@/lib/auth/password"
import { clearAdminSession, setAdminSession } from "@/lib/auth/admin"

function readString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export async function loginAdmin(formData: FormData) {
  const email = readString(formData, "email").toLowerCase()
  const password = readString(formData, "password")

  const admin = await prisma.adminUser.findUnique({ where: { email } })

  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    redirect("/admin/login?error=credentials")
  }

  await setAdminSession(admin.id)
  redirect("/admin")
}

export async function logoutAdmin() {
  await clearAdminSession()
  redirect("/login")
}
