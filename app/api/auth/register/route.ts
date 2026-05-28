import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { initDB, sql } from '@/lib/db'
import { signToken } from '@/lib/auth-server'

export async function POST(req: NextRequest) {
  await initDB()
  const { email, password, name } = await req.json()
  if (!email || !password || !name) {
    return Response.json({ error: 'email, password, and name are required' }, { status: 400 })
  }
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
}
