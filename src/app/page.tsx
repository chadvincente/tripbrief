'use client'

import { useState } from 'react'
import type { TravelBriefResponse, CategoryOptions, BudgetOption } from '@/lib/anthropic'
import TravelBriefCheatsheet from '@/components/TravelBriefCheatsheet'
import TravelBriefText from '@/components/TravelBriefText'
import TravelMap from '@/components/TravelMap'
import Footer from '@/components/Footer'
import MonthSelector from '@/components/MonthSelector'
import { track } from '@vercel/analytics'
import Script from 'next/script'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<TravelBriefResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'cheatsheet' | 'text' | 'map'>('cheatsheet')
  const [travelMonth, setTravelMonth] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setProgress(0)
    setError(null)

    // Simulate progress with easing - reaches 95% in ~18 seconds, then slows dramatically
    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const seconds = elapsed / 1000

      // Easing function: fast at start, very slow at end
      // Reaches 95% at 18 seconds, then crawls to 99%
      let newProgress
      if (seconds < 18) {
        // Logarithmic growth to 95% over 18 seconds
        newProgress = 95 * (1 - Math.exp(-seconds / 6))
      } else {
        // Very slow crawl from 95% to 99%
        newProgress = 95 + 4 * (1 - Math.exp(-(seconds - 18) / 10))
      }

      setProgress(Math.min(newProgress, 99))
    }, 100)

    // Store interval ID to clear it later
    ;(window as any).progressInterval = progressInterval

    const formData = new FormData(e.currentTarget)
    const destination = formData.get('destination') as string
    // Use state value for travelMonth since it's now a controlled component

    // Convert month to human-readable format for the prompt
    let travelMonthText = ''
    let startDate = ''
    let endDate = ''
    if (travelMonth) {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() // 0-indexed (0 = January, 11 = December)
      const selectedMonth = parseInt(travelMonth) - 1 // Convert to 0-indexed

      // If the selected month has already passed this year, use next year
      const year = selectedMonth < currentMonth ? currentYear + 1 : currentYear

      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]
      travelMonthText = `${monthNames[selectedMonth]} ${year}`

      // Keep dates for backwards compatibility
      const startOfMonth = new Date(year, selectedMonth, 1)
      const endOfMonth = new Date(year, selectedMonth + 1, 0)
      startDate = startOfMonth.toISOString().split('T')[0]
      endDate = endOfMonth.toISOString().split('T')[0]
    }

    if (!destination.trim()) {
      setError('Please enter a city')
      setLoading(false)
      return
    }

    try {
      // All categories enabled by default
      const categories: CategoryOptions = {
        transportation: { enabled: true, publicTransit: true, alternatives: true, airport: true },
        attractions: {
          enabled: true,
          museums: true,
          landmarks: true,
          viewpoints: true,
          experiences: true,
        },
        foodAndDrink: {
          enabled: true,
          restaurants: true,
          streetFood: true,
          bars: true,
          cafes: true,
        },
        neighborhoods: { enabled: true, layout: true, whereToStay: true, character: true },
        cultureAndEvents: {
          enabled: true,
          events: true,
          sportsEvents: true,
          customs: true,
          language: true,
        },
        dayTrips: { enabled: true, nearbyDestinations: true, transportation: true, duration: true },
        activeAndSports: {
          enabled: true,
          running: true,
          cycling: true,
          sports: true,
          outdoorActivities: true,
          climbingGyms: true,
        },
        practical: { enabled: true, currency: true, safety: true, localNews: true },
      }
      const budget: BudgetOption = 'standard'

      // Track the search event with both analytics platforms
      const searchData = {
        destination: destination.trim(),
        travelMonth: travelMonth || null,
        startDate: startDate || null,
        endDate: endDate || null,
        hasTravelMonth: !!travelMonth,
      }

      // Umami Analytics (custom analytics)
      if (typeof window !== 'undefined' && window.umami) {
        // Umami v2 syntax with properties
        window.umami.track('travel-brief-search', searchData)

        // Fallback: track destination as separate event name for better visibility
        window.umami.track(
          `destination-${searchData.destination.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
        )

        // Track whether travel month was provided
        if (searchData.hasTravelMonth) {
          window.umami.track('search-with-travel-month')
        } else {
          window.umami.track('search-without-travel-month')
        }
      }

      // Vercel Analytics (performance + events)
      track('Travel Brief Generated', searchData)

      const response = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: destination.trim(),
          travelMonth: travelMonthText,
          startDate,
          endDate,
          categories,
          budget,
        }),
      })

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (jsonError) {
          // If we can't parse the error response, show a friendly message
          throw new Error(
            "Sorry, we've hit a temporary snag. Please give it another shot, or try again later."
          )
        }

        if (response.status === 429) {
          // Handle rate limiting (both our rate limit and Anthropic's)
          if (errorData.resetTime) {
            const resetTime = new Date(errorData.resetTime)
            const waitMinutes = Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60))
            throw new Error(
              `${errorData.error} Please wait ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''} before trying again.`
            )
          } else {
            throw new Error(
              errorData.error ||
                "We're experiencing high demand. Please wait a moment and try again."
            )
          }
        }

        throw new Error(
          errorData.error ||
            "Sorry, we've hit a temporary snag. Please give it another shot, or try again later."
        )
      }

      let data: TravelBriefResponse
      try {
        data = await response.json()
      } catch (jsonError) {
        // If we can't parse the successful response, show a friendly message
        throw new Error(
          "Sorry, we've hit a temporary snag. Please give it another shot, or try again later."
        )
      }

      // Clear progress interval and jump to 100%
      if ((window as any).progressInterval) {
        clearInterval((window as any).progressInterval)
      }
      setProgress(100)

      // Small delay to show 100% before hiding
      await new Promise((resolve) => setTimeout(resolve, 300))

      setResult(data)
    } catch (err) {
      // Clear progress interval on error
      if ((window as any).progressInterval) {
        clearInterval((window as any).progressInterval)
      }
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-swiss-white">
        {/* Geometric accent elements */}
        <div
          className="fixed top-0 right-0 w-96 h-96 bg-swiss-yellow opacity-20 -z-10"
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
        />
        <div className="fixed bottom-0 left-0 w-64 h-64 bg-swiss-blue opacity-10 -z-10" />

        <main className="container mx-auto px-6 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header with Swiss typography */}
            <div className="mb-12 border-b border-swiss-gray-200 pb-8">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setResult(null)}
                  className="px-6 py-3 bg-swiss-black text-swiss-white hover:bg-swiss-gray-800 transition-all font-medium rounded-swiss shadow-swiss"
                >
                  ← New search
                </button>

                {/* View mode switcher - Swiss style */}
                <div className="flex gap-0 border border-swiss-gray-300 rounded-swiss overflow-hidden shadow-swiss">
                  <button
                    onClick={() => setViewMode('cheatsheet')}
                    className={`px-6 py-3 text-sm font-medium transition-all ${
                      viewMode === 'cheatsheet'
                        ? 'bg-swiss-black text-swiss-white'
                        : 'bg-swiss-white text-swiss-gray-700 hover:bg-swiss-gray-50'
                    }`}
                  >
                    Cheatsheet
                  </button>
                  <button
                    onClick={() => setViewMode('text')}
                    className={`px-6 py-3 text-sm font-medium transition-all border-l border-swiss-gray-300 ${
                      viewMode === 'text'
                        ? 'bg-swiss-black text-swiss-white'
                        : 'bg-swiss-white text-swiss-gray-700 hover:bg-swiss-gray-50'
                    }`}
                  >
                    Full text
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-6 py-3 text-sm font-medium transition-all border-l border-swiss-gray-300 ${
                      viewMode === 'map'
                        ? 'bg-swiss-black text-swiss-white'
                        : 'bg-swiss-white text-swiss-gray-700 hover:bg-swiss-gray-50'
                    }`}
                  >
                    Map
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'cheatsheet' ? (
              <TravelBriefCheatsheet data={result} onSwitchToFullText={() => setViewMode('text')} />
            ) : viewMode === 'text' ? (
              <TravelBriefText data={result} />
            ) : (
              <TravelMap data={result} />
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-swiss-white flex flex-col relative overflow-hidden">
      {/* Geometric background elements - Swiss style */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-swiss-blue opacity-[0.02] -z-10" />
      <div className="fixed top-1/4 left-0 w-12 h-64 bg-swiss-blue opacity-80 -z-10" />
      <div
        className="fixed bottom-0 right-1/4 w-64 h-64 bg-swiss-yellow opacity-10 -z-10 rounded-swiss-lg"
        style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0 100%)' }}
      />

      <main className="container mx-auto px-6 py-16 flex-1">
        {/* Hero section - Bold Swiss typography */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="relative flex items-center gap-20">
            {/* Accent bar */}
            <div className="absolute -left-6 top-0 w-1 h-20 bg-swiss-blue" />

            <div className="flex-shrink-0">
              <h1 className="text-display font-bold text-swiss-black leading-none tracking-tight uppercase">
                Trip
                <br />
                Brief
              </h1>
            </div>

            <div className="flex-1 max-w-xl">
              <p className="text-h4 text-swiss-gray-700 font-normal leading-relaxed mb-3">
                Comprehensive travel information for any city in seconds.
              </p>
              <p className="text-body-lg text-swiss-gray-500 leading-relaxed">
                Select a travel month for seasonal recommendations, or leave it blank for general
                information.
              </p>
            </div>
          </div>
        </div>

        {/* Form - Grid-based Swiss layout */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-swiss-white border border-swiss-gray-200 rounded-swiss-lg p-12 shadow-swiss-md relative">
            {/* Subtle corner accent */}
            <div
              className="absolute top-0 right-0 w-20 h-20 bg-swiss-blue opacity-5 rounded-tr-swiss-lg -z-10"
              style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
            />

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-12 gap-6 items-start">
                <label
                  htmlFor="destination"
                  className="col-span-3 text-sm font-medium text-swiss-gray-600 pt-4"
                >
                  City
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  placeholder="Tokyo, Paris, New York..."
                  required
                  className="col-span-9 px-0 py-3 border-0 border-b-2 border-swiss-gray-300 bg-transparent focus:outline-none focus:border-swiss-blue text-h4 font-normal text-swiss-black placeholder:text-swiss-gray-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-12 gap-6 items-start">
                <label
                  htmlFor="travelMonth"
                  className="col-span-3 text-sm font-medium text-swiss-gray-600 pt-4"
                >
                  Travel month
                  <br />
                  <span className="text-swiss-gray-400 font-normal text-xs">(Optional)</span>
                </label>
                <div className="col-span-9">
                  <MonthSelector
                    id="travelMonth"
                    name="travelMonth"
                    value={travelMonth}
                    onChange={setTravelMonth}
                    className="w-full"
                  />
                </div>
              </div>

              {error && (
                <div className="border-l-2 border-swiss-red bg-swiss-red bg-opacity-5 px-6 py-4 rounded-swiss">
                  <p className="text-body text-swiss-red font-medium">{error}</p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-swiss-blue hover:bg-swiss-blue-dark disabled:bg-swiss-gray-400 disabled:cursor-not-allowed text-swiss-white font-semibold py-5 px-8 transition-all text-lg rounded-swiss shadow-swiss-md hover:shadow-swiss-lg"
                >
                  {loading ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center text-base">
                        Generating travel brief...
                      </div>
                      <div className="w-full bg-swiss-blue-dark h-1.5 overflow-hidden rounded-full">
                        <div
                          className="bg-swiss-yellow h-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs font-medium opacity-80">{Math.round(progress)}%</div>
                    </div>
                  ) : (
                    'Generate travel brief'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Features Grid - Swiss style */}
        <div className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="p-10 border border-swiss-gray-200 rounded-swiss-lg relative group hover:border-swiss-blue hover:shadow-swiss-md transition-all bg-swiss-white">
            <div className="absolute top-0 left-0 w-1 h-16 bg-swiss-blue rounded-tl-swiss-lg" />
            <div className="text-h1 mb-6">🚇</div>
            <h3 className="text-h3 font-semibold text-swiss-black mb-3 transition-colors">
              Transportation
            </h3>
            <p className="text-body text-swiss-gray-600 leading-relaxed transition-colors">
              Public transit, rideshare options, and local transportation
            </p>
          </div>

          <div className="p-10 border border-swiss-gray-200 rounded-swiss-lg relative group hover:border-swiss-blue hover:shadow-swiss-md transition-all bg-swiss-white">
            <div className="absolute top-0 left-0 w-1 h-16 bg-swiss-blue rounded-tl-swiss-lg" />
            <div className="text-h1 mb-6">📸</div>
            <h3 className="text-h3 font-semibold text-swiss-black mb-3 transition-colors">
              Attractions
            </h3>
            <p className="text-body text-swiss-gray-600 leading-relaxed transition-colors">
              Must-see sights, photo spots, and hidden gems
            </p>
          </div>

          <div className="p-10 border border-swiss-gray-200 rounded-swiss-lg relative group hover:border-swiss-blue hover:shadow-swiss-md transition-all bg-swiss-white">
            <div className="absolute top-0 left-0 w-1 h-16 bg-swiss-blue rounded-tl-swiss-lg" />
            <div className="text-h1 mb-6">🍽️</div>
            <h3 className="text-h3 font-semibold text-swiss-black mb-3 transition-colors">
              Local life
            </h3>
            <p className="text-body text-swiss-gray-600 leading-relaxed transition-colors">
              Restaurants, cafes, culture, and local insights
            </p>
          </div>
        </div>

        {/* Newsletter Signup - Swiss style */}
        <div className="mt-28 max-w-3xl mx-auto bg-swiss-black rounded-swiss-lg p-12 shadow-swiss-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-40 h-40 bg-swiss-blue opacity-10 rounded-tr-swiss-lg"
            style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
          />

          <div className="relative z-10">
            <h2 className="text-h2 font-semibold text-swiss-white mb-4">
              Get travel tips & updates
            </h2>
            <p className="text-body-lg text-swiss-gray-300 mb-8 max-w-xl leading-relaxed">
              Join fellow travelers for destination insights, new features, and curated travel tips.
            </p>

            {/* MailerLite Form */}
            <div className="ml-embedded" data-form="SSrfUE"></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
