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

CRITICAL: Keep it concise! 3-5 bullet points per section maximum. Use this exact format:

`

      if (categories?.transportation?.enabled) {
        prompt += `## Transportation
- [Public transit overview with costs]
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
- [Cuisine highlight 3: food culture/dining style]
- [Place to eat 1: specific restaurant or food area]
- [Place to eat 2: specific restaurant or food area]
- Tipping: [customs and amounts - REQUIRED]

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
Events: [Festivals/events during visit]
Customs: [2-3 key cultural norms]
Language: [3-5 key phrases]

`
      }

      if (categories?.dayTrips?.enabled) {
        prompt += `## Day Trips
- [Destination 1]: [how to get there, how long]
- [Destination 2]: [how to get there, how long]
- [Destination 3]: [how to get there, how long]

`
      }

      if (categories?.activeAndSports?.enabled) {
        prompt += `## Active & Sports
- [Running/cycling route or venue]
- [Outdoor activity option]
- [Gym/climbing option if applicable]

`
      }

      if (categories?.practical?.enabled) {
        prompt += `## Practical Info
Currency: [Currency + exchange rate]
Payment: [Cash vs card guidance]
Safety: [2-3 key safety tips]
Scams: [Common tourist scams to avoid]
Emergency: [Emergency numbers]

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

        // Parse key-value pairs like "Must-Try: ..."
        const keyValueRegex = /^([^:]+):\s*(.+)$/gm
        const keyValues: any = {}
        let kvMatch
        while ((kvMatch = keyValueRegex.exec(sectionContent)) !== null) {
          keyValues[kvMatch[1].trim()] = cleanMarkdown(kvMatch[2].trim())
        }

        // Map sections to our data structure
        if (sectionName === 'Transportation') {
          sections.transportation = {
            tips: bullets,
            // Don't duplicate - publicTransit info is already in tips
          }
        } else if (sectionName === 'Food & Drink') {
          sections.foodAndDrink = {
            localSpecialties: keyValues['Must-Try'] ? [keyValues['Must-Try']] : [],
            restaurants: bullets,
            tipping: keyValues['Tipping'] ? [keyValues['Tipping']] : [],
          }
        } else if (sectionName === 'Neighborhoods') {
          sections.neighborhoods = {
            areas: bullets.map((b) => {
              const [name, ...rest] = b.split(':')
              return { name: name.trim(), character: rest.join(':').trim(), highlights: [] }
            }),
            whereToStay: keyValues['Where to Stay'] ? [keyValues['Where to Stay']] : [],
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
            language: keyValues['Language'] ? [keyValues['Language']] : [],
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
          sections.practical = {
            currency: keyValues['Currency'] || '',
            paymentMethods: keyValues['Payment'] ? [keyValues['Payment']] : [],
            safety: keyValues['Safety'] ? [keyValues['Safety']] : [],
            commonScams: keyValues['Scams'] ? [keyValues['Scams']] : [],
            emergency: keyValues['Emergency'] ? [keyValues['Emergency']] : [],
          }
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
