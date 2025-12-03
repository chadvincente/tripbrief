import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit } from '@/lib/rate-limit'
import type { ExtendedTravelBrief } from '@/lib/anthropic'

// Validate API key at startup
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set. Please add it to your environment variables.')
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 30000, // 30 second timeout
  maxRetries: 2, // Retry failed requests up to 2 times
})

export async function POST(request: NextRequest) {
  try {
    // Check rate limits first
    const rateLimitResult = await checkRateLimit(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: rateLimitResult.error,
          resetTime: rateLimitResult.resetTime,
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          },
        }
      )
    }

    const { destination, countryCode, travelMonth } = await request.json()

    // Input validation
    if (!destination || typeof destination !== 'string') {
      return NextResponse.json({ error: 'City is required' }, { status: 400 })
    }

    const trimmedDestination = destination.trim()
    if (trimmedDestination.length === 0) {
      return NextResponse.json({ error: 'City cannot be empty' }, { status: 400 })
    }

    if (trimmedDestination.length > 100) {
      return NextResponse.json(
        { error: 'City name is too long (max 100 characters)' },
        { status: 400 }
      )
    }

    // Log the request for monitoring
    console.log(
      `Extended travel brief request: ${trimmedDestination} from IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`
    )

    // Build prompt for extended details
    const timeCtx = travelMonth || 'anytime'

    const prompt = `Create extended travel information for ${trimmedDestination} (${timeCtx}).

CRITICAL: Keep it concise! 3-5 bullet points per section maximum. Use this exact format:

## Local Life
- [What locals do 1: everyday activity or hangout]
- [What locals do 2: everyday activity or hangout]
- [Major event 1: festival, sports, or cultural event]
- [Major event 2: festival, sports, or cultural event]
- [Local products: key souvenirs or specialty items to seek out]

## Best Sights
- [Vantage point 1: best spot to view the city with description]
- [Vantage point 2: best spot to view the city with description]
- [Photo spot 1: photogenic location with what makes it special]
- [Photo spot 2: photogenic location with what makes it special]
- [Photo spot 3: photogenic location with what makes it special]

## Culture
- [Custom 1: important cultural practice or tradition]
- [Custom 2: important cultural practice or tradition]
- [Faux pas 1: what to avoid doing]
- [Faux pas 2: what to avoid doing]
- [Faux pas 3: what to avoid doing]

Keep responses practical and specific. Skip generic advice.`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Anthropic')
    }

    // Parse custom format into structured data
    const parseResponse = (text: string): ExtendedTravelBrief => {
      const sections: ExtendedTravelBrief = {}

      // Helper to clean markdown formatting
      const cleanMarkdown = (str: string) => {
        return str
          .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold **text**
          .replace(/\*(.+?)\*/g, '$1') // Remove italic *text*
          .trim()
      }

      // Simple parser for our custom format
      const sectionRegex = /## (.+?)\n([\s\S]*?)(?=\n## |$)/g
      let match

      while ((match = sectionRegex.exec(text)) !== null) {
        const sectionName = match[1].trim()
        const sectionContent = match[2].trim()

        // Parse bullet points and clean markdown
        const bullets = sectionContent
          .split('\n')
          .filter((line) => line.trim().startsWith('-'))
          .map((line) => cleanMarkdown(line.replace(/^-\s*/, '').trim()))

        // Map sections to our data structure
        if (sectionName === 'Local Life') {
          sections.localLife = {
            everydayActivities: bullets.slice(0, 2),
            majorEvents: bullets.slice(2, 4),
            souvenirs: bullets.slice(4, 5),
          }
        } else if (sectionName === 'Best Sights') {
          sections.bestSights = {
            vantagePoints: bullets.slice(0, 2),
            photoSpots: bullets.slice(2, 5),
          }
        } else if (sectionName === 'Culture') {
          sections.culture = {
            customs: bullets.slice(0, 2),
            fauxPas: bullets.slice(2, 5),
          }
        }
      }

      return sections
    }

    const extendedData = parseResponse(content.text)

    return NextResponse.json({
      extendedData,
      fullText: content.text, // Also return the raw text for debugging
    })
  } catch (error) {
    // Log full error details server-side for debugging
    console.error('❌ Error generating extended travel brief:', error)

    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Stack trace:', error.stack)
    }

    // Only return generic error message to user (don't expose internal details)
    return NextResponse.json(
      {
        error:
          "Sorry, we've hit a temporary snag. Please give it another shot, or try again later.",
      },
      { status: 500 }
    )
  }
}
