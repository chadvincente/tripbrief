import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit } from '@/lib/rate-limit'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    // Check rate limits first
    const rateLimitResult = checkRateLimit(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: rateLimitResult.error,
          resetTime: rateLimitResult.resetTime
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
          }
        }
      )
    }

    const { destination, startDate, endDate } = await request.json()

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      )
    }

    // Log the request for monitoring
    console.log(`Travel brief request: ${destination} (${startDate} to ${endDate}) from IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`)

    const prompt = `Create a comprehensive travel brief for ${destination} for a trip from ${startDate} to ${endDate}.

Please return the response as a valid JSON object with the following exact structure:

{
  "destination": "${destination}",
  "startDate": "${startDate}",
  "endDate": "${endDate}",
  "transportation": {
    "publicTransit": ["specific transit info", "payment methods", "key routes"],
    "alternatives": ["Uber/Lyft availability", "bike sharing", "walking areas"],
    "paymentMethods": ["metro card info", "app recommendations", "cash vs card"],
    "tips": ["practical transportation tips", "airport connections"]
  },
  "attractions": {
    "mustSee": ["top 3-4 major attractions with brief descriptions"],
    "photoSpots": ["best viewpoints", "Instagram-worthy locations"],
    "museums": ["key museums and cultural sites"],
    "experiences": ["unique local experiences", "seasonal activities"]
  },
  "foodAndDrink": {
    "localSpecialties": ["must-try dishes", "regional specialties"],
    "restaurants": ["highly recommended restaurants with brief descriptions"],
    "cafes": ["notable coffee shops", "local cafe culture"],
    "bars": ["popular bars/nightlife areas", "local drinking culture"],
    "streetFood": ["street food recommendations", "food markets"]
  },
  "neighborhoods": {
    "areas": [
      {
        "name": "Neighborhood Name",
        "character": "Brief description of the area's vibe/character",
        "highlights": ["key attractions in this area", "why to visit"]
      }
    ],
    "layout": ["general city geography", "how areas connect"],
    "whereToStay": ["best areas for tourists", "accommodation recommendations"]
  },
  "cultureAndEvents": {
    "events": ["events during travel dates", "festivals", "seasonal happenings"],
    "customs": ["important cultural customs", "local traditions"],
    "etiquette": ["dos and don'ts", "social norms"],
    "language": ["key phrases", "language tips", "English usage"]
  },
  "practical": {
    "currency": "Local currency name",
    "exchangeRate": "Approximate current exchange rate info",
    "tipping": ["tipping customs", "typical amounts", "where to tip"],
    "emergency": ["emergency numbers", "important contacts"],
    "safety": ["safety tips", "areas to be aware of", "general precautions"],
    "localNews": ["current events to be aware of", "travel advisories"]
  }
}

Provide specific, actionable information for each section. Make sure the response is valid JSON that can be parsed directly.`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
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

    // Parse the JSON response from Claude
    let structuredData
    try {
      structuredData = JSON.parse(content.text)
    } catch (parseError) {
      console.error('Failed to parse JSON from Claude:', parseError)
      console.error('Raw response:', content.text)
      throw new Error('Invalid JSON response from Claude')
    }

    return NextResponse.json({
      structuredData,
      destination,
      startDate,
      endDate,
    })
  } catch (error) {
    console.error('Error generating travel brief:', error)
    return NextResponse.json(
      { error: 'Failed to generate travel brief' },
      { status: 500 }
    )
  }
}