import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { initDB, sql } from '@/lib/db'
import { signToken } from '@/lib/auth-server'
import { registerSchema } from '@/lib/validation'

export async function POST(req: NextRequest) {
  try {
    await initDB()

    const body = await req.json()
    const validated = registerSchema.safeParse(body)

    if (!validated.success) {
      return Response.json({ error: 'Invalid input', details: validated.error.issues }, { status: 400 })
    }

    const { email, password, name } = validated.data
    const normalizedEmail = email.toLowerCase()

    const existing = await sql`SELECT id FROM users WHERE email = ${normalizedEmail}`
    if (existing.length > 0) {
      return Response.json({ error: 'Email already in use' }, { status: 409 })
    }

    const approvedRequest = await sql`
      SELECT id FROM access_requests
      WHERE email = ${normalizedEmail} AND status = 'approved'
      ORDER BY requested_at DESC
      LIMIT 1
    `
    if (approvedRequest.length === 0) {
      return Response.json({ error: 'Access request not approved yet. Please request access first.' }, { status: 403 })
    }

    const hash = await bcrypt.hash(password, 10)
    const rows = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${normalizedEmail}, ${hash}, ${name})
      RETURNING id, email, name, is_admin
    `
    await sql`UPDATE access_requests SET status = 'registered' WHERE id = ${approvedRequest[0].id}`
    const user = rows[0]
    const jti = randomUUID()
    const token = signToken({ sub: String(user.id), email: user.email, name: user.name, isAdmin: user.is_admin, jti })
    return Response.json({ token, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.is_admin } })
  } catch (error: unknown) {
    console.error('Register error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: 'Registration failed', message: msg }, { status: 500 })
  }
}
