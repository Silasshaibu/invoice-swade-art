import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { initDB, sql } from '@/lib/db'
import { signToken } from '@/lib/auth-server'

export async function POST(req: NextRequest) {
  await initDB()
  const { email, password } = await req.json()
  if (!email || !password) {
    return Response.json({ error: 'email and password required' }, { status: 400 })
  }
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
  return Response.json({ token, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.is_admin } })
}
