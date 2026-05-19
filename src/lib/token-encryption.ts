import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto"

function getKey() {
  const secret = process.env.TOKEN_ENCRYPTION_SECRET || process.env.CLIENT_SESSION_SECRET || "development-token-secret"
  return createHash("sha256").update(secret).digest()
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".")
}

export function decryptSecret(value: string) {
  const [ivValue, tagValue, encryptedValue] = value.split(".")
  if (!ivValue || !tagValue || !encryptedValue) return null

  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivValue, "base64url"))
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"))
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8")
}
