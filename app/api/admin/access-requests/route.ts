import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { requireAdmin, isAuthError } from '@/lib/auth-server'
import { decideAccessRequestById } from '@/lib/access-requests'

export async function GET(req: NextRequest) {
  await initDB()
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth

  try {
    const rows = await sql`
      SELECT id, name, email, status, requested_at, decided_at
      FROM access_requests
      WHERE status = 'pending'
      ORDER BY requested_at DESC
    `
    return Response.json(rows)
  } catch (err: any) {
    return Response.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  await initDB()
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth

  try {
    const body = await req.json()
    const { id, decision } = body

    if (!id || (decision !== 'approved' && decision !== 'rejected')) {
      return Response.json({ error: 'id and a valid decision are required' }, { status: 400 })
    }

    const result = await decideAccessRequestById(Number(id), decision)
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 400 })
    }

    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ error: err.message || String(err) }, { status: 500 })
  }
}
