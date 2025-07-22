import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export type TravelBriefRequest = {
  destination: string
  startDate: string
  endDate: string
}

export type StructuredTravelBrief = {
  destination: string
  startDate: string
  endDate: string
  transportation: {
    publicTransit: string[]
    alternatives: string[]
    paymentMethods: string[]
    tips: string[]
  }
  attractions: {
    mustSee: string[]
    photoSpots: string[]
    museums: string[]
    experiences: string[]
  }
  foodAndDrink: {
    localSpecialties: string[]
    restaurants: string[]
    cafes: string[]
    bars: string[]
    streetFood: string[]
  }
  neighborhoods: {
    areas: Array<{
      name: string
      character: string
      highlights: string[]
    }>
    layout: string[]
    whereToStay: string[]
  }
  cultureAndEvents: {
    events: string[]
    customs: string[]
    etiquette: string[]
    language: string[]
  }
  practical: {
    currency: string
    exchangeRate: string
    tipping: string[]
    emergency: string[]
    safety: string[]
    localNews: string[]
  }
}

export type TravelBriefResponse = {
  structuredData: StructuredTravelBrief
  destination: string
  startDate: string
  endDate: string
}