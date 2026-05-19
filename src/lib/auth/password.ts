import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto"

const ITERATIONS = 210_000
const KEY_LENGTH = 32
const DIGEST = "sha256"

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url")
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("base64url")
  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, iterationsValue, salt, hash] = storedHash.split("$")
  if (scheme !== "pbkdf2" || !iterationsValue || !salt || !hash) return false

  const iterations = Number(iterationsValue)
  if (!Number.isFinite(iterations)) return false

  const candidate = pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST)
  const stored = Buffer.from(hash, "base64url")

  return stored.length === candidate.length && timingSafeEqual(stored, candidate)
}
