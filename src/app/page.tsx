'use client'

import { useState } from 'react'
import type { TravelBriefResponse } from '@/lib/anthropic'
import TravelBriefCheatsheet from '@/components/TravelBriefCheatsheet'
import TravelBriefText from '@/components/TravelBriefText'
import Footer from '@/components/Footer'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TravelBriefResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'cheatsheet' | 'text'>('cheatsheet')

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
      // Track the search event with Umami (only in production)
      if (typeof window !== 'undefined' && window.umami) {
        window.umami.track('travel-brief-search', {
          destination: destination.trim(),
          startDate: startDate || null,
          endDate: endDate || null,
          hasDateRange: !!(startDate && endDate)
        })
      }

      const response = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: destination.trim(),
          startDate,
          endDate,
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
                </div>
              </div>
            </div>

            {viewMode === 'cheatsheet' ? (
              <TravelBriefCheatsheet data={result} />
            ) : (
              <TravelBriefText data={result} />
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
                  Start Date
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
                  End Date
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
      </main>
      <Footer />
    </div>
  )
}