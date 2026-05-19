import { createHmac, randomBytes, timingSafeEqual } from "crypto"

const FALLBACK_PEPPER = "development-access-key-pepper"

function normalizeAccessKey(accessKey: string) {
  return accessKey.trim().toUpperCase().replace(/\s+/g, "")
}

function getPepper() {
  return process.env.ACCESS_KEY_PEPPER || FALLBACK_PEPPER
}

export function hashAccessKey(accessKey: string) {
  return createHmac("sha256", getPepper())
    .update(normalizeAccessKey(accessKey))
    .digest("base64url")
}

export function verifyAccessKey(accessKey: string, keyHash: string) {
  const candidate = Buffer.from(hashAccessKey(accessKey))
  const stored = Buffer.from(keyHash)
  return candidate.length === stored.length && timingSafeEqual(candidate, stored)
}

/** Generates a human-friendly access key in the format: WBM-XXXX-XXXX-XXXX */
export function generateAccessKey(): string {
  const segment = () => randomBytes(3).toString("hex").toUpperCase().slice(0, 4)
  return `WBM-${segment()}-${segment()}-${segment()}`
}
