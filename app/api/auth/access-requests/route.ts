import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { initDB, sql } from '@/lib/db'
import { sendAccessRequestEmail } from '@/lib/email'
import { accessRequestSchema } from '@/lib/validation'

const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function POST(req: NextRequest) {
  try {
    await initDB()
    const body = await req.json()
    const validated = accessRequestSchema.safeParse(body)
    if (!validated.success) {
      return Response.json({ error: 'Invalid input', details: validated.error.issues }, { status: 400 })
    }
    const email = validated.data.email.toLowerCase().trim()
    const name = validated.data.name.trim()

    const existingUser = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
    if (existingUser.length > 0) {
      return Response.json({ error: 'Email already in use' }, { status: 409 })
    }

    const latest = await sql`
      SELECT status FROM access_requests
      WHERE email = ${email}
      ORDER BY requested_at DESC
      LIMIT 1
    `
    if (latest.length > 0 && latest[0].status === 'pending') {
      return Response.json({ status: 'pending' })
    }
    if (latest.length > 0 && latest[0].status === 'approved') {
      return Response.json({ status: 'approved' })
    }

    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + TOKEN_EXPIRY_MS)

    await sql`
      INSERT INTO access_requests (name, email, status, token, token_expires)
      VALUES (${name}, ${email}, 'pending', ${token}, ${expires})
    `

    const sent = await sendAccessRequestEmail(name, email, token)
    if (!sent) {
      console.error(`Failed to send access request notification for ${email}`)
    }

    return Response.json({ status: 'pending' })
  } catch (error) {
    console.error('Access request error:', error)
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await initDB()
    const email = req.nextUrl.searchParams.get('email')?.toLowerCase().trim()
    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    const latest = await sql`
      SELECT status FROM access_requests
      WHERE email = ${email}
      ORDER BY requested_at DESC
      LIMIT 1
    `

    if (latest.length === 0) {
      return Response.json({ status: 'none' })
    }

    const status = latest[0].status
    if (status === 'pending' || status === 'approved' || status === 'rejected') {
      return Response.json({ status })
    }

    return Response.json({ status: 'none' })
  } catch (error) {
    console.error('Access request status error:', error)
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
