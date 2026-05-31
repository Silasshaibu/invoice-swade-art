import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { initDB, sql } from '@/lib/db'
import { signToken } from '@/lib/auth-server'
import { registerSchema } from '@/lib/validation'

export async function POST(req: NextRequest) {
  await initDB()

  try {
    const body = await req.json()
    const { email, password, name } = registerSchema.parse(body)

    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`
    if (existing.length > 0) {
      return Response.json({ error: 'Email already in use' }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 10)
    const rows = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email.toLowerCase()}, ${hash}, ${name})
      RETURNING id, email, name, is_admin
    `
    const user = rows[0]
    const jti = randomUUID()
    const token = signToken({ sub: String(user.id), email: user.email, name: user.name, isAdmin: user.is_admin, jti })
    return Response.json({ token, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.is_admin } })
  } catch (error: unknown) {
    if (error instanceof Error && 'errors' in error) {
      return Response.json({ error: 'Invalid input', details: error }, { status: 400 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
