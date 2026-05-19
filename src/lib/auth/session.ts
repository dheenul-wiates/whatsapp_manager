import { createHmac, timingSafeEqual } from "crypto"

export type SessionPayload = {
  userId: string
  clientId: string
  exp: number
}

const FALLBACK_SECRET = "development-client-session-secret"

function getSecret() {
  return process.env.CLIENT_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || FALLBACK_SECRET
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url")
}

export function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${body}.${sign(body)}`
}

export function decodeSession(value?: string): SessionPayload | null {
  if (!value) return null

  const [body, signature] = value.split(".")
  if (!body || !signature) return null

  const expected = sign(body)
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload
    if (!payload.userId || !payload.clientId || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}
