'use client'

import { useState } from 'react'
import type { TravelBriefResponse, CategoryOptions } from '@/lib/anthropic'
import TravelBriefCheatsheet from '@/components/TravelBriefCheatsheet'
import TravelBriefText from '@/components/TravelBriefText'
import TravelMap from '@/components/TravelMap'
import Footer from '@/components/Footer'
import AdvancedSearchModal from '@/components/AdvancedSearchModal'
import { track } from '@vercel/analytics'
import Script from 'next/script'

// Default category settings (all enabled)
const defaultCategories: CategoryOptions = {
  transportation: { enabled: true, publicTransit: true, alternatives: true, airport: true },
  attractions: { enabled: true, museums: true, landmarks: true, viewpoints: true, experiences: true },
  foodAndDrink: { enabled: true, restaurants: true, streetFood: true, bars: true, cafes: true },
  neighborhoods: { enabled: true, layout: true, whereToStay: true, character: true },
  cultureAndEvents: { enabled: true, events: true, sportsEvents: true, customs: true, language: true },
  dayTrips: { enabled: true, nearbyDestinations: true, transportation: true, duration: true },
  activeAndSports: { enabled: true, running: true, cycling: true, sports: true, outdoorActivities: true },
  practical: { enabled: true, currency: true, safety: true, localNews: true }
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TravelBriefResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'cheatsheet' | 'text' | 'map'>('cheatsheet')
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [categories, setCategories] = useState<CategoryOptions>(defaultCategories)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const destination = formData.get('destination') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string

    if (!destination.trim()) {
      setError('Please enter a destination')
      setLoading(false)
      return
    }

    try {
      // Analyze enabled categories for analytics
      const enabledCategories = Object.entries(categories)
        .filter(([_, config]) => config.enabled)
        .map(([key, _]) => key)
      
      const categoryCount = enabledCategories.length
      const isCustomized = categoryCount < 8 // Less than all 8 categories
      
      // Track the search event with both analytics platforms
      const searchData = {
        destination: destination.trim(),
        startDate: startDate || null,
        endDate: endDate || null,
        hasDateRange: !!(startDate && endDate),
        enabledCategories: enabledCategories.join(','),
        categoryCount,
        isCustomized
      }

      // Umami Analytics (custom analytics)
      if (typeof window !== 'undefined' && window.umami) {
        // Umami v2 syntax with properties
        window.umami.track('travel-brief-search', searchData)
        
        // Fallback: track destination as separate event name for better visibility
        window.umami.track(`destination-${searchData.destination.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)
        
        // Track whether dates were provided
        if (searchData.hasDateRange) {
          window.umami.track('search-with-date-range')
        } else {
          window.umami.track('search-without-dates')
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
          startDate,
          endDate,
          categories,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 429) {
          const resetTime = new Date(errorData.resetTime)
          const waitMinutes = Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60))
          throw new Error(`${errorData.error} Please wait ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''} before trying again.`)
        }
        throw new Error(errorData.error || 'Failed to generate travel brief')
      }

      const data: TravelBriefResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-4 mb-6">
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-200"
                >
                  ← New Search
                </button>
                
                <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
                  <button
                    onClick={() => setViewMode('cheatsheet')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                      viewMode === 'cheatsheet'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    📋 Cheatsheet
                  </button>
                  <button
                    onClick={() => setViewMode('text')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                      viewMode === 'text'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    📄 Full Text
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                      viewMode === 'map'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    🗺️ Map
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'cheatsheet' ? (
              <TravelBriefCheatsheet data={result} />
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            TripBrief
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get comprehensive travel information for any destination in seconds. 
            From public transit to local culture, we&apos;ve got you covered.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Destination
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                placeholder="e.g., Tokyo, Japan"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Travel Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Return Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Your Travel Brief...
                  </div>
                ) : (
                  'Generate My Travel Brief'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setShowAdvancedSearch(true)}
                className="w-full text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-2 transition duration-200 flex items-center justify-center"
              >
                🎯 Advanced Options
                <span className="ml-2 text-sm">(Customize categories)</span>
              </button>
            </div>
          </form>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              🚇
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Transportation</h3>
            <p className="text-gray-600 dark:text-gray-300">Public transit info, rideshare options, and local transportation tips</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              📸
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Attractions</h3>
            <p className="text-gray-600 dark:text-gray-300">Must-see sights, photo spots, and hidden gems</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              🍽️
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Local Life</h3>
            <p className="text-gray-600 dark:text-gray-300">Restaurants, cafes, culture, and local insights</p>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-20 max-w-2xl mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-8 text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              ✈️ Get Travel Tips & Updates
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Join fellow travelers for destination insights, new features, and curated travel tips delivered to your inbox.
            </p>
          </div>
          
          {/* MailerLite Form */}
          <div className="ml-embedded" data-form="SSrfUE"></div>
        </div>
      </main>
      <Footer />
      
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        categories={categories}
        onCategoriesChange={setCategories}
      />
    </div>
  )
}