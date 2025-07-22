import type { TravelBriefResponse } from '@/lib/anthropic'

interface TravelBriefCheatsheetProps {
  data: TravelBriefResponse
}

export default function TravelBriefCheatsheet({ data }: TravelBriefCheatsheetProps) {
  const brief = data.structuredData

  // Combine related arrays for display
  const transportation = [
    ...brief.transportation.publicTransit,
    ...brief.transportation.alternatives,
    ...brief.transportation.tips
  ].slice(0, 6)

  const attractions = [
    ...brief.attractions.mustSee,
    ...brief.attractions.photoSpots,
    ...brief.attractions.experiences
  ].slice(0, 6)

  const food = [
    ...brief.foodAndDrink.localSpecialties,
    ...brief.foodAndDrink.restaurants,
    ...brief.foodAndDrink.streetFood
  ].slice(0, 6)

  const neighborhoods = [
    ...brief.neighborhoods.areas.map(area => `${area.name}: ${area.character}`),
    ...brief.neighborhoods.whereToStay
  ].slice(0, 6)

  const events = [
    ...brief.cultureAndEvents.events,
    ...brief.cultureAndEvents.customs,
    ...brief.cultureAndEvents.language
  ].slice(0, 6)

  const practical = [
    `Currency: ${brief.practical.currency}`,
    `Exchange: ${brief.practical.exchangeRate}`,
    ...brief.practical.tipping,
    ...brief.practical.safety
  ].slice(0, 6)

  const IconCard = ({ icon, title, items, color = 'blue' }: { 
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
      indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
    }

    return (
      <div className={`p-6 rounded-xl border-2 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} h-full`}>
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
              ...and {items.length - 6} more
            </li>
          )}
        </ul>
      </div>
    )
  }

  const QuickFactCard = ({ title, content }: { title: string, content: string }) => (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-700 dark:text-gray-300">{content}</p>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          📍 {brief.destination}
        </h1>
        {brief.startDate && brief.endDate && (
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {new Date(brief.startDate).toLocaleDateString()} - {new Date(brief.endDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Main Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <IconCard 
          icon="🚇" 
          title="Transportation" 
          items={transportation}
          color="blue"
        />
        <IconCard 
          icon="📸" 
          title="Must-See Attractions" 
          items={attractions}
          color="green"
        />
        <IconCard 
          icon="🍽️" 
          title="Food & Drink" 
          items={food}
          color="orange"
        />
        <IconCard 
          icon="🏘️" 
          title="Neighborhoods" 
          items={neighborhoods}
          color="purple"
        />
        <IconCard 
          icon="🎭" 
          title="Culture & Events" 
          items={events}
          color="red"
        />
        <IconCard 
          icon="💡" 
          title="Practical Tips" 
          items={practical}
          color="indigo"
        />
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
            content={brief.practical.emergency.join(', ') || 'Check local emergency services'} 
          />
          <QuickFactCard 
            title="Language Tips" 
            content={brief.cultureAndEvents.language.slice(0, 2).join(', ') || 'Learn basic greetings'} 
          />
          <QuickFactCard 
            title="Currency & Exchange" 
            content={`${brief.practical.currency} - ${brief.practical.exchangeRate}`} 
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