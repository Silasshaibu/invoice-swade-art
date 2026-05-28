import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { sql } from './db'

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const EXPIRY = '7d'

export interface JWTPayload {
  sub: string
  email: string
  name: string
  isAdmin: boolean
  jti: string
  iat: number
  exp: number
}

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRY })
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, SECRET) as JWTPayload
    const blocked = await sql`SELECT jti FROM token_blocklist WHERE jti = ${decoded.jti}`
    if (blocked.length > 0) return null
    return decoded
  } catch {
    return null
  }
}

export async function requireAuth(req: NextRequest): Promise<JWTPayload | Response> {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const payload = await verifyToken(token)
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return payload
}

export function isAuthError(val: JWTPayload | Response): val is Response {
  return val instanceof Response
}
