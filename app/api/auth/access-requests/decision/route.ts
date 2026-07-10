import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { decideAccessRequestByToken } from '@/lib/access-requests'

export async function GET(req: NextRequest) {
  try {
    await initDB()
    const token = req.nextUrl.searchParams.get('token')
    if (!token) {
      return Response.json({ error: 'Invalid or missing token' }, { status: 400 })
    }

    const rows = await sql`
      SELECT name, email, status, token_expires, requested_at
      FROM access_requests
      WHERE token = ${token}
      LIMIT 1
    `
    if (rows.length === 0) {
      return Response.json({ error: 'Invalid or unknown request' }, { status: 404 })
    }
    const row = rows[0]
    if (row.status !== 'pending') {
      return Response.json({ error: 'This request has already been decided' }, { status: 400 })
    }
    if (new Date(row.token_expires) < new Date()) {
      return Response.json({ error: 'This link has expired' }, { status: 400 })
    }

    return Response.json({ name: row.name, email: row.email, requestedAt: row.requested_at })
  } catch (error) {
    console.error('Access request decision lookup error:', error)
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDB()
    const { token, decision } = await req.json()
    if (!token || (decision !== 'approved' && decision !== 'rejected')) {
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    }

    const result = await decideAccessRequestByToken(token, decision)
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 400 })
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Access request decision error:', error)
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
