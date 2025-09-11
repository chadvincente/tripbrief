'use client'

import { useState } from 'react'
import type { CategoryOptions, BudgetOption } from '@/lib/anthropic'

interface AdvancedSearchModalProps {
  isOpen: boolean
  onClose: () => void
  categories: CategoryOptions
  onCategoriesChange: (categories: CategoryOptions) => void
  budget: BudgetOption
  onBudgetChange: (budget: BudgetOption) => void
}

export default function AdvancedSearchModal({
  isOpen,
  onClose,
  categories,
  onCategoriesChange,
  budget,
  onBudgetChange,
}: AdvancedSearchModalProps) {
  if (!isOpen) return null

  const updateCategory = (
    mainCategory: keyof CategoryOptions,
    subCategory?: string,
    value?: boolean
  ) => {
    const newCategories = { ...categories }

    if (subCategory && value !== undefined) {
      // Update sub-category
      ;(newCategories[mainCategory] as any)[subCategory] = value
    } else {
      // Toggle main category
      newCategories[mainCategory].enabled = !newCategories[mainCategory].enabled

      // If disabling main category, disable all sub-categories
      if (!newCategories[mainCategory].enabled) {
        Object.keys(newCategories[mainCategory]).forEach((key) => {
          if (key !== 'enabled') {
            ;(newCategories[mainCategory] as any)[key] = false
          }
        })
      } else {
        // If enabling main category, enable all sub-categories
        Object.keys(newCategories[mainCategory]).forEach((key) => {
          if (key !== 'enabled') {
            ;(newCategories[mainCategory] as any)[key] = true
          }
        })
      }
    }

    onCategoriesChange(newCategories)
  }

  const CategorySection = ({
    title,
    icon,
    mainKey,
    subCategories,
  }: {
    title: string
    icon: string
    mainKey: keyof CategoryOptions
    subCategories: { key: string; label: string }[]
  }) => {
    const isMainEnabled = categories[mainKey].enabled

    return (
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id={mainKey}
            checked={isMainEnabled}
            onChange={() => updateCategory(mainKey)}
            className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label
            htmlFor={mainKey}
            className="flex items-center text-lg font-semibold text-gray-900 dark:text-white cursor-pointer"
          >
            <span className="mr-2">{icon}</span>
            {title}
          </label>
        </div>

        {isMainEnabled && (
          <div className="ml-7 space-y-2">
            {subCategories.map(({ key, label }) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${mainKey}-${key}`}
                  checked={(categories[mainKey] as any)[key]}
                  onChange={(e) => updateCategory(mainKey, key, e.target.checked)}
                  className="mr-2 w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={`${mainKey}-${key}`}
                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🎯 Customize Your Travel Brief
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Select the information categories you&apos;re most interested in. You can customize what
            gets included in your travel brief.
          </p>

          {/* Budget Selection */}
          <div className="mb-8 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="mr-2">💰</span>
              Budget Preference
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose your budget level to get personalized recommendations for accommodations,
              dining, and activities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  value: 'budget-friendly' as BudgetOption,
                  label: '💸 Budget-Friendly',
                  description: 'Affordable options, local experiences, budget accommodations',
                },
                {
                  value: 'standard' as BudgetOption,
                  label: '💳 Standard',
                  description: 'Mid-range options, good value for money, comfortable stays',
                },
                {
                  value: 'luxury' as BudgetOption,
                  label: '💎 Luxury',
                  description: 'Premium experiences, high-end dining, luxury accommodations',
                },
              ].map((option) => (
                <div key={option.value} className="relative">
                  <input
                    type="radio"
                    id={option.value}
                    name="budget"
                    value={option.value}
                    checked={budget === option.value}
                    onChange={() => onBudgetChange(option.value)}
                    className="sr-only peer"
                  />
                  <label
                    htmlFor={option.value}
                    className="flex flex-col p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white mb-2">
                      {option.label}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategorySection
              title="Transportation"
              icon="🚇"
              mainKey="transportation"
              subCategories={[
                { key: 'publicTransit', label: 'Public transit systems' },
                { key: 'alternatives', label: 'Rideshare & alternatives' },
                { key: 'airport', label: 'Airport connections' },
              ]}
            />

            <CategorySection
              title="Attractions"
              icon="📸"
              mainKey="attractions"
              subCategories={[
                { key: 'museums', label: 'Museums & galleries' },
                { key: 'landmarks', label: 'Famous landmarks' },
                { key: 'viewpoints', label: 'Photo spots & viewpoints' },
                { key: 'experiences', label: 'Unique experiences' },
              ]}
            />

            <CategorySection
              title="Food & Drink"
              icon="🍽️"
              mainKey="foodAndDrink"
              subCategories={[
                { key: 'restaurants', label: 'Restaurants' },
                { key: 'streetFood', label: 'Street food & markets' },
                { key: 'bars', label: 'Bars & nightlife' },
                { key: 'cafes', label: 'Cafes & coffee culture' },
              ]}
            />

            <CategorySection
              title="Neighborhoods"
              icon="🏘️"
              mainKey="neighborhoods"
              subCategories={[
                { key: 'layout', label: 'City layout & geography' },
                { key: 'whereToStay', label: 'Where to stay' },
                { key: 'character', label: 'Neighborhood character' },
              ]}
            />

            <CategorySection
              title="Culture & Events"
              icon="🎭"
              mainKey="cultureAndEvents"
              subCategories={[
                { key: 'events', label: 'Local events & festivals' },
                { key: 'sportsEvents', label: 'Professional sports events' },
                { key: 'customs', label: 'Cultural customs & etiquette' },
                { key: 'language', label: 'Language tips' },
              ]}
            />

            <CategorySection
              title="Day Trips"
              icon="🗺️"
              mainKey="dayTrips"
              subCategories={[
                { key: 'nearbyDestinations', label: 'Nearby destinations & attractions' },
                { key: 'transportation', label: 'How to get there' },
                { key: 'duration', label: 'Duration & timing recommendations' },
              ]}
            />

            <CategorySection
              title="Physical Activities"
              icon="🏃"
              mainKey="activeAndSports"
              subCategories={[
                { key: 'running', label: 'Running routes & parks' },
                { key: 'cycling', label: 'Bike routes & rentals' },
                { key: 'sports', label: 'Local sports & fitness' },
                { key: 'outdoorActivities', label: 'Hiking & outdoor activities' },
                { key: 'climbingGyms', label: 'Climbing gyms & rock climbing' },
              ]}
            />

            <CategorySection
              title="Practical Info"
              icon="💡"
              mainKey="practical"
              subCategories={[
                { key: 'currency', label: 'Currency & payments' },
                { key: 'safety', label: 'Safety tips' },
                { key: 'localNews', label: 'Local news & advisories' },
              ]}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
