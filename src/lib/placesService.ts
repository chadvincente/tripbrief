// Google Places API service for getting coordinates of attractions

interface PlaceResult {
  place_id: string
  name: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  formatted_address?: string
  rating?: number
  types: string[]
}

interface PlacesSearchResponse {
  results: PlaceResult[]
  status: string
}

export interface PlaceCoordinate {
  name: string
  lat: number
  lng: number
  address?: string
  rating?: number
}

// Cache for place coordinates (in-memory, could be enhanced with localStorage)
const placesCache = new Map<string, { coordinate: PlaceCoordinate; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

function getCachedPlace(searchQuery: string): PlaceCoordinate | null {
  const cached = placesCache.get(searchQuery.toLowerCase())

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.coordinate
  }

  // Remove expired cache entries
  if (cached) {
    placesCache.delete(searchQuery.toLowerCase())
  }

  return null
}

function setCachedPlace(searchQuery: string, coordinate: PlaceCoordinate): void {
  placesCache.set(searchQuery.toLowerCase(), {
    coordinate,
    timestamp: Date.now(),
  })
}

export async function findPlaceCoordinates(
  placeName: string,
  cityName: string
): Promise<PlaceCoordinate | null> {
  // Check cache first
  const searchQuery = `${placeName} ${cityName}`
  const cached = getCachedPlace(searchQuery)
  if (cached) {
    return cached
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    console.warn('Google Maps API key not configured for Places search')
    return null
  }

  try {
    // Use Text Search API to find the place
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`
    )

    if (!response.ok) {
      console.error(`Places API error: ${response.status}`)
      return null
    }

    const data: PlacesSearchResponse = await response.json()

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const place = data.results[0] // Take the first (most relevant) result

      const coordinate: PlaceCoordinate = {
        name: place.name,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        address: place.formatted_address,
        rating: place.rating,
      }

      // Cache the result
      setCachedPlace(searchQuery, coordinate)

      return coordinate
    }

    console.warn(`No places found for: ${searchQuery}`)
    return null
  } catch (error) {
    console.error('Error fetching place coordinates:', error)
    return null
  }
}

// Batch function to get coordinates for multiple places
export async function findMultiplePlaceCoordinates(
  places: string[],
  cityName: string
): Promise<(PlaceCoordinate | null)[]> {
  // Add small delays between requests to avoid rate limiting
  const results: (PlaceCoordinate | null)[] = []

  for (let i = 0; i < places.length; i++) {
    const coordinate = await findPlaceCoordinates(places[i], cityName)
    results.push(coordinate)

    // Add a small delay between requests (except for the last one)
    if (i < places.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  return results
}
