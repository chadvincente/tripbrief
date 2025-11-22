import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit } from '@/lib/rate-limit'
import type { CategoryOptions, BudgetOption } from '@/lib/anthropic'

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

    const {
      destination,
      startDate,
      endDate,
      travelMonth,
      categories,
      budget = 'standard',
    } = await request.json()

    if (!destination) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 })
    }

    // Log the request for monitoring
    const timeContext = travelMonth
      ? `month: ${travelMonth}`
      : startDate && endDate
        ? `${startDate} to ${endDate}`
        : 'general'
    console.log(
      `Extended brief request: ${destination} (${timeContext}) from IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`
    )

    // Build prompt for extended details only
    const buildExtendedPrompt = () => {
      // Budget-specific instructions
      const budgetInstructions = {
        'budget-friendly':
          'Focus on affordable options, free attractions, budget-friendly activities, and money-saving tips.',
        standard: 'Provide mid-range recommendations with good value for money.',
        luxury:
          'Emphasize premium experiences, exclusive attractions, private tours, and upscale activities.',
      }

      // Build time context for the prompt
      const timeContext = travelMonth
        ? `traveling in ${travelMonth}`
        : startDate && endDate
          ? `a trip from ${startDate} to ${endDate}`
          : 'general travel planning'

      let prompt = `Create extended travel information for ${destination} for ${timeContext}.\n\nBUDGET LEVEL: ${budget.toUpperCase()} - ${budgetInstructions[budget as keyof typeof budgetInstructions]}\n\nProvide detailed information about: Neighborhoods, Attractions, Culture & Events, Day Trips, Active/Sports Activities, and Unique Souvenirs.\n\nPlease return the response as a valid JSON object with the following structure:\n\n{`

      // Neighborhoods section
      if (categories?.neighborhoods?.enabled) {
        prompt += `\n  "neighborhoods": {`
        if (categories.neighborhoods.character) {
          prompt += `\n    "areas": [`
          prompt += `\n      {`
          prompt += `\n        "name": "Neighborhood Name",`
          prompt += `\n        "character": "Brief description of the area's vibe/character",`
          prompt += `\n        "highlights": ["key attractions in this area", "why to visit"]`
          prompt += `\n      }`
          prompt += `\n    ],`
        }
        if (categories.neighborhoods.layout) {
          prompt += `\n    "layout": ["general city geography", "how areas connect"],`
        }
        if (categories.neighborhoods.whereToStay) {
          prompt += `\n    "whereToStay": ["best areas for tourists", "accommodation recommendations"]`
        }
        prompt += `\n  },`
      }

      // Attractions section
      if (categories?.attractions?.enabled) {
        prompt += `\n  "attractions": {`
        if (categories.attractions.landmarks) {
          prompt += `\n    "mustSee": ["top major attractions with brief descriptions"],`
        }
        if (categories.attractions.viewpoints) {
          prompt += `\n    "photoSpots": ["best viewpoints", "Instagram-worthy locations"],`
        }
        if (categories.attractions.museums) {
          prompt += `\n    "museums": ["key museums and cultural sites"],`
        }
        if (categories.attractions.experiences) {
          prompt += `\n    "experiences": ["unique local experiences", "seasonal activities"],`
        }
        prompt += `\n    "offTheBeatenPath": ["lesser-known attractions", "hidden gems", "local secrets"]`
        prompt += `\n  },`
      }

      // Culture & Events section
      if (categories?.cultureAndEvents?.enabled) {
        prompt += `\n  "cultureAndEvents": {`
        if (categories.cultureAndEvents.events) {
          prompt += `\n    "events": ["events during travel dates", "festivals", "seasonal happenings"],`
        }
        if (categories.cultureAndEvents.sportsEvents) {
          prompt += `\n    "sportsEvents": ["professional sports games/matches during visit", "major sports teams", "stadium information"],`
        }
        if (categories.cultureAndEvents.customs) {
          prompt += `\n    "customs": ["important cultural customs", "local traditions"],`
          prompt += `\n    "etiquette": ["dos and don'ts", "social norms"],`
        }
        if (categories.cultureAndEvents.language) {
          prompt += `\n    "language": ["key phrases", "language tips", "English usage"]`
        }
        prompt += `\n  },`
      }

      // Day Trips section
      if (categories?.dayTrips?.enabled) {
        prompt += `\n  "dayTrips": {`
        if (categories.dayTrips.nearbyDestinations) {
          prompt += `\n    "nearbyDestinations": ["nearby cities/attractions worth visiting", "day trip destinations"],`
        }
        if (categories.dayTrips.transportation) {
          prompt += `\n    "transportation": ["how to get to day trip destinations", "transport options and costs"],`
        }
        if (categories.dayTrips.duration) {
          prompt += `\n    "duration": ["recommended time for each destination", "timing and planning tips"]`
        }
        prompt += `\n  },`
      }

      // Staying Active section
      if (categories?.activeAndSports?.enabled) {
        prompt += `\n  "activeAndSports": {`
        if (categories.activeAndSports.running) {
          prompt += `\n    "running": ["popular running routes", "parks and trails", "running clubs/events"],`
        }
        if (categories.activeAndSports.cycling) {
          prompt += `\n    "cycling": ["bike rental locations", "cycling routes", "bike-friendly areas"],`
        }
        if (categories.activeAndSports.sports) {
          prompt += `\n    "sports": ["local sports venues", "fitness centers", "sports events to watch"],`
        }
        if (categories.activeAndSports.outdoorActivities) {
          prompt += `\n    "outdoorActivities": ["hiking trails", "outdoor recreation", "nature activities"]${categories.activeAndSports.climbingGyms ? ',' : ''}`
        }
        if (categories.activeAndSports.climbingGyms) {
          prompt += `\n    "climbingGyms": ["climbing gyms and rock climbing spots", "bouldering facilities", "indoor/outdoor climbing options"] // only include if there are climbing facilities at this location`
        }
        prompt += `\n  },`
      }

      // Unique Souvenirs section
      prompt += `\n  "uniqueSouvenirs": {`
      prompt += `\n    "traditional": ["authentic local crafts", "traditional items unique to the region"],`
      prompt += `\n    "specialty": ["local specialty products", "foods/drinks to bring home"],`
      prompt += `\n    "whereToBuy": ["best places to shop for souvenirs", "local markets vs tourist shops"]`
      prompt += `\n  }`

      prompt += `\n}\n\nProvide specific, actionable information for each section. Make sure the response is valid JSON that can be parsed directly.`

      return prompt
    }

    const prompt = buildExtendedPrompt()

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
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
    let extendedData
    try {
      // Clean up the response text to handle markdown code blocks
      let cleanedText = content.text.trim()

      // Remove markdown code blocks if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      extendedData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse JSON from Claude:', parseError)
      console.error('Raw response:', content.text)
      throw new Error('Invalid JSON response from Claude')
    }

    return NextResponse.json({
      extendedData,
    })
  } catch (error) {
    console.error('Error generating extended travel brief:', error)

    // Handle specific Anthropic API errors
    if (error instanceof Error) {
      // Check for timeout/disconnection errors
      if (error.message.includes('timeout') || error.message.includes('disconnect')) {
        return NextResponse.json(
          {
            error:
              "Sorry, we've hit a temporary snag. Please give it another shot, or try again later.",
            type: 'timeout',
          },
          { status: 503 }
        )
      }

      // Check for rate limit errors from Anthropic
      if (error.message.includes('rate_limit') || error.message.includes('429')) {
        return NextResponse.json(
          {
            error: "We're experiencing high demand. Please wait a moment and try again.",
            type: 'rate_limit',
          },
          { status: 429 }
        )
      }
    }

    // Generic error fallback
    return NextResponse.json(
      {
        error:
          "Sorry, we've hit a temporary snag. Please give it another shot, or try again later.",
        type: 'generic',
      },
      { status: 500 }
    )
  }
}
