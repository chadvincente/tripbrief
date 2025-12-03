'use client'

import { useState, useEffect } from 'react'

interface MonthSelectorProps {
  name: string
  id: string
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export default function MonthSelector({
  name,
  id,
  value = '',
  onChange,
  className = '',
}: MonthSelectorProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('')

  // Parse initial value (just the month part)
  useEffect(() => {
    if (value) {
      setSelectedMonth(value)
    }
  }, [value])

  const months = [
    { value: '01', label: 'Jan', fullLabel: 'January' },
    { value: '02', label: 'Feb', fullLabel: 'February' },
    { value: '03', label: 'Mar', fullLabel: 'March' },
    { value: '04', label: 'Apr', fullLabel: 'April' },
    { value: '05', label: 'May', fullLabel: 'May' },
    { value: '06', label: 'Jun', fullLabel: 'June' },
    { value: '07', label: 'Jul', fullLabel: 'July' },
    { value: '08', label: 'Aug', fullLabel: 'August' },
    { value: '09', label: 'Sep', fullLabel: 'September' },
    { value: '10', label: 'Oct', fullLabel: 'October' },
    { value: '11', label: 'Nov', fullLabel: 'November' },
    { value: '12', label: 'Dec', fullLabel: 'December' },
  ]

  const handleMonthClick = (monthValue: string) => {
    if (selectedMonth === monthValue) {
      // Deselect if clicking the same month
      setSelectedMonth('')
      onChange?.('')
    } else {
      setSelectedMonth(monthValue)
      onChange?.(monthValue)
    }
  }

  return (
    <div className={className}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} id={id} value={selectedMonth} />

      {/* Month Button Grid - Swiss Style */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
        {months.map((month) => (
          <button
            key={month.value}
            type="button"
            onClick={() => handleMonthClick(month.value)}
            className={`px-3 py-2 md:px-4 md:py-3 text-sm font-medium transition-all duration-200 border rounded-swiss ${
              selectedMonth === month.value
                ? 'bg-swiss-blue text-swiss-white border-swiss-blue shadow-swiss'
                : 'bg-swiss-white text-swiss-gray-700 border-swiss-gray-300 hover:bg-swiss-gray-50 hover:border-swiss-gray-400'
            }`}
            title={month.fullLabel}
          >
            {month.label}
          </button>
        ))}
      </div>

      {/* Clear button - always reserve space to prevent layout shift */}
      <div className="mt-3 text-center h-6">
        <button
          type="button"
          onClick={() => handleMonthClick(selectedMonth)}
          className={`text-sm font-medium text-swiss-gray-500 hover:text-swiss-blue transition-colors ${
            selectedMonth ? 'visible' : 'invisible'
          }`}
        >
          Clear selection
        </button>
      </div>
    </div>
  )
}
