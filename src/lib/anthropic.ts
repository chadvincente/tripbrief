import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export type CategoryOptions = {
  transportation: {
    enabled: boolean
    publicTransit: boolean
    alternatives: boolean
    airport: boolean
  }
  attractions: {
    enabled: boolean
    museums: boolean
    landmarks: boolean
    viewpoints: boolean
    experiences: boolean
  }
  foodAndDrink: {
    enabled: boolean
    restaurants: boolean
    streetFood: boolean
    bars: boolean
    cafes: boolean
  }
  neighborhoods: {
    enabled: boolean
    layout: boolean
    whereToStay: boolean
    character: boolean
  }
  cultureAndEvents: {
    enabled: boolean
    events: boolean
    sportsEvents: boolean
    customs: boolean
    language: boolean
  }
  dayTrips: {
    enabled: boolean
    nearbyDestinations: boolean
    transportation: boolean
    duration: boolean
  }
  activeAndSports: {
    enabled: boolean
    running: boolean
    cycling: boolean
    sports: boolean
    outdoorActivities: boolean
  }
  practical: {
    enabled: boolean
    currency: boolean
    safety: boolean
    localNews: boolean
  }
}

export type BudgetOption = 'budget-friendly' | 'standard' | 'luxury'

export type TravelBriefRequest = {
  destination: string
  startDate: string
  endDate: string
  categories?: CategoryOptions
  budget?: BudgetOption
}

export type StructuredTravelBrief = {
  destination: string
  startDate: string
  endDate: string
  transportation?: {
    publicTransit?: string[]
    alternatives?: string[]
    paymentMethods?: string[]
    tips?: string[]
  }
  attractions?: {
    mustSee?: string[]
    photoSpots?: string[]
    museums?: string[]
    experiences?: string[]
    offTheBeatenPath?: string[]
  }
  foodAndDrink?: {
    localSpecialties?: string[]
    restaurants?: string[]
    cafes?: string[]
    bars?: string[]
    streetFood?: string[]
    tipping?: string[]
  }
  neighborhoods?: {
    areas?: Array<{
      name: string
      character: string
      highlights: string[]
    }>
    layout?: string[]
    whereToStay?: string[]
  }
  cultureAndEvents?: {
    events?: string[]
    sportsEvents?: string[]
    customs?: string[]
    etiquette?: string[]
    language?: string[]
  }
  dayTrips?: {
    nearbyDestinations?: string[]
    transportation?: string[]
    duration?: string[]
  }
  activeAndSports?: {
    running?: string[]
    cycling?: string[]
    sports?: string[]
    outdoorActivities?: string[]
  }
  practical?: {
    currency?: string
    exchangeRate?: string
    paymentMethods?: string[]
    emergency?: string[]
    safety?: string[]
    localNews?: string[]
    culturalFauxPas?: string[]
    commonScams?: string[]
  }
  uniqueSouvenirs?: {
    traditional?: string[]
    specialty?: string[]
    whereToBuy?: string[]
  }
}

export type TravelBriefResponse = {
  structuredData: StructuredTravelBrief
  destination: string
  startDate: string
  endDate: string
}
