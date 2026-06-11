import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { initDB, sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    await initDB()
    const { token, password } = await req.json()

    if (!token || typeof token !== 'string') {
      return Response.json({ error: 'Token is required' }, { status: 400 })
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    // Verify token exists and is not expired
    const users = await sql`
      SELECT id FROM users 
      WHERE reset_token = ${token} 
        AND reset_token_expires > NOW() 
      LIMIT 1
    `

    if (users.length === 0) {
      return Response.json({ error: 'Invalid or expired password reset token.' }, { status: 400 })
    }

    const user = users[0]
    
    // Hash new password
    const hash = await bcrypt.hash(password, 10)

    // Update password and clear token
    await sql`
      UPDATE users 
      SET password_hash = ${hash}, 
          reset_token = NULL, 
          reset_token_expires = NULL 
      WHERE id = ${user.id}
    `

    return Response.json({ ok: true, message: 'Your password has been successfully reset.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
