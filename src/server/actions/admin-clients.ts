"use server"

import { Prisma } from "@prisma/client"
import prisma from "@/lib/db"
import { generateAccessKey, hashAccessKey } from "@/lib/access-keys"
import { writeAuditLog } from "./audit-log"
import { requireAdmin } from "@/lib/auth/admin"

const KEY_EXPIRY_DAYS = 7

function readString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export type CreateClientResult =
  | { success: true; accessKey: string; clientId: string }
  | { success: false; error: string }

import { combinePhoneNumber } from "@/lib/country-codes"

export async function createClient(
  formData: FormData
): Promise<CreateClientResult> {
  const admin = await requireAdmin()

  const email = readString(formData, "email").toLowerCase()
  const businessName = readString(formData, "businessName")
  const name = readString(formData, "name") || undefined
  const phoneCode = readString(formData, "phoneCountryCode")
  const phoneNumber = readString(formData, "phone")
  const phone = combinePhoneNumber(phoneCode, phoneNumber) || undefined
  const plan = readString(formData, "plan") || undefined
  const notes = readString(formData, "notes") || undefined

  if (!email || !businessName) {
    return { success: false, error: "Email and business name are required." }
  }

  const existing = await prisma.client.findUnique({ where: { email } })
  if (existing) {
    return { success: false, error: "A client with this email already exists." }
  }

  const rawKey = generateAccessKey()
  const keyHash = hashAccessKey(rawKey)
  const expiresAt = new Date(Date.now() + KEY_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  const client = await prisma.client.create({
    data: {
      email,
      businessName,
      name,
      phone,
      plan,
      notes,
      status: "INVITED",
      accessKeys: {
        create: { keyHash, status: "ACTIVE", expiresAt },
      },
    },
  })

  await writeAuditLog({
    actorType: "ADMIN",
    actorId: admin.id,
    action: "CLIENT_CREATED",
    targetType: "CLIENT",
    targetId: client.id,
    metadata: { email, businessName } as Prisma.InputJsonValue,
  })

  return { success: true, accessKey: rawKey, clientId: client.id }
}

export async function listClients(opts?: {
  search?: string
  status?: string
  verificationStatus?: string
  setupStatus?: string
}) {
  await requireAdmin()

  const where: Record<string, unknown> = {}

  if (opts?.search) {
    where.OR = [
      { email: { contains: opts.search, mode: "insensitive" } },
      { businessName: { contains: opts.search, mode: "insensitive" } },
    ]
  }
  if (opts?.status) where.status = opts.status
  if (opts?.verificationStatus) where.businessVerificationStatus = opts.verificationStatus
  if (opts?.setupStatus) where.whatsappSetupStatus = opts.setupStatus

  return prisma.client.findMany({
    where,
    include: {
      accessKeys: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getClientById(id: string) {
  await requireAdmin()
  return prisma.client.findUnique({
    where: { id },
    include: {
      accessKeys: { orderBy: { createdAt: "desc" } },
      users: true,
    },
  })
}

export type RegenerateKeyResult =
  | { success: true; accessKey: string }
  | { success: false; error: string }

export async function regenerateClientKey(
  clientId: string
): Promise<RegenerateKeyResult> {
  const admin = await requireAdmin()

  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client) return { success: false, error: "Client not found." }

  // Revoke existing active keys
  await prisma.clientAccessKey.updateMany({
    where: { clientId, status: "ACTIVE" },
    data: { status: "REVOKED" },
  })

  const rawKey = generateAccessKey()
  const keyHash = hashAccessKey(rawKey)
  const expiresAt = new Date(Date.now() + KEY_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  await prisma.clientAccessKey.create({
    data: { clientId, keyHash, status: "ACTIVE", expiresAt },
  })

  await writeAuditLog({
    actorType: "ADMIN",
    actorId: admin.id,
    action: "ACCESS_KEY_REGENERATED",
    targetType: "CLIENT",
    targetId: clientId,
  })

  return { success: true, accessKey: rawKey }
}

export type UpdateClientStatusResult =
  | { success: true }
  | { success: false; error: string }

export async function updateClientStatus(
  clientId: string,
  status: "ACTIVE" | "SUSPENDED"
): Promise<UpdateClientStatusResult> {
  const admin = await requireAdmin()

  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client) return { success: false, error: "Client not found." }

  await prisma.client.update({
    where: { id: clientId },
    data: {
      status,
      ...(status === "SUSPENDED" ? { suspendedAt: new Date() } : { suspendedAt: null }),
    },
  })

  await writeAuditLog({
    actorType: "ADMIN",
    actorId: admin.id,
    action: status === "SUSPENDED" ? "CLIENT_SUSPENDED" : "CLIENT_REACTIVATED",
    targetType: "CLIENT",
    targetId: clientId,
  })

  return { success: true }
}

export async function updateClientNotes(
  clientId: string,
  notes: string
): Promise<UpdateClientStatusResult> {
  const admin = await requireAdmin()

  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client) return { success: false, error: "Client not found." }

  await prisma.client.update({
    where: { id: clientId },
    data: { notes },
  })

  await writeAuditLog({
    actorType: "ADMIN",
    actorId: admin.id,
    action: "CLIENT_NOTES_UPDATED",
    targetType: "CLIENT",
    targetId: clientId,
  })

  return { success: true }
}

export async function getAdminDashboardStats() {
  await requireAdmin()

  const [total, invited, active, suspended, recentClients, recentAudit] =
    await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: "INVITED" } }),
      prisma.client.count({ where: { status: "ACTIVE" } }),
      prisma.client.count({ where: { status: "SUSPENDED" } }),
      prisma.client.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          accessKeys: {
            where: { status: "ACTIVE" },
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ])

  // Expired active keys
  const expiredKeys = await prisma.clientAccessKey.count({
    where: { status: "ACTIVE", expiresAt: { lt: new Date() } },
  })

  return { total, invited, active, suspended, expiredKeys, recentClients, recentAudit }
}

export async function listAuditLogs(limit = 50) {
  await requireAdmin()

  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}
