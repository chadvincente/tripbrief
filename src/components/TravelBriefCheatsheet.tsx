import type { TravelBriefResponse } from '@/lib/anthropic'
import { useState, useEffect } from 'react'
import { getCityImageClient, getImageAttribution, type CityImage } from '@/lib/cityImages'

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

  const events = brief.cultureAndEvents
    ? [
        ...(brief.cultureAndEvents.events || []),
        ...(brief.cultureAndEvents.sportsEvents || []),
        ...(brief.cultureAndEvents.customs || []),
        ...(brief.cultureAndEvents.language || []),
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

  const souvenirs = brief.uniqueSouvenirs
    ? [
        ...(brief.uniqueSouvenirs.traditional || []),
        ...(brief.uniqueSouvenirs.specialty || []),
        ...(brief.uniqueSouvenirs.whereToBuy || []),
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
    const colorClasses = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    }

    return (
      <div
        className={`p-6 rounded-xl border-2 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} h-full`}
      >
        <div className="flex items-center mb-4">
          <span className="text-3xl mr-3">{icon}</span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <ul className="space-y-2">
          {items.slice(0, 6).map((item, index) => (
            <li key={index} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              • {item}
            </li>
          ))}
          {items.length > 6 && (
            <li className="text-sm text-gray-500 dark:text-gray-400 italic">
              {onSwitchToFullText ? (
                <button
                  onClick={onSwitchToFullText}
                  className="hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer transition-colors"
                >
                  ...and {items.length - 6} more
                </button>
              ) : (
                `...and ${items.length - 6} more`
              )}
            </li>
          )}
        </ul>
      </div>
    )
  }

  const QuickFactCard = ({ title, content }: { title: string; content: string }) => (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-700 dark:text-gray-300">{content}</p>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header with Background Image */}
      <div className="relative rounded-xl overflow-hidden">
        {/* Background Image */}
        {imageLoading ? (
          <div className="h-64 bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse" />
        ) : (
          <div
            className="h-64 bg-cover bg-center bg-gray-200 dark:bg-gray-700"
            style={{
              backgroundImage: cityImage ? `url(${cityImage.url})` : undefined,
            }}
          />
        )}

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />

        {/* Header Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            📍 {brief.destination}
          </h1>
        </div>

        {/* Optional: Image Attribution (not required for Pexels, but nice to have) */}
        {false &&
          cityImage &&
          (() => {
            const attribution = getImageAttribution(cityImage!)
            return (
              attribution && (
                <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                  {attribution}
                </div>
              )
            )
          })()}
      </div>

      {/* Main Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {transportation.length > 0 && (
          <IconCard icon="🚇" title="Transportation" items={transportation} color="blue" />
        )}
        {attractions.length > 0 && (
          <IconCard icon="📸" title="Must-See Attractions" items={attractions} color="green" />
        )}
        {food.length > 0 && <IconCard icon="🍽️" title="Food & Drink" items={food} color="orange" />}
        {neighborhoods.length > 0 && (
          <IconCard icon="🏘️" title="Neighborhoods" items={neighborhoods} color="purple" />
        )}
        {events.length > 0 && (
          <IconCard icon="🎭" title="Culture & Events" items={events} color="red" />
        )}
        {dayTrips.length > 0 && (
          <IconCard icon="🗺️" title="Day Trips" items={dayTrips} color="indigo" />
        )}
        {activeAndSports.length > 0 && (
          <IconCard icon="🏃" title="Physical Activities" items={activeAndSports} color="green" />
        )}
        {practical.length > 0 && (
          <IconCard icon="💡" title="Practical Tips" items={practical} color="indigo" />
        )}
        {souvenirs.length > 0 && (
          <IconCard icon="🎁" title="Unique Souvenirs" items={souvenirs} color="purple" />
        )}
      </div>

      {/* Quick Facts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="mr-3">⚡</span>
          Quick Reference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickFactCard
            title="Emergency Numbers"
            content={brief.practical?.emergency?.join(', ') || 'Check local emergency services'}
          />
          <QuickFactCard
            title="Language Tips"
            content={
              brief.cultureAndEvents?.language?.slice(0, 2).join(', ') || 'Learn basic greetings'
            }
          />
          <QuickFactCard
            title="Currency & Exchange"
            content={
              brief.practical?.currency && brief.practical?.exchangeRate
                ? `${brief.practical.currency} - ${brief.practical.exchangeRate}`
                : 'Check current exchange rates'
            }
          />
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Generated by TripBrief • Double-check current information before traveling
      </div>
    </div>
  )
}
