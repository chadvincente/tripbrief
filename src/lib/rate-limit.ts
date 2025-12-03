import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  error?: string
}

// Initialize Redis client (uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env)
let redis: Redis | null = null
let minuteRateLimiter: Ratelimit | null = null
let hourRateLimiter: Ratelimit | null = null

try {
  redis = Redis.fromEnv()

  // 3 requests per minute with sliding window
  minuteRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '60 s'),
    analytics: true,
    prefix: 'tripbrief:ratelimit',
  })

  // 30 requests per hour with sliding window
  hourRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '3600 s'),
    analytics: true,
    prefix: 'tripbrief:ratelimit',
  })
} catch (error) {
  console.warn('Upstash Redis not configured - rate limiting will be disabled in this environment')
}

export function getClientIP(request: Request): string {
  // Try to get real IP from headers (Vercel provides these)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  // Fallback
  return 'unknown'
}

export async function checkRateLimit(request: Request): Promise<RateLimitResult> {
  const ip = getClientIP(request)

  // If rate limiters aren't configured (e.g., local dev), allow all requests
  if (!minuteRateLimiter || !hourRateLimiter) {
    return {
      allowed: true,
      remaining: 999,
      resetTime: Date.now() + 60000,
    }
  }

  try {
    // Check minute limit first (more restrictive)
    const minuteResult = await minuteRateLimiter.limit(`${ip}:minute`)

    if (!minuteResult.success) {
      return {
        allowed: false,
        error: 'Too many requests. Please wait a moment before trying again.',
        resetTime: minuteResult.reset,
        remaining: minuteResult.remaining,
      }
    }

    // Check hour limit
    const hourResult = await hourRateLimiter.limit(`${ip}:hour`)

    if (!hourResult.success) {
      return {
        allowed: false,
        error: 'Hourly limit exceeded. Please try again later.',
        resetTime: hourResult.reset,
        remaining: hourResult.remaining,
      }
    }

    return {
      allowed: true,
      remaining: Math.min(minuteResult.remaining, hourResult.remaining),
      resetTime: minuteResult.reset,
    }
  } catch (error) {
    // If rate limiting fails, log error but allow the request through
    console.error('Rate limit check failed:', error)
    return {
      allowed: true,
      remaining: 999,
      resetTime: Date.now() + 60000,
    }
  }
}
