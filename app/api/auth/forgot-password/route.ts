import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { initDB, sql } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    await initDB()
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    
    // Check if user exists
    const users = await sql`SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1`
    
    // To prevent user enumeration, return ok: true even if email is not found
    if (users.length === 0) {
      console.log(`Password reset requested for non-existent email: ${normalizedEmail}`)
      return Response.json({ ok: true, message: 'If the email exists, a password reset link has been sent.' })
    }

    const user = users[0]
    
    // Generate secure reset token
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hour expiration

    // Store hashed token (or raw since it is high-entropy one-time reset token, but storing raw is fine here)
    await sql`
      UPDATE users 
      SET reset_token = ${token}, reset_token_expires = ${expires}
      WHERE id = ${user.id}
    `

    const origin = req.headers.get('origin') || 'https://invoice.swade-art.com'
    
    // Send email using Resend
    const sent = await sendPasswordResetEmail(normalizedEmail, token, origin)
    
    if (!sent) {
      return Response.json({ error: 'Failed to send password reset email. Please try again later.' }, { status: 500 })
    }

    return Response.json({ ok: true, message: 'If the email exists, a password reset link has been sent.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
