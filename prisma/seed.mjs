import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.template.deleteMany()

  const templates = [
    {
      name: "welcome_message",
      category: "MARKETING",
      language: "en_US",
      status: "APPROVED",
      body: "Welcome to our platform, {{1}}! We are excited to have you on board.",
    },
    {
      name: "order_confirmation",
      category: "UTILITY",
      language: "en_US",
      status: "APPROVED",
      body: "Your order {{1}} has been confirmed. Total: {{2}}.",
    },
    {
      name: "otp_code",
      category: "AUTHENTICATION",
      language: "en_US",
      status: "APPROVED",
      body: "Your verification code is {{1}}. Do not share this with anyone.",
    },
    {
      name: "spring_sale_promo",
      category: "MARKETING",
      language: "en_US",
      status: "PENDING",
      body: "Spring sale is here! Get {{1}}% off on all items using code {{2}}.",
    },
    {
      name: "support_ticket_closed",
      category: "UTILITY",
      language: "es_ES",
      status: "REJECTED",
      body: "Tu ticket {{1}} ha sido cerrado. Gracias por contactarnos.",
    },
    {
      name: "draft_campaign",
      category: "MARKETING",
      language: "en_US",
      status: "DRAFT",
      body: "Check out our latest news: {{1}}",
    }
  ]

  for (const t of templates) {
    await prisma.template.create({ data: t })
  }

  console.log("Database seeded!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
