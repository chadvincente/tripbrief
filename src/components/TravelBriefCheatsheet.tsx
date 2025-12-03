import type { TravelBriefResponse, ExtendedTravelBrief } from '@/lib/anthropic'
import { useState, useEffect } from 'react'
import { getCityImageClient, getImageAttribution, type CityImage } from '@/lib/cityImages'
import { countryCodeToFlag, toTitleCase } from '@/lib/utils'

interface TravelBriefCheatsheetProps {
  data: TravelBriefResponse
  onSwitchToFullText?: () => void
}

export default function TravelBriefCheatsheet({
  data,
  onSwitchToFullText,
}: TravelBriefCheatsheetProps) {
  const brief = data.structuredData
  const [cityImage, setCityImage] = useState<CityImage | null>(null)
  const [imageLoading, setImageLoading] = useState(true)
  const [extendedData, setExtendedData] = useState<ExtendedTravelBrief | null>(null)
  const [loadingExtended, setLoadingExtended] = useState(false)
  const [showExtended, setShowExtended] = useState(false)

  // Fetch city image
  useEffect(() => {
    const fetchCityImage = async () => {
      try {
        const image = await getCityImageClient(brief.destination)
        setCityImage(image)
      } catch (error) {
        console.error('Error fetching city image:', error)
      } finally {
        setImageLoading(false)
      }
    }

    fetchCityImage()
  }, [brief.destination])

  // Fetch extended details
  const fetchExtendedDetails = async () => {
    if (extendedData || loadingExtended) return // Don't fetch if already loaded or loading

    setLoadingExtended(true)
    try {
      const response = await fetch('/api/generate-brief-extended', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: brief.destination,
          countryCode: brief.countryCode,
          travelMonth: data.travelMonth,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch extended details')
      }

      const result = await response.json()
      setExtendedData(result.extendedData)
      setShowExtended(true)
    } catch (error) {
      console.error('Error fetching extended details:', error)
    } finally {
      setLoadingExtended(false)
    }
  }

  // Combine related arrays for display with safe defaults
  const transportation = brief.transportation
    ? [
        ...(brief.transportation.publicTransit || []),
        ...(brief.transportation.alternatives || []),
        ...(brief.transportation.tips || []),
        ...(brief.transportation.bikingInfrastructure || []),
      ].slice(0, 6)
    : []

  const attractions = brief.attractions
    ? [
        ...(brief.attractions.mustSee || []),
        ...(brief.attractions.photoSpots || []),
        ...(brief.attractions.experiences || []),
        ...(brief.attractions.offTheBeatenPath || []),
      ].slice(0, 6)
    : []

  const food = brief.foodAndDrink
    ? (() => {
        // Build main food items (leave room for tipping)
        const mainItems = [
          ...(brief.foodAndDrink.localSpecialties || []),
          ...(brief.foodAndDrink.restaurants || []),
          ...(brief.foodAndDrink.streetFood || []),
          ...(brief.foodAndDrink.cafes || []),
          ...(brief.foodAndDrink.bars || []),
        ].slice(0, 5) // Take max 5 main items

        // Always add tipping at the end if it exists
        const tippingItems = brief.foodAndDrink.tipping || []

        return [...mainItems, ...tippingItems]
      })()
    : []

  const neighborhoods = brief.neighborhoods
    ? [
        ...(brief.neighborhoods.areas?.map((area) => `${area.name}: ${area.character}`) || []),
        ...(brief.neighborhoods.whereToStay || []),
      ].slice(0, 6)
    : []

  const dayTrips = brief.dayTrips
    ? [
        ...(brief.dayTrips.nearbyDestinations || []),
        ...(brief.dayTrips.transportation || []),
        ...(brief.dayTrips.duration || []),
      ].slice(0, 6)
    : []

  const activeAndSports = brief.activeAndSports
    ? [
        ...(brief.activeAndSports.running || []),
        ...(brief.activeAndSports.cycling || []),
        ...(brief.activeAndSports.sports || []),
        ...(brief.activeAndSports.outdoorActivities || []),
        ...(brief.activeAndSports.climbingGyms || []),
      ].slice(0, 6)
    : []

  const practical = brief.practical
    ? [
        ...(brief.practical.currency ? [`Currency: ${brief.practical.currency}`] : []),
        ...(brief.practical.exchangeRate ? [`Exchange: ${brief.practical.exchangeRate}`] : []),
        ...(brief.practical.paymentMethods || []),
        ...(brief.practical.safety || []),
        ...(brief.practical.culturalFauxPas || []),
        ...(brief.practical.commonScams || []),
      ].slice(0, 6)
    : []

  // Extended sections (loaded on demand)
  const localLife = extendedData?.localLife
    ? [
        ...(extendedData.localLife.everydayActivities || []),
        ...(extendedData.localLife.majorEvents || []),
        ...(extendedData.localLife.souvenirs || []),
      ]
    : []

  const bestSights = extendedData?.bestSights
    ? [
        ...(extendedData.bestSights.vantagePoints || []),
        ...(extendedData.bestSights.photoSpots || []),
      ]
    : []

  const culture = extendedData?.culture
    ? [...(extendedData.culture.customs || []), ...(extendedData.culture.fauxPas || [])]
    : []

  // Swiss style card component
  const IconCard = ({
    icon,
    title,
    items,
    color = 'blue',
  }: {
    icon: string
    title: string
    items: string[]
    color?: string
  }) => {
    // Swiss color accents
    const accentColors = {
      blue: 'bg-swiss-blue',
      green: 'bg-swiss-yellow',
      purple: 'bg-swiss-red',
      orange: 'bg-swiss-yellow',
      red: 'bg-swiss-red',
      indigo: 'bg-swiss-blue',
    }

    return (
      <div className="bg-swiss-white border border-swiss-gray-200 rounded-swiss-lg h-full relative group hover:shadow-swiss-md hover:border-swiss-gray-300 transition-all shadow-swiss">
        {/* Geometric accent element */}
        <div
          className={`absolute top-0 right-0 w-12 h-12 ${accentColors[color as keyof typeof accentColors] || accentColors.blue} opacity-10 rounded-tr-swiss-lg`}
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
        />

        <div className="p-8">
          {/* Header with icon and title */}
          <div className="flex items-start mb-6 pb-4 border-b border-swiss-gray-200">
            <span className="text-5xl mr-4 leading-none">{icon}</span>
            <h3 className="text-h3 font-semibold text-swiss-black leading-tight pt-2">{title}</h3>
          </div>

          {/* List items */}
          <ul className="space-y-3">
            {items.slice(0, 6).map((item, index) => (
              <li
                key={index}
                className="text-body text-swiss-gray-700 leading-relaxed flex items-start"
              >
                <span className="mr-3 text-swiss-blue font-bold text-sm">●</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
            {items.length > 6 && (
              <li className="text-body-sm text-swiss-gray-500 italic pt-2">
                {onSwitchToFullText ? (
                  <button
                    onClick={onSwitchToFullText}
                    className="hover:text-swiss-blue font-medium transition-colors"
                  >
                    +{items.length - 6} more →
                  </button>
                ) : (
                  `+${items.length - 6} more`
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
    )
  }

  // Swiss style quick fact card
  const QuickFactCard = ({ title, content }: { title: string; content: string }) => (
    <div className="bg-swiss-black rounded-swiss-lg p-6 relative overflow-hidden group hover:bg-swiss-gray-800 transition-colors shadow-swiss-md">
      <div className="absolute bottom-0 right-0 w-12 h-12 bg-swiss-blue opacity-20 group-hover:opacity-30 transition-opacity rounded-br-swiss-lg" />
      <h4 className="font-medium text-sm text-swiss-gray-300 mb-3">{title}</h4>
      <p className="text-body-lg text-swiss-white font-normal leading-relaxed">{content}</p>
    </div>
  )

  return (
    <div className="space-y-12">
      {/* Swiss Style Hero Header */}
      <div className="relative border border-swiss-gray-200 rounded-swiss-lg bg-swiss-white overflow-hidden shadow-swiss-lg">
        {/* Asymmetric background color block */}
        <div className="absolute top-0 right-0 w-2/5 h-full bg-swiss-blue opacity-[0.03]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-swiss-blue opacity-[0.02]" />

        {/* Background Image with blend mode */}
        {!imageLoading && cityImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-multiply"
            style={{
              backgroundImage: `url(${cityImage.url})`,
            }}
          />
        )}

        {/* Header Content - Swiss Typography */}
        <div className="relative z-10 p-12 md:p-16">
          <div className="max-w-4xl">
            {/* Accent bar */}
            <div className="w-20 h-1 bg-swiss-blue mb-8" />

            <h1 className="text-display font-bold text-swiss-black leading-none mb-6 uppercase">
              {brief.countryCode ? countryCodeToFlag(brief.countryCode) : '🌍'}
              <br />
              {toTitleCase(brief.destination)}
            </h1>

            {(data.travelMonth || (brief.startDate && brief.endDate)) && (
              <p className="text-h4 font-normal text-swiss-gray-600">
                {data.travelMonth || `${brief.startDate} — ${brief.endDate}`}
              </p>
            )}
          </div>

          {/* Geometric accent */}
          <div
            className="absolute bottom-0 right-0 w-40 h-40 bg-swiss-blue opacity-5 rounded-br-swiss-lg"
            style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
          />
        </div>
      </div>

      {/* Main Info Cards Grid - Swiss Grid System */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {transportation.length > 0 && (
          <IconCard icon="🚇" title="Transportation" items={transportation} color="blue" />
        )}
        {neighborhoods.length > 0 && (
          <IconCard icon="🏘️" title="Neighborhoods" items={neighborhoods} color="purple" />
        )}
        {food.length > 0 && <IconCard icon="🍽️" title="Food & Drink" items={food} color="orange" />}
        {attractions.length > 0 && (
          <IconCard icon="📸" title="Attractions" items={attractions} color="green" />
        )}
        {dayTrips.length > 0 && (
          <IconCard icon="🗺️" title="Day Trips" items={dayTrips} color="indigo" />
        )}
        {activeAndSports.length > 0 && (
          <IconCard icon="🏃" title="Staying Active" items={activeAndSports} color="green" />
        )}
      </div>

      {/* See More Button */}
      {!showExtended && (
        <div className="text-center">
          <button
            onClick={fetchExtendedDetails}
            disabled={loadingExtended}
            className="bg-swiss-blue border border-swiss-blue text-swiss-white px-12 py-5 rounded-swiss hover:bg-swiss-blue-dark transition-all disabled:bg-swiss-gray-400 disabled:border-swiss-gray-400 disabled:cursor-not-allowed shadow-swiss-md hover:shadow-swiss-lg"
          >
            <span className="text-lg font-semibold">
              {loadingExtended ? 'Loading more details...' : 'See more →'}
            </span>
          </button>
        </div>
      )}

      {/* Extended Sections Grid */}
      {showExtended && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localLife.length > 0 && (
            <IconCard icon="🌆" title="Local Life" items={localLife} color="blue" />
          )}
          {bestSights.length > 0 && (
            <IconCard icon="📷" title="Best Sights" items={bestSights} color="red" />
          )}
          {culture.length > 0 && (
            <IconCard icon="🎭" title="Culture" items={culture} color="purple" />
          )}
        </div>
      )}

      {/* Quick Reference - Swiss Style */}
      <div className="bg-swiss-black rounded-swiss-lg p-10 relative overflow-hidden shadow-swiss-lg">
        {/* Geometric accent */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-swiss-blue opacity-10 rounded-tl-swiss-lg" />
        <div
          className="absolute bottom-0 right-0 w-40 h-40 bg-swiss-blue opacity-5 rounded-br-swiss-lg"
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
        />

        <div className="relative z-10">
          <h3 className="text-h2 font-semibold text-swiss-white mb-8 flex items-center border-b border-swiss-gray-700 pb-4">
            <span className="mr-4 text-swiss-blue text-3xl">⚡</span>
            Quick reference
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickFactCard
              title="Emergency Numbers"
              content={brief.practical?.emergency?.join(', ') || 'Check local emergency services'}
            />
            <QuickFactCard
              title="Language Tips"
              content={brief.practical?.language?.join(', ') || 'Learn basic greetings'}
            />
            <QuickFactCard
              title="Currency & Exchange"
              content={brief.practical?.currency || 'Check current exchange rates'}
            />
          </div>
        </div>
      </div>

      {/* Footer Note - Swiss Style */}
      <div className="text-center border-t border-swiss-gray-200 pt-8">
        <p className="text-sm text-swiss-gray-600 font-medium">Generated by TripBrief</p>
        <p className="text-sm text-swiss-gray-500 mt-2">
          Double-check current information before traveling
        </p>
      </div>
    </div>
  )
}
