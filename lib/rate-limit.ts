const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(identifier: string, limit: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || now >= record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count < limit) {
    record.count++
    return true
  }

  return false
}

export function getRateLimitInfo(identifier: string, windowMs: number = 60000) {
  const record = rateLimitStore.get(identifier)
  const now = Date.now()

  if (!record || now >= record.resetTime) {
    return {
      current: 0,
      limit: 60,
      resetTime: now + windowMs,
      remaining: 60,
    }
  }

  return {
    current: record.count,
    limit: 60,
    resetTime: record.resetTime,
    remaining: Math.max(0, 60 - record.count),
  }
}
