import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  // Simple check to make sure it's not easily guessable
  const { searchParams } = new URL(req.url)
  if (searchParams.get('token') !== 'swade-reveal-secret-2026') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return Response.json({
    DATABASE_URL: process.env.DATABASE_URL,
    SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET
  })
}
