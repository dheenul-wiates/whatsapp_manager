import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { createHmac } from "crypto"

const prisma = new PrismaClient()

function hashAccessKey(accessKey) {
  const pepper = process.env.ACCESS_KEY_PEPPER || "development-access-key-pepper"
  return createHmac("sha256", pepper)
    .update(accessKey.trim().toUpperCase().replace(/\s+/g, ""))
    .digest("base64url")
}

async function main() {
  const seedEmail = process.env.SEED_CLIENT_EMAIL
  const seedBusinessName = process.env.SEED_CLIENT_BUSINESS_NAME || "Demo Business"
  const seedAccessKey = process.env.SEED_CLIENT_ACCESS_KEY

  if (!seedEmail || !seedAccessKey) {
    console.log("Skipped client seed. Set SEED_CLIENT_EMAIL and SEED_CLIENT_ACCESS_KEY to create an invited client.")
    return
  }

  const client = await prisma.client.upsert({
    where: { email: seedEmail.toLowerCase() },
    update: {
      businessName: seedBusinessName,
      status: "INVITED",
    },
    create: {
      email: seedEmail.toLowerCase(),
      businessName: seedBusinessName,
      status: "INVITED",
    },
  })

  await prisma.clientAccessKey.updateMany({
    where: {
      clientId: client.id,
      status: "ACTIVE",
    },
    data: {
      status: "REVOKED",
    },
  })

  await prisma.clientAccessKey.create({
    data: {
      clientId: client.id,
      keyHash: hashAccessKey(seedAccessKey),
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  })

  console.log(`Seeded invited client ${seedEmail}. Use the provided SEED_CLIENT_ACCESS_KEY on /signup.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
