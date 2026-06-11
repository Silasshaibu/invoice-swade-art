import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { initDB, sql } from '@/lib/db'

// TEMPORARY ADMIN SETUP/RESET ENDPOINT
// Protected by a hardcoded code-level secret.
const RESET_SECRET = 'swade-secure-reset-2026'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    if (!body.secret || body.secret !== RESET_SECRET) {
      return Response.json({ error: 'Unauthorized. Invalid secret key.' }, { status: 403 })
    }

    await initDB()

    const email = 'admin@invoice.swade-art.com'
    const password = body.password || 'SwadeAdmin2026!'
    const hash = await bcrypt.hash(password, 10)

    // Check if user exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
    
    if (existing.length > 0) {
      // Update password and ensure admin status
      await sql`
        UPDATE users 
        SET password_hash = ${hash}, is_admin = TRUE, name = 'Silas Admin'
        WHERE email = ${email}
      `
      return Response.json({
        success: true,
        message: 'Admin password updated successfully',
        email: email,
        password: password
      })
    } else {
      // Insert new admin user
      await sql`
        INSERT INTO users (email, password_hash, name, is_admin)
        VALUES (${email}, ${hash}, 'Silas Admin', TRUE)
      `
      return Response.json({
        success: true,
        message: 'Admin created successfully',
        email: email,
        password: password
      })
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: 'Setup failed', message: msg }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ status: 'Temporary reset endpoint active. Send a POST request with the correct secret.' })
}
