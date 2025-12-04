'use client'

import { useLoadScript, GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api'
import { useState, useMemo, useEffect } from 'react'
import type { TravelBriefResponse } from '@/lib/anthropic'

interface PlaceCoordinate {
  name: string
  lat: number
  lng: number
  address?: string
  rating?: number
}

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
  height: '500px',
}

const libraries: ('places' | 'geometry')[] = ['places', 'geometry']

export default function TravelMap({ data }: TravelMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 40.7128, lng: -74.006 })
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(true)
  const [placeCoordinates, setPlaceCoordinates] = useState<(PlaceCoordinate | null)[]>([])
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  })

  // Geocode the destination to get the correct center coordinates
  useEffect(() => {
    if (!isLoaded || !data.destination) return

    const geocoder = new google.maps.Geocoder()

    geocoder.geocode({ address: data.destination }, (results, status) => {
      setIsGeocodingLoading(false)

      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location
        setCenter({
          lat: location.lat(),
          lng: location.lng(),
        })
      } else {
        console.warn(`Geocoding failed for ${data.destination}:`, status)
        // Keep default center if geocoding fails
      }
    })
  }, [isLoaded, data.destination])

  // Fetch coordinates for attractions and restaurants
  useEffect(() => {
    if (!isLoaded || isGeocodingLoading) return

    const fetchPlaceCoordinates = async () => {
      setIsLoadingPlaces(true)

      try {
        const brief = data.structuredData
        const places: string[] = []

        // Collect attraction names
        if (brief.attractions?.mustSee) {
          places.push(...brief.attractions.mustSee.slice(0, 3))
        }

        // Collect restaurant names
        if (brief.foodAndDrink?.restaurants) {
          places.push(...brief.foodAndDrink.restaurants.slice(0, 3))
        }

        if (places.length > 0) {
          const response = await fetch('/api/place-coordinates', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              places: places,
              cityName: brief.destination,
            }),
          })

          if (response.ok) {
            const { coordinates } = await response.json()
            setPlaceCoordinates(coordinates)
          } else {
            console.error('Failed to fetch place coordinates')
          }
        }
      } catch (error) {
        console.error('Error fetching place coordinates:', error)
      } finally {
        setIsLoadingPlaces(false)
      }
    }

    fetchPlaceCoordinates()
  }, [isLoaded, isGeocodingLoading, data.structuredData, data.structuredData.destination])

  // Extract markers from travel brief data using real coordinates
  const markers = useMemo((): MapMarker[] => {
    const markerList: MapMarker[] = []
    const brief = data.structuredData
    let coordinateIndex = 0

    // Add attraction markers with real coordinates
    if (brief.attractions?.mustSee) {
      brief.attractions.mustSee.slice(0, 3).forEach((attraction, index) => {
        const coordinate = placeCoordinates[coordinateIndex]

        if (coordinate) {
          markerList.push({
            id: `attraction-${index}`,
            position: {
              lat: coordinate.lat,
              lng: coordinate.lng,
            },
            title: coordinate.name,
            category: 'Attraction',
            description: `Must-see attraction: ${coordinate.name}${coordinate.address ? ` • ${coordinate.address}` : ''}${coordinate.rating ? ` • ⭐ ${coordinate.rating}` : ''}`,
            icon: '📸',
          })
        } else {
          // Fallback to approximate position if no coordinates found
          markerList.push({
            id: `attraction-${index}`,
            position: {
              lat: center.lat + (Math.random() - 0.5) * 0.01,
              lng: center.lng + (Math.random() - 0.5) * 0.01,
            },
            title: attraction,
            category: 'Attraction',
            description: `Must-see attraction: ${attraction} (approximate location)`,
            icon: '📸',
          })
        }
        coordinateIndex++
      })
    }

    // Add restaurant markers with real coordinates
    if (brief.foodAndDrink?.restaurants) {
      brief.foodAndDrink.restaurants.slice(0, 3).forEach((restaurant, index) => {
        const coordinate = placeCoordinates[coordinateIndex]

        if (coordinate) {
          markerList.push({
            id: `restaurant-${index}`,
            position: {
              lat: coordinate.lat,
              lng: coordinate.lng,
            },
            title: coordinate.name,
            category: 'Restaurant',
            description: `Recommended restaurant: ${coordinate.name}${coordinate.address ? ` • ${coordinate.address}` : ''}${coordinate.rating ? ` • ⭐ ${coordinate.rating}` : ''}`,
            icon: '🍽️',
          })
        } else {
          // Fallback to approximate position if no coordinates found
          markerList.push({
            id: `restaurant-${index}`,
            position: {
              lat: center.lat + (Math.random() - 0.5) * 0.01,
              lng: center.lng + (Math.random() - 0.5) * 0.01,
            },
            title: restaurant,
            category: 'Restaurant',
            description: `Recommended restaurant: ${restaurant} (approximate location)`,
            icon: '🍽️',
          })
        }
        coordinateIndex++
      })
    }

    return markerList
  }, [data, center, placeCoordinates])

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: false,
      scrollwheel: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    }),
    []
  )

  if (loadError) {
    return (
      <div className="bg-swiss-red bg-opacity-5 border border-swiss-red border-opacity-30 text-swiss-red px-6 py-4 rounded-swiss-lg">
        <p className="font-medium">Unable to load map at this time. Please try again later.</p>
      </div>
    )
  }

  if (!isLoaded || isGeocodingLoading || isLoadingPlaces) {
    return (
      <div className="bg-swiss-gray-50 border border-swiss-gray-200 rounded-swiss-lg p-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-swiss-blue mr-3"></div>
        <span className="text-swiss-gray-600 font-medium">
          {!isLoaded
            ? 'Loading map...'
            : isGeocodingLoading
              ? `Finding ${data.destination}...`
              : 'Finding attraction locations...'}
        </span>
      </div>
    )
  }

  if (
    !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here'
  ) {
    return (
      <div className="bg-swiss-blue bg-opacity-5 border border-swiss-blue border-opacity-20 rounded-swiss-lg p-8 text-center">
        <div className="text-5xl mb-4">🗺️</div>
        <h3 className="text-h3 font-semibold text-swiss-black mb-3">Interactive Map</h3>
        <p className="text-swiss-gray-600 max-w-md mx-auto">
          The interactive map feature is currently unavailable. View your travel brief in Cheatsheet
          or Full Text mode for complete destination information.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-swiss-white border border-swiss-gray-200 rounded-swiss-lg shadow-swiss-md p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-h3 font-semibold text-swiss-black flex items-center">
          <span className="mr-2">🗺️</span>
          Interactive Map
        </h3>
        <div className="text-sm text-swiss-gray-600 font-medium">
          {markers.length} locations marked
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 mb-6 text-sm">
        <div className="flex items-center">
          <span className="mr-2">📸</span>
          <span className="text-swiss-gray-600 font-medium">Attractions</span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">🍽️</span>
          <span className="text-swiss-gray-600 font-medium">Restaurants</span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">🗺️</span>
          <span className="text-swiss-gray-600 font-medium">Day Trips</span>
        </div>
      </div>

      <div className="rounded-swiss-lg overflow-hidden border border-swiss-gray-300">
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
                anchor: new google.maps.Point(20, 20),
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

      <div className="mt-4 text-sm text-swiss-gray-500">📍 Map centered on {data.destination}</div>
    </div>
  )
}
