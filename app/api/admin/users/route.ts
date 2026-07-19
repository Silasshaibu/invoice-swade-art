import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { requireAdmin, requireSuperAdmin, isAuthError } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  await initDB()
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth

  try {
    const rows = await sql`
      SELECT
        u.id, u.email, u.name, u.is_admin, u.is_super_admin, u.created_at,
        COUNT(DISTINCT c.id)::int as client_count,
        COUNT(DISTINCT i.id)::int as invoice_count
      FROM users u
      LEFT JOIN clients c ON u.id = c.user_id
      LEFT JOIN invoices i ON u.id = i.user_id
      GROUP BY u.id, u.email, u.name, u.is_admin, u.is_super_admin, u.created_at
      ORDER BY u.created_at DESC
    `
    return Response.json(rows)
  } catch (err: any) {
    return Response.json({ error: err.message || String(err) }, { status: 500 })
  }
}

// Promoting/demoting admins and deleting accounts is restricted to the super admin —
// a regular admin cannot create, alter, or remove other admin accounts.
export async function PUT(req: NextRequest) {
  await initDB()
  const auth = await requireSuperAdmin(req)
  if (isAuthError(auth)) return auth

  try {
    const body = await req.json()
    const { userId, isAdmin } = body

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 })
    }

    // Check self-demotion
    if (Number(userId) === Number(auth.sub)) {
      return Response.json({ error: 'You cannot change your own admin status' }, { status: 400 })
    }

    const target = await sql`SELECT is_super_admin FROM users WHERE id = ${Number(userId)}`
    if (target.length > 0 && target[0].is_super_admin) {
      return Response.json({ error: 'Cannot change the super admin\'s status' }, { status: 400 })
    }

    await sql`
      UPDATE users
      SET is_admin = ${Boolean(isAdmin)}
      WHERE id = ${Number(userId)}
    `
    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  await initDB()
  const auth = await requireSuperAdmin(req)
  if (isAuthError(auth)) return auth

  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 })
    }

    // Check self-deletion
    if (Number(userId) === Number(auth.sub)) {
      return Response.json({ error: 'You cannot delete your own account' }, { status: 400 })
    }

    const target = await sql`SELECT is_super_admin FROM users WHERE id = ${Number(userId)}`
    if (target.length > 0 && target[0].is_super_admin) {
      return Response.json({ error: 'Cannot delete the super admin account' }, { status: 400 })
    }

    await sql`
      DELETE FROM users
      WHERE id = ${Number(userId)}
    `
    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ error: err.message || String(err) }, { status: 500 })
  }
}
