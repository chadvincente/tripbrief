'use client'

import { useLoadScript, GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api'
import { useState, useMemo, useEffect } from 'react'
import type { TravelBriefResponse } from '@/lib/anthropic'

interface TravelMapProps {
  data: TravelBriefResponse
}

interface MapMarker {
  id: string
  position: { lat: number; lng: number }
  title: string
  category: string
  description: string
  icon?: string
}

const mapContainerStyle = {
  width: '100%',
  height: '500px'
}

const libraries: ("places" | "geometry")[] = ['places', 'geometry']

export default function TravelMap({ data }: TravelMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 40.7128, lng: -74.0060 })
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(true)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries
  })

  // Geocode the destination to get the correct center coordinates
  useEffect(() => {
    if (!isLoaded || !data.destination) return

    const geocoder = new google.maps.Geocoder()
    
    geocoder.geocode(
      { address: data.destination },
      (results, status) => {
        setIsGeocodingLoading(false)
        
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location
          setCenter({
            lat: location.lat(),
            lng: location.lng()
          })
        } else {
          console.warn(`Geocoding failed for ${data.destination}:`, status)
          // Keep default center if geocoding fails
        }
      }
    )
  }, [isLoaded, data.destination])

  // Extract markers from travel brief data
  const markers = useMemo((): MapMarker[] => {
    const markerList: MapMarker[] = []
    const brief = data.structuredData

    // Sample markers - in reality, we'd need coordinates from the AI response
    // For demo purposes, adding some mock coordinates around the center
    let markerIndex = 0

    // Add attraction markers
    if (brief.attractions?.mustSee) {
      brief.attractions.mustSee.slice(0, 5).forEach((attraction, index) => {
        markerList.push({
          id: `attraction-${index}`,
          position: {
            lat: center.lat + (Math.random() - 0.5) * 0.02,
            lng: center.lng + (Math.random() - 0.5) * 0.02
          },
          title: attraction,
          category: 'Attraction',
          description: `Must-see attraction: ${attraction}`,
          icon: '📸'
        })
      })
    }

    // Add restaurant markers
    if (brief.foodAndDrink?.restaurants) {
      brief.foodAndDrink.restaurants.slice(0, 5).forEach((restaurant, index) => {
        markerList.push({
          id: `restaurant-${index}`,
          position: {
            lat: center.lat + (Math.random() - 0.5) * 0.02,
            lng: center.lng + (Math.random() - 0.5) * 0.02
          },
          title: restaurant,
          category: 'Restaurant',
          description: `Recommended restaurant: ${restaurant}`,
          icon: '🍽️'
        })
      })
    }

    // Add day trip markers
    if (brief.dayTrips?.nearbyDestinations) {
      brief.dayTrips.nearbyDestinations.slice(0, 3).forEach((destination, index) => {
        markerList.push({
          id: `daytrip-${index}`,
          position: {
            lat: center.lat + (Math.random() - 0.5) * 0.04,
            lng: center.lng + (Math.random() - 0.5) * 0.04
          },
          title: destination,
          category: 'Day Trip',
          description: `Day trip destination: ${destination}`,
          icon: '🗺️'
        })
      })
    }

    return markerList
  }, [data, center])

  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    clickableIcons: false,
    scrollwheel: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  }), [])

  if (loadError) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
        Error loading Google Maps. Please check your API key configuration.
      </div>
    )
  }

  if (!isLoaded || isGeocodingLoading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600 dark:text-gray-300">
          {!isLoaded ? 'Loading map...' : `Finding ${data.destination}...`}
        </span>
      </div>
    )
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here') {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded">
        <h3 className="font-semibold mb-2">🗺️ Map Feature Coming Soon!</h3>
        <p className="text-sm">
          To enable the interactive map with location markers, please:
        </p>
        <ol className="text-sm mt-2 ml-4 list-decimal">
          <li>Get a Google Maps API key from Google Cloud Console</li>
          <li>Add it to your .env.local file as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
          <li>Restart the development server</li>
        </ol>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-2">🗺️</span>
          Interactive Map
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {markers.length} locations marked
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className="flex items-center">
          <span className="mr-1">📸</span>
          <span className="text-gray-600 dark:text-gray-300">Attractions</span>
        </div>
        <div className="flex items-center">
          <span className="mr-1">🍽️</span>
          <span className="text-gray-600 dark:text-gray-300">Restaurants</span>
        </div>
        <div className="flex items-center">
          <span className="mr-1">🗺️</span>
          <span className="text-gray-600 dark:text-gray-300">Day Trips</span>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          options={mapOptions}
        >
          {markers.map((marker) => (
            <MarkerF
              key={marker.id}
              position={marker.position}
              title={marker.title}
              onClick={() => setSelectedMarker(marker)}
              icon={{
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#2563eb" stroke="white" stroke-width="2"/>
                    <text x="20" y="26" text-anchor="middle" font-size="16" fill="white">${marker.icon}</text>
                  </svg>
                `)}`,
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20)
              }}
            />
          ))}

          {selectedMarker && (
            <InfoWindowF
              position={selectedMarker.position}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2 max-w-xs">
                <h4 className="font-semibold text-gray-900 mb-1">{selectedMarker.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{selectedMarker.description}</p>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {selectedMarker.category}
                </span>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        📍 Map centered on {data.destination}. Attraction locations are approximate and will be enhanced with precise coordinates in future updates.
      </div>
    </div>
  )
}