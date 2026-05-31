import { sql } from '@/lib/db'

export async function logAudit(
  userId: number,
  action: 'create' | 'update' | 'delete' | 'login',
  resource: 'invoice' | 'client' | 'payment' | 'user' | 'auth',
  resourceId?: number,
  changes?: Record<string, unknown>,
  ipAddress?: string
) {
  try {
    await sql`
      INSERT INTO audit_logs (user_id, action, resource, resource_id, changes, ip_address)
      VALUES (${userId}, ${action}, ${resource}, ${resourceId || null}, ${changes ? JSON.stringify(changes) : null}, ${ipAddress || null})
    `
  } catch (error) {
    console.error('Failed to log audit:', error)
  }
}
