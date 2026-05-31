import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { initDB, sql } from '@/lib/db'
import { signToken } from '@/lib/auth-server'
import { loginSchema } from '@/lib/validation'
import { rateLimit } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
    if (!rateLimit(`login:${ip}`, 5, 900000)) {
      return Response.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 })
    }

    await initDB()

    const body = await req.json()
    const { email, password } = loginSchema.parse(body)

    const rows = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`
    if (rows.length === 0) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const jti = randomUUID()
    const token = signToken({ sub: String(user.id), email: user.email, name: user.name, isAdmin: user.is_admin, jti })
    await logAudit(user.id, 'login', 'auth', undefined, undefined, ip)
    return Response.json({ token, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.is_admin } })
  } catch (error: unknown) {
    if (error instanceof Error && 'errors' in error) {
      return Response.json({ error: 'Invalid input', details: error }, { status: 400 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
