import { sql } from './db'

export type AccessRequestDecision = 'approved' | 'rejected'

type DecisionResult = { ok: true } | { ok: false; error: string }

export async function decideAccessRequestByToken(token: string, decision: AccessRequestDecision): Promise<DecisionResult> {
  const rows = await sql`SELECT id, status, token_expires FROM access_requests WHERE token = ${token} LIMIT 1`
  if (rows.length === 0) return { ok: false, error: 'Invalid or unknown request' }
  const row = rows[0]
  if (row.status !== 'pending') return { ok: false, error: 'This request has already been decided' }
  if (new Date(row.token_expires) < new Date()) return { ok: false, error: 'This link has expired' }

  await sql`UPDATE access_requests SET status = ${decision}, decided_at = NOW() WHERE id = ${row.id}`
  return { ok: true }
}

export async function decideAccessRequestById(id: number, decision: AccessRequestDecision): Promise<DecisionResult> {
  const rows = await sql`SELECT id, status FROM access_requests WHERE id = ${id} LIMIT 1`
  if (rows.length === 0) return { ok: false, error: 'Request not found' }
  if (rows[0].status !== 'pending') return { ok: false, error: 'This request has already been decided' }

  await sql`UPDATE access_requests SET status = ${decision}, decided_at = NOW() WHERE id = ${id}`
  return { ok: true }
}
