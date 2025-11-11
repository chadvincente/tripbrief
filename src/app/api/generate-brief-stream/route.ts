import { anthropic } from '@/lib/anthropic'
import type { CategoryOptions, BudgetOption } from '@/lib/anthropic'
import { NextRequest, NextResponse } from 'next/server'

interface StreamRequest {
  destination: string
  startDate?: string
  endDate?: string
  categories: CategoryOptions
  budget: BudgetOption
}

// Rate limiting storage (in-memory for now)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(ip: string): string {
  return `rate_limit:${ip}`
}

function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now()
  const key = getRateLimitKey(ip)
  const current = rateLimitStore.get(key)

  // Clean up expired entries
  if (current && now > current.resetTime) {
    rateLimitStore.delete(key)
  }

  const limit = rateLimitStore.get(key)

  if (!limit) {
    // First request from this IP
    rateLimitStore.set(key, { count: 1, resetTime: now + 60 * 1000 }) // 1 minute
    return { allowed: true }
  }

  const requestsPerMinute = parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '3')

  if (limit.count >= requestsPerMinute) {
    return { allowed: false, resetTime: limit.resetTime }
  }

  // Increment count
  limit.count++
  return { allowed: true }
}

function buildPrompt(
  destination: string,
  startDate?: string,
  endDate?: string,
  categories?: CategoryOptions,
  budget: BudgetOption = 'standard'
): string {
  const budgetGuidelines = {
    'budget-friendly':
      'Focus on budget-friendly options, hostels, street food, free attractions, and money-saving tips.',
    standard:
      'Balance of quality and value, mid-range options with some budget and some premium suggestions.',
    luxury:
      'Emphasize high-end experiences, luxury hotels, fine dining, premium attractions, and upscale activities.',
  }

  const enabledSections: string[] = []

  if (categories?.transportation?.enabled) {
    const transportDetails = []
    if (categories.transportation.publicTransit)
      transportDetails.push('public transit systems and passes')
    if (categories.transportation.alternatives)
      transportDetails.push('ride-sharing, taxis, and alternative transport')
    if (categories.transportation.airport)
      transportDetails.push('airport connections and transfers')
    enabledSections.push(`Transportation: ${transportDetails.join(', ')}`)
  }

  if (categories?.attractions?.enabled) {
    const attractionDetails = []
    if (categories.attractions.museums) attractionDetails.push('museums and cultural sites')
    if (categories.attractions.landmarks) attractionDetails.push('iconic landmarks and monuments')
    if (categories.attractions.viewpoints) attractionDetails.push('viewpoints and photo spots')
    if (categories.attractions.experiences) attractionDetails.push('unique local experiences')
    enabledSections.push(`Attractions: ${attractionDetails.join(', ')}`)
  }

  if (categories?.foodAndDrink?.enabled) {
    const foodDetails = []
    if (categories.foodAndDrink.restaurants) foodDetails.push('restaurants')
    if (categories.foodAndDrink.streetFood) foodDetails.push('street food')
    if (categories.foodAndDrink.bars) foodDetails.push('bars and nightlife')
    if (categories.foodAndDrink.cafes) foodDetails.push('cafes')
    enabledSections.push(`Food & Drink: ${foodDetails.join(', ')}`)
  }

  if (categories?.neighborhoods?.enabled) {
    const neighborhoodDetails = []
    if (categories.neighborhoods.layout) neighborhoodDetails.push('city layout and orientation')
    if (categories.neighborhoods.whereToStay)
      neighborhoodDetails.push('where to stay recommendations')
    if (categories.neighborhoods.character) neighborhoodDetails.push('neighborhood characteristics')
    enabledSections.push(`Neighborhoods: ${neighborhoodDetails.join(', ')}`)
  }

  if (categories?.cultureAndEvents?.enabled) {
    const cultureDetails = []
    if (categories.cultureAndEvents.events) cultureDetails.push('events and festivals')
    if (categories.cultureAndEvents.sportsEvents) cultureDetails.push('sports events')
    if (categories.cultureAndEvents.customs) cultureDetails.push('local customs and etiquette')
    if (categories.cultureAndEvents.language) cultureDetails.push('language basics and phrases')
    enabledSections.push(`Culture & Events: ${cultureDetails.join(', ')}`)
  }

  if (categories?.dayTrips?.enabled) {
    const dayTripDetails = []
    if (categories.dayTrips.nearbyDestinations) dayTripDetails.push('nearby destinations')
    if (categories.dayTrips.transportation) dayTripDetails.push('transportation options')
    if (categories.dayTrips.duration) dayTripDetails.push('recommended duration')
    enabledSections.push(`Day Trips: ${dayTripDetails.join(', ')}`)
  }

  if (categories?.activeAndSports?.enabled) {
    const activeDetails = []
    if (categories.activeAndSports.running) activeDetails.push('running routes and parks')
    if (categories.activeAndSports.cycling) activeDetails.push('cycling paths and bike rentals')
    if (categories.activeAndSports.sports) activeDetails.push('sports facilities and activities')
    if (categories.activeAndSports.outdoorActivities) activeDetails.push('outdoor activities')
    if (categories.activeAndSports.climbingGyms)
      activeDetails.push('climbing gyms and rock climbing')
    enabledSections.push(`Active & Sports: ${activeDetails.join(', ')}`)
  }

  if (categories?.practical?.enabled) {
    const practicalDetails = []
    if (categories.practical.currency) practicalDetails.push('currency and payment methods')
    if (categories.practical.safety) practicalDetails.push('safety information')
    if (categories.practical.localNews) practicalDetails.push('current local context')
    enabledSections.push(`Practical Information: ${practicalDetails.join(', ')}`)
  }

  const dateContext =
    startDate && endDate
      ? `for travel dates ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
      : 'for general travel planning'

  return `Generate a comprehensive travel brief for ${destination} ${dateContext}.

Budget preference: ${budget} (${budgetGuidelines[budget]})

Please provide information for these categories: ${enabledSections.join('; ')}.

Return the response as valid JSON with this exact structure:
{
  "destination": "${destination}",
  "startDate": ${startDate ? `"${startDate}"` : 'null'},
  "endDate": ${endDate ? `"${endDate}"` : 'null'},
  "transportation": {
    "publicTransit": [],
    "alternatives": [],
    "tips": [],
    "bikingInfrastructure": []
  },
  "attractions": {
    "mustSee": [],
    "photoSpots": [],
    "experiences": [],
    "offTheBeatenPath": []
  },
  "foodAndDrink": {
    "localSpecialties": [],
    "restaurants": [],
    "streetFood": [],
    "cafes": [],
    "bars": [],
    "tipping": []
  },
  "neighborhoods": {
    "areas": [{"name": "", "character": ""}],
    "whereToStay": []
  },
  "cultureAndEvents": {
    "events": [],
    "sportsEvents": [],
    "customs": [],
    "language": []
  },
  "dayTrips": {
    "nearbyDestinations": [],
    "transportation": [],
    "duration": []
  },
  "activeAndSports": {
    "running": [],
    "cycling": [],
    "sports": [],
    "outdoorActivities": [],
    "climbingGyms": []
  },
  "practical": {
    "currency": "",
    "exchangeRate": "",
    "paymentMethods": [],
    "safety": [],
    "culturalFauxPas": [],
    "commonScams": [],
    "emergency": []
  },
  "uniqueSouvenirs": {
    "traditional": [],
    "specialty": [],
    "whereToBuy": []
  }
}

Guidelines:
- Provide 3-5 specific, actionable items per array
- Include practical details when relevant
- Return only valid JSON, no markdown formatting or code blocks
- Keep responses concise but informative`
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(/, /)[0] : 'unknown'

    // Check rate limit
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed && rateLimit.resetTime) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please wait before trying again.',
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      )
    }

    const body: StreamRequest = await request.json()
    const { destination, startDate, endDate, categories, budget } = body

    if (!destination?.trim()) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 })
    }

    console.log(`🔄 Streaming travel brief for: ${destination}`)

    const prompt = buildPrompt(destination, startDate, endDate, categories, budget)

    // Create a ReadableStream for the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 4000,
            temperature: 0.7,
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          })

          let accumulatedContent = ''

          for await (const event of anthropicStream) {
            if (event.type === 'content_block_delta') {
              const chunk = event.delta.type === 'text_delta' ? event.delta.text : ''
              accumulatedContent += chunk

              // Send the chunk to the client
              const data = JSON.stringify({
                type: 'chunk',
                content: chunk,
                accumulated: accumulatedContent,
              })
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
            }

            if (event.type === 'message_stop') {
              // Try to parse the final accumulated content as JSON
              try {
                console.log('📦 Final accumulated content length:', accumulatedContent.length)
                console.log('🔍 Content preview:', accumulatedContent.slice(0, 200) + '...')
                console.log('🔍 Content ending:', '...' + accumulatedContent.slice(-200))

                // Remove potential markdown code blocks
                let cleanContent = accumulatedContent.trim()
                if (cleanContent.startsWith('```json')) {
                  cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '')
                  console.log('🧹 Removed ```json wrapper')
                } else if (cleanContent.startsWith('```')) {
                  cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '')
                  console.log('🧹 Removed ``` wrapper')
                }

                // Try to fix common JSON issues
                cleanContent = cleanContent.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']') // Remove trailing commas

                // Try to repair truncated JSON
                const openBraces = (cleanContent.match(/\{/g) || []).length
                const closeBraces = (cleanContent.match(/\}/g) || []).length
                const openBrackets = (cleanContent.match(/\[/g) || []).length
                const closeBrackets = (cleanContent.match(/\]/g) || []).length

                // Add missing closing braces/brackets
                for (let i = 0; i < openBraces - closeBraces; i++) {
                  cleanContent += '}'
                }
                for (let i = 0; i < openBrackets - closeBrackets; i++) {
                  cleanContent += ']'
                }

                // Remove incomplete string at the end
                if (cleanContent.endsWith('"')) {
                  // Find the last complete key-value pair
                  const lastCompleteIndex = Math.max(
                    cleanContent.lastIndexOf('},'),
                    cleanContent.lastIndexOf('],'),
                    cleanContent.lastIndexOf('",')
                  )
                  if (lastCompleteIndex > 0) {
                    cleanContent = cleanContent.substring(0, lastCompleteIndex + 1) + '}'
                  }
                }

                console.log('🧹 Clean content length:', cleanContent.length)
                console.log('🧹 Clean content preview:', cleanContent.slice(0, 200) + '...')
                console.log('🧹 Clean content ending:', '...' + cleanContent.slice(-200))

                const structuredData = JSON.parse(cleanContent)
                console.log('✅ Successfully parsed JSON')

                const finalData = JSON.stringify({
                  type: 'complete',
                  structuredData,
                  fullText: accumulatedContent,
                })
                controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`))
              } catch (parseError) {
                console.error('❌ Failed to parse final JSON:', parseError)
                console.error('🔍 Error details:', {
                  name: parseError instanceof Error ? parseError.name : 'Unknown',
                  message: parseError instanceof Error ? parseError.message : 'Unknown error',
                  contentLength: accumulatedContent.length,
                  lastChar: accumulatedContent.slice(-1),
                  hasOpenBrace: accumulatedContent.includes('{'),
                  hasCloseBrace: accumulatedContent.includes('}'),
                  braceBalance:
                    (accumulatedContent.match(/\{/g) || []).length -
                    (accumulatedContent.match(/\}/g) || []).length,
                })

                // Try to salvage partial JSON or provide meaningful error
                const errorData = JSON.stringify({
                  type: 'error',
                  error: `Failed to parse response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
                  rawContent:
                    accumulatedContent.slice(0, 1000) +
                    (accumulatedContent.length > 1000 ? '...(truncated)' : ''),
                  contentLength: accumulatedContent.length,
                })
                controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`))
              }

              controller.close()
              break
            }
          }
        } catch (error) {
          console.error('Streaming error:', error)

          // Handle specific error types with friendly messages
          let errorMessage =
            "Sorry, we've hit a temporary snag. Please give it another shot, or try again later."

          if (error instanceof Error) {
            if (error.message.includes('timeout') || error.message.includes('disconnect')) {
              errorMessage =
                "Sorry, we've hit a temporary snag. Please give it another shot, or try again later."
            } else if (error.message.includes('rate_limit') || error.message.includes('429')) {
              errorMessage = "We're experiencing high demand. Please wait a moment and try again."
            }
          }

          const errorData = JSON.stringify({
            type: 'error',
            error: errorMessage,
          })
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Stream setup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}
