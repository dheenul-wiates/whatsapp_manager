import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { verifyPassword } from "@/lib/auth/password"
import { setAdminSession } from "@/lib/auth/admin"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? ""
  const password = (formData.get("password") as string | null)?.trim() ?? ""

  const admin = await prisma.adminUser.findUnique({ where: { email } })

  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    return NextResponse.redirect(new URL("/admin/login?error=credentials", request.url), 303)
  }

  await setAdminSession(admin.id)
  return NextResponse.redirect(new URL("/admin", request.url), 303)
}
