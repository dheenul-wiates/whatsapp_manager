import { PrismaClient } from "@prisma/client"
import { pbkdf2Sync, randomBytes } from "crypto"

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  const ITERATIONS = 210_000
  const KEY_LENGTH = 32
  const DIGEST = "sha256"
  const salt = randomBytes(16).toString("base64url")
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("base64url")
  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`
}

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables")
  }

  const passwordHash = hashPassword(password)

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  })

  console.log(`✅ Admin user ready: ${admin.email}`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
