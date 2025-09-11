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
      categories,
      budget = 'standard',
    } = await request.json()

    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 })
    }

    // Log the request for monitoring
    console.log(
      `Travel brief request: ${destination} (${startDate} to ${endDate}) from IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`
    )

    // Build dynamic prompt based on selected categories
    const buildPrompt = () => {
      // Budget-specific instructions
      const budgetInstructions = {
        'budget-friendly':
          'Focus on affordable options, budget accommodations (hostels, budget hotels, Airbnb), free attractions, local eateries, street food, public transportation, and money-saving tips. Prioritize experiences that offer great value without compromising safety.',
        standard:
          'Provide mid-range recommendations with good value for money. Include comfortable 3-star accommodations, a mix of local and international dining options, popular attractions with reasonable entry fees, and efficient transportation options.',
        luxury:
          'Emphasize premium experiences, luxury accommodations (4-5 star hotels, boutique properties), fine dining restaurants, exclusive attractions, private tours, spa services, and high-end shopping. Include premium transportation options and concierge services.',
      }

      let prompt = `Create a comprehensive travel brief for ${destination} for a trip from ${startDate} to ${endDate}.\n\nBUDGET LEVEL: ${budget.toUpperCase()} - ${budgetInstructions[budget as keyof typeof budgetInstructions]}\n\nTailor ALL recommendations (accommodations, restaurants, attractions, activities, transportation) to match this budget level while maintaining the same JSON structure.\n\nPlease return the response as a valid JSON object with the following structure:\n\n{`

      prompt += `\n  "destination": "${destination}",`
      prompt += `\n  "startDate": "${startDate}",`
      prompt += `\n  "endDate": "${endDate}",`

      // Transportation section
      if (categories?.transportation?.enabled) {
        prompt += `\n  "transportation": {`
        if (categories.transportation.publicTransit) {
          prompt += `\n    "publicTransit": ["specific transit info", "payment methods", "key routes"],`
        }
        if (categories.transportation.alternatives) {
          prompt += `\n    "alternatives": ["Uber/Lyft availability", "bike sharing", "walking areas"],`
        }
        if (categories.transportation.publicTransit || categories.transportation.alternatives) {
          prompt += `\n    "paymentMethods": ["metro card info", "app recommendations", "cash vs card"],`
        }
        if (categories.transportation.airport) {
          prompt += `\n    "tips": ["airport connections", "practical transportation tips"],`
        } else {
          prompt += `\n    "tips": ["practical transportation tips"],`
        }
        prompt += `\n    "bikingInfrastructure": ["bike lanes and paths", "cycling safety", "bike-friendly infrastructure"] // include assessment of cycling infrastructure quality`
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

      // Food & Drink section
      if (categories?.foodAndDrink?.enabled) {
        prompt += `\n  "foodAndDrink": {`

        // Build array of enabled subcategories to handle commas correctly
        const enabledSubcategories = []

        if (categories.foodAndDrink.restaurants) {
          enabledSubcategories.push(
            '"localSpecialties": ["must-try dishes", "regional specialties"]'
          )
          enabledSubcategories.push(
            '"restaurants": ["highly recommended restaurants with brief descriptions"]'
          )
        }
        if (categories.foodAndDrink.cafes) {
          enabledSubcategories.push('"cafes": ["notable coffee shops", "local cafe culture"]')
        }
        if (categories.foodAndDrink.bars) {
          enabledSubcategories.push(
            '"bars": ["popular bars/nightlife areas", "local drinking culture"]'
          )
        }
        if (categories.foodAndDrink.streetFood) {
          enabledSubcategories.push('"streetFood": ["street food recommendations", "food markets"]')
        }

        // Always add tipping at the end
        enabledSubcategories.push(
          '"tipping": ["tipping customs", "typical amounts", "where to tip"]'
        )

        // Join with commas except for the last item
        for (let i = 0; i < enabledSubcategories.length; i++) {
          const isLast = i === enabledSubcategories.length - 1
          prompt += `\n    ${enabledSubcategories[i]}${isLast ? '' : ','}`
        }

        prompt += `\n  },`
      }

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

      // Physical Activities section
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

      // Practical section
      if (categories?.practical?.enabled) {
        prompt += `\n  "practical": {`
        if (categories.practical.currency) {
          prompt += `\n    "currency": "Local currency name",`
          prompt += `\n    "exchangeRate": "Approximate current exchange rate info",`
        }
        prompt += `\n    "paymentMethods": ["typical payment methods", "cash vs card acceptance", "mobile payments"],`
        prompt += `\n    "emergency": ["emergency numbers", "important contacts"],`
        if (categories.practical.safety) {
          prompt += `\n    "safety": ["safety tips", "areas to be aware of", "general precautions"],`
        }
        prompt += `\n    "culturalFauxPas": ["important things to avoid in public", "cultural sensitivities", "respectful behavior tips"],`
        prompt += `\n    "commonScams": ["tourist scams to watch out for", "how to avoid them"] // only include if location is known for specific scams,`
        if (categories.practical.localNews) {
          prompt += `\n    "localNews": ["current events to be aware of", "travel advisories"]`
        }
        prompt += `\n  },`
      }

      // Unique Souvenirs section
      prompt += `\n  "uniqueSouvenirs": {`
      prompt += `\n    "traditional": ["authentic local crafts", "traditional items unique to the region"],`
      prompt += `\n    "specialty": ["local specialty products", "foods/drinks to bring home"],`
      prompt += `\n    "whereToBuy": ["best places to shop for souvenirs", "local markets vs tourist shops"]`
      prompt += `\n  }`

      prompt += `\n}\n\nProvide specific, actionable information for each requested section. Make sure the response is valid JSON that can be parsed directly.`

      return prompt
    }

    const prompt = buildPrompt()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
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
      // Clean up the response text to handle markdown code blocks
      let cleanedText = content.text.trim()

      // Remove markdown code blocks if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      structuredData = JSON.parse(cleanedText)
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
    return NextResponse.json({ error: 'Failed to generate travel brief' }, { status: 500 })
  }
}
