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
      `Travel brief request: ${destination} (${timeContext}) from IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`
    )

    // Build concise prompt with custom format (not JSON)
    const buildPrompt = () => {
      const budgetInstructions = {
        'budget-friendly': 'Focus on affordable options and money-saving tips',
        standard: 'Mid-range recommendations with good value',
        luxury: 'Premium experiences and upscale options',
      }

      const timeCtx =
        travelMonth || (startDate && endDate ? `${startDate} to ${endDate}` : 'anytime')

      let prompt = `Create a brief travel guide for ${destination} (${timeCtx}).
Budget: ${budget.toUpperCase()} - ${budgetInstructions[budget as keyof typeof budgetInstructions]}

REQUIRED FORMAT - Start with these exact lines first:
City: [Canonical city name, properly formatted]
Country: [2-letter ISO country code]

For example, if user searches "duublin" or "dublin", return:
City: Dublin
Country: IE

Then provide the sections below.

CRITICAL: Keep it concise! 3-5 bullet points per section maximum. Use this exact format:

`

      if (categories?.transportation?.enabled) {
        prompt += `## Transportation
- [Public transit overview with costs and best mobile apps for trip planning and buying fares]
- [Uber/taxi availability]
- [Airport to city info]
- [Bike-friendliness: infrastructure quality, bike lanes, safety]
- [1-2 key tips]

`
      }

      if (categories?.foodAndDrink?.enabled) {
        prompt += `## Food & Drink
- [Cuisine highlight 1: what the city is known for]
- [Cuisine highlight 2: local specialties or dishes]
- [Place to eat 1: specific restaurant or food area]
- [Place to eat 2: specific restaurant or food area]
- Tipping: [REQUIRED - tipping customs, expected percentages, and when/where to tip]

`
      }

      if (categories?.neighborhoods?.enabled) {
        prompt += `## Neighborhoods
- [General city geography/layout overview]
- [Neighborhood 1]: [location relative to city geography, character, why visit]
- [Neighborhood 2]: [location relative to city geography, character, why visit]
- [Neighborhood 3]: [location relative to city geography, character, why visit]
- [Where to stay: best area recommendation]

`
      }

      if (categories?.attractions?.enabled) {
        prompt += `## Attractions
- [Must-see 1]
- [Must-see 2]
- [Must-see 3]
- [Hidden gem 1]
- [Hidden gem 2]

`
      }

      if (categories?.cultureAndEvents?.enabled) {
        prompt += `## Culture & Events
- Events: [Festivals/events during visit - be specific]
- Customs: [2-3 key cultural norms]

`
      }

      if (categories?.dayTrips?.enabled) {
        prompt += `## Day Trips
- [Destination 1]: [how to get there, how long]
- [Destination 2]: [how to get there, how long]
- [Destination 3]: [how to get there, how long]
- [Destination 4]: [how to get there, how long]
- [Destination 5]: [how to get there, how long]

`
      }

      if (categories?.activeAndSports?.enabled) {
        prompt += `## Active & Sports
- [Running/cycling route or venue]
- [Outdoor activity option]
- [Gym/climbing option if applicable]
- [Activity 4: water sports, hiking, etc.]
- [Activity 5: other physical activity]

`
      }

      if (categories?.practical?.enabled) {
        prompt += `## Practical Info
- Currency: [Currency name and approximate exchange rate to USD]
- Language: [3-5 essential phrases with translations, e.g., "Hello - Bonjour"]
- Emergency: [Emergency numbers - police, ambulance, fire]
- Payment: [Cash vs card guidance]
- Safety: [2-3 key safety tips]
- Scams: [Common tourist scams to avoid]

`
      }

      prompt += `Keep responses practical and specific. Skip generic advice.`

      return prompt
    }

    const prompt = buildPrompt()

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
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
    const parseResponse = (text: string) => {
      const sections: any = {
        destination,
        startDate,
        endDate,
      }

      // Extract city and country code if present
      console.log('🔍 First 200 chars of response:', text.substring(0, 200))

      const cityMatch = text.match(/City:\s*(.+)/i)
      if (cityMatch) {
        sections.destination = cityMatch[1].trim()
        console.log('✅ Extracted city name:', sections.destination)
      } else {
        console.log('❌ No city name found, using original:', destination)
      }

      const countryMatch = text.match(/Country:\s*([A-Z]{2})/i)
      if (countryMatch) {
        sections.countryCode = countryMatch[1].toUpperCase()
        console.log('✅ Extracted country code:', sections.countryCode)
      } else {
        console.log('❌ No country code found in response')
      }

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
        console.log(`📑 Found section: "${sectionName}"`)

        // Parse bullet points and clean markdown
        const bullets = sectionContent
          .split('\n')
          .filter((line) => line.trim().startsWith('-'))
          .map((line) => cleanMarkdown(line.replace(/^-\s*/, '').trim()))

        // Parse key-value pairs like "Must-Try: ..." or "- Key: value"
        const keyValueRegex = /^-?\s*([^:]+):\s*(.+)$/gm
        const keyValues: any = {}
        let kvMatch
        while ((kvMatch = keyValueRegex.exec(sectionContent)) !== null) {
          const key = cleanMarkdown(kvMatch[1].trim()) // Clean markdown from keys too
          const value = cleanMarkdown(kvMatch[2].trim())
          keyValues[key] = value
        }

        // Map sections to our data structure
        if (sectionName === 'Transportation') {
          sections.transportation = {
            tips: bullets,
            // Don't duplicate - publicTransit info is already in tips
          }
        } else if (sectionName === 'Food & Drink') {
          // Filter out tipping from bullets since we extract it separately
          const foodBullets = bullets.filter((b) => !b.startsWith('Tipping:'))
          sections.foodAndDrink = {
            localSpecialties: keyValues['Must-Try'] ? [keyValues['Must-Try']] : [],
            restaurants: foodBullets,
            tipping: keyValues['Tipping'] ? [`Tipping: ${keyValues['Tipping']}`] : [],
          }
        } else if (sectionName === 'Neighborhoods') {
          // Filter out "Where to Stay" from bullets since we extract it separately
          const neighborhoodBullets = bullets.filter((b) => !b.startsWith('Where to Stay:'))
          sections.neighborhoods = {
            areas: neighborhoodBullets.map((b) => {
              const [name, ...rest] = b.split(':')
              return { name: name.trim(), character: rest.join(':').trim(), highlights: [] }
            }),
            whereToStay: keyValues['Where to Stay']
              ? [`Where to Stay: ${keyValues['Where to Stay']}`]
              : [],
          }
        } else if (sectionName === 'Attractions') {
          sections.attractions = {
            mustSee: bullets.slice(0, 3),
            offTheBeatenPath: bullets.slice(3),
          }
        } else if (sectionName === 'Culture & Events') {
          sections.cultureAndEvents = {
            events: keyValues['Events'] ? [keyValues['Events']] : [],
            customs: keyValues['Customs'] ? [keyValues['Customs']] : [],
          }
        } else if (sectionName === 'Day Trips') {
          sections.dayTrips = {
            nearbyDestinations: bullets,
          }
        } else if (sectionName === 'Active & Sports') {
          sections.activeAndSports = {
            outdoorActivities: bullets,
            // Don't duplicate - all activities are already in outdoorActivities
          }
        } else if (sectionName === 'Practical Info') {
          console.log('📋 Practical Info raw content:', sectionContent.substring(0, 300))
          console.log('📋 Practical Info keyValues:', keyValues)
          sections.practical = {
            currency: keyValues['Currency'] || '',
            language: keyValues['Language'] ? [keyValues['Language']] : [],
            emergency: keyValues['Emergency'] ? [keyValues['Emergency']] : [],
            paymentMethods: keyValues['Payment'] ? [keyValues['Payment']] : [],
            safety: keyValues['Safety'] ? [keyValues['Safety']] : [],
            commonScams: keyValues['Scams'] ? [keyValues['Scams']] : [],
          }
          console.log('📋 Practical Info parsed:', {
            currency: sections.practical.currency,
            language: sections.practical.language,
            emergency: sections.practical.emergency,
          })
        }
      }

      return sections
    }

    const structuredData = parseResponse(content.text)

    return NextResponse.json({
      structuredData,
      destination,
      startDate,
      endDate,
      fullText: content.text, // Also return the raw text for debugging
    })
  } catch (error) {
    console.error('❌ Error generating travel brief:', error)

    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }

    return NextResponse.json(
      {
        error:
          "Sorry, we've hit a temporary snag. Please give it another shot, or try again later.",
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
