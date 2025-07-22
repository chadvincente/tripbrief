interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitStore {
  [key: string]: RateLimitEntry
}

class RateLimiter {
  private store: RateLimitStore = {}
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(windowMs: number = 60 * 1000, maxRequests: number = 5) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
    
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key]
      }
    })
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.store[identifier]

    if (!entry || entry.resetTime < now) {
      // First request or window expired
      this.store[identifier] = {
        count: 1,
        resetTime: now + this.windowMs
      }
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      }
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    entry.count++
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }
}

// Create rate limiter instances
export const minuteRateLimiter = new RateLimiter(60 * 1000, 3) // 3 requests per minute
export const hourRateLimiter = new RateLimiter(60 * 60 * 1000, 10) // 10 requests per hour

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

export function checkRateLimit(request: Request) {
  const ip = getClientIP(request)
  
  // Check minute limit first (more restrictive)
  const minuteCheck = minuteRateLimiter.check(ip)
  if (!minuteCheck.allowed) {
    return {
      allowed: false,
      error: 'Too many requests. Please wait a moment before trying again.',
      resetTime: minuteCheck.resetTime,
      remaining: minuteCheck.remaining
    }
  }
  
  // Check hour limit
  const hourCheck = hourRateLimiter.check(`${ip}_hour`)
  if (!hourCheck.allowed) {
    return {
      allowed: false,
      error: 'Hourly limit exceeded. Please try again later.',
      resetTime: hourCheck.resetTime,
      remaining: hourCheck.remaining
    }
  }
  
  return {
    allowed: true,
    remaining: Math.min(minuteCheck.remaining, hourCheck.remaining),
    resetTime: minuteCheck.resetTime
  }
}