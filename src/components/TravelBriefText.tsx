import type { TravelBriefResponse } from '@/lib/anthropic'

interface TravelBriefTextProps {
  data: TravelBriefResponse
}

export default function TravelBriefText({ data }: TravelBriefTextProps) {
  const brief = data.structuredData

  const formatList = (items: string[], prefix = '• '): string => {
    return items.map((item) => `${prefix}${item}`).join('\n')
  }

  let formattedText = `# Travel Brief for ${brief.destination}

${brief.startDate && brief.endDate ? `**Travel Dates:** ${new Date(brief.startDate).toLocaleDateString()} - ${new Date(brief.endDate).toLocaleDateString()}` : ''}`

  // Transportation section
  if (brief.transportation) {
    formattedText += `\n\n## 🚇 Transportation & Getting Around\n`
    if (brief.transportation.publicTransit?.length) {
      formattedText += `\n### Public Transit\n${formatList(brief.transportation.publicTransit)}\n`
    }
    if (brief.transportation.alternatives?.length) {
      formattedText += `\n### Alternative Transportation\n${formatList(brief.transportation.alternatives)}\n`
    }
    if (brief.transportation.paymentMethods?.length) {
      formattedText += `\n### Payment Methods\n${formatList(brief.transportation.paymentMethods)}\n`
    }
    if (brief.transportation.tips?.length) {
      formattedText += `\n### Transportation Tips\n${formatList(brief.transportation.tips)}\n`
    }
    if (brief.transportation.bikingInfrastructure?.length) {
      formattedText += `\n### Biking Infrastructure\n${formatList(brief.transportation.bikingInfrastructure)}\n`
    }
  }

  // Attractions section
  if (brief.attractions) {
    formattedText += `\n## 📸 Must-See Attractions & Photo Spots\n`
    if (brief.attractions.mustSee?.length) {
      formattedText += `\n### Top Attractions\n${formatList(brief.attractions.mustSee)}\n`
    }
    if (brief.attractions.photoSpots?.length) {
      formattedText += `\n### Photo Spots\n${formatList(brief.attractions.photoSpots)}\n`
    }
    if (brief.attractions.museums?.length) {
      formattedText += `\n### Museums & Cultural Sites\n${formatList(brief.attractions.museums)}\n`
    }
    if (brief.attractions.experiences?.length) {
      formattedText += `\n### Unique Experiences\n${formatList(brief.attractions.experiences)}\n`
    }
    if (brief.attractions.offTheBeatenPath?.length) {
      formattedText += `\n### Off the Beaten Path\n${formatList(brief.attractions.offTheBeatenPath)}\n`
    }
  }

  // Food & Drink section
  if (brief.foodAndDrink) {
    formattedText += `\n## 🍽️ Food & Drink\n`
    if (brief.foodAndDrink.localSpecialties?.length) {
      formattedText += `\n### Local Specialties\n${formatList(brief.foodAndDrink.localSpecialties)}\n`
    }
    if (brief.foodAndDrink.restaurants?.length) {
      formattedText += `\n### Recommended Restaurants\n${formatList(brief.foodAndDrink.restaurants)}\n`
    }
    if (brief.foodAndDrink.cafes?.length) {
      formattedText += `\n### Cafes & Coffee Culture\n${formatList(brief.foodAndDrink.cafes)}\n`
    }
    if (brief.foodAndDrink.bars?.length) {
      formattedText += `\n### Bars & Nightlife\n${formatList(brief.foodAndDrink.bars)}\n`
    }
    if (brief.foodAndDrink.streetFood?.length) {
      formattedText += `\n### Street Food\n${formatList(brief.foodAndDrink.streetFood)}\n`
    }
    if (brief.foodAndDrink.tipping?.length) {
      formattedText += `\n### Tipping Customs\n${formatList(brief.foodAndDrink.tipping)}\n`
    }
  }

  // Neighborhoods section
  if (brief.neighborhoods) {
    formattedText += `\n## 🏘️ Neighborhoods & City Layout\n`
    if (brief.neighborhoods.areas?.length) {
      formattedText += `\n### Key Areas\n${brief.neighborhoods.areas
        .map(
          (area) =>
            `• **${area.name}**: ${area.character}\n  ${formatList(area.highlights, '  - ')}`
        )
        .join('\n\n')}\n`
    }
    if (brief.neighborhoods.layout?.length) {
      formattedText += `\n### City Layout\n${formatList(brief.neighborhoods.layout)}\n`
    }
    if (brief.neighborhoods.whereToStay?.length) {
      formattedText += `\n### Where to Stay\n${formatList(brief.neighborhoods.whereToStay)}\n`
    }
  }

  // Culture & Events section
  if (brief.cultureAndEvents) {
    formattedText += `\n## 🎭 Culture & Events\n`
    if (brief.cultureAndEvents.events?.length) {
      formattedText += `\n### Events During Your Visit\n${formatList(brief.cultureAndEvents.events)}\n`
    }
    if (brief.cultureAndEvents.sportsEvents?.length) {
      formattedText += `\n### Professional Sports Events\n${formatList(brief.cultureAndEvents.sportsEvents)}\n`
    }
    if (brief.cultureAndEvents.customs?.length) {
      formattedText += `\n### Cultural Customs\n${formatList(brief.cultureAndEvents.customs)}\n`
    }
    if (brief.cultureAndEvents.etiquette?.length) {
      formattedText += `\n### Etiquette Tips\n${formatList(brief.cultureAndEvents.etiquette)}\n`
    }
    if (brief.cultureAndEvents.language?.length) {
      formattedText += `\n### Language Tips\n${formatList(brief.cultureAndEvents.language)}\n`
    }
  }

  // Day Trips section
  if (brief.dayTrips) {
    formattedText += `\n## 🗺️ Day Trips\n`
    if (brief.dayTrips.nearbyDestinations?.length) {
      formattedText += `\n### Nearby Destinations\n${formatList(brief.dayTrips.nearbyDestinations)}\n`
    }
    if (brief.dayTrips.transportation?.length) {
      formattedText += `\n### How to Get There\n${formatList(brief.dayTrips.transportation)}\n`
    }
    if (brief.dayTrips.duration?.length) {
      formattedText += `\n### Duration & Timing\n${formatList(brief.dayTrips.duration)}\n`
    }
  }

  // Staying Active section
  if (brief.activeAndSports) {
    formattedText += `\n## 🏃 Staying Active\n`
    if (brief.activeAndSports.running?.length) {
      formattedText += `\n### Running Routes & Parks\n${formatList(brief.activeAndSports.running)}\n`
    }
    if (brief.activeAndSports.cycling?.length) {
      formattedText += `\n### Cycling & Bike Rentals\n${formatList(brief.activeAndSports.cycling)}\n`
    }
    if (brief.activeAndSports.sports?.length) {
      formattedText += `\n### Local Sports & Fitness\n${formatList(brief.activeAndSports.sports)}\n`
    }
    if (brief.activeAndSports.outdoorActivities?.length) {
      formattedText += `\n### Hiking & Outdoor Activities\n${formatList(brief.activeAndSports.outdoorActivities)}\n`
    }
    if (brief.activeAndSports.climbingGyms?.length) {
      formattedText += `\n### Climbing Gyms & Rock Climbing\n${formatList(brief.activeAndSports.climbingGyms)}\n`
    }
  }

  // Practical section
  if (brief.practical) {
    formattedText += `\n## 💡 Practical Information\n`
    if (brief.practical.currency) {
      formattedText += `\n**Currency:** ${brief.practical.currency}\n`
    }
    if (brief.practical.exchangeRate) {
      formattedText += `**Exchange Rate:** ${brief.practical.exchangeRate}\n`
    }
    if (brief.practical.paymentMethods?.length) {
      formattedText += `\n### Payment Methods\n${formatList(brief.practical.paymentMethods)}\n`
    }
    if (brief.practical.emergency?.length) {
      formattedText += `\n### Emergency Information\n${formatList(brief.practical.emergency)}\n`
    }
    if (brief.practical.safety?.length) {
      formattedText += `\n### Safety Tips\n${formatList(brief.practical.safety)}\n`
    }
    if (brief.practical.culturalFauxPas?.length) {
      formattedText += `\n### Cultural Do's and Don'ts\n${formatList(brief.practical.culturalFauxPas)}\n`
    }
    if (brief.practical.commonScams?.length) {
      formattedText += `\n### Common Scams to Avoid\n${formatList(brief.practical.commonScams)}\n`
    }
    if (brief.practical.localNews?.length) {
      formattedText += `\n### Local News & Current Events\n${formatList(brief.practical.localNews)}\n`
    }
  }

  // Unique Souvenirs section
  if (brief.uniqueSouvenirs) {
    formattedText += `\n## 🎁 Unique Souvenirs\n`
    if (brief.uniqueSouvenirs.traditional?.length) {
      formattedText += `\n### Traditional Items\n${formatList(brief.uniqueSouvenirs.traditional)}\n`
    }
    if (brief.uniqueSouvenirs.specialty?.length) {
      formattedText += `\n### Specialty Products\n${formatList(brief.uniqueSouvenirs.specialty)}\n`
    }
    if (brief.uniqueSouvenirs.whereToBuy?.length) {
      formattedText += `\n### Where to Shop\n${formatList(brief.uniqueSouvenirs.whereToBuy)}\n`
    }
  }

  formattedText += `\n---\n*Generated by TripBrief • Double-check current information before traveling*`

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <div className="prose dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{formattedText}</div>
      </div>
    </div>
  )
}
