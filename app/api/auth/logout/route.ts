import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-server'

export async function POST(req: NextRequest) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  await sql`INSERT INTO token_blocklist (jti) VALUES (${auth.jti}) ON CONFLICT DO NOTHING`
  return Response.json({ ok: true })
}
