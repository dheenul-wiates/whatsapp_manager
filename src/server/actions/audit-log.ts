"use server"

import { Prisma } from "@prisma/client"
import prisma from "@/lib/db"

type AuditLogEntry = {
  actorType: string
  actorId?: string
  action: string
  targetType: string
  targetId?: string
  metadata?: Prisma.InputJsonValue
}

export async function writeAuditLog(entry: AuditLogEntry) {
  await prisma.auditLog.create({
    data: {
      actorType: entry.actorType,
      actorId: entry.actorId,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      metadata: entry.metadata,
    },
  })
}
