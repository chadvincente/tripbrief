import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    const { places, cityName } = await request.json()

    if (!places || !Array.isArray(places) || !cityName) {
      return NextResponse.json({ error: 'Places array and cityName are required' }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      console.warn('Google Maps API key not configured')
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 })
    }

    const coordinates: (PlaceCoordinate | null)[] = []

    // Process each place with a small delay to avoid rate limiting
    for (let i = 0; i < places.length; i++) {
      const placeName = places[i]
      const searchQuery = `${placeName} ${cityName}`

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`
        )

        if (response.ok) {
          const data: PlacesSearchResponse = await response.json()

          if (data.status === 'OK' && data.results && data.results.length > 0) {
            const place = data.results[0]

            coordinates.push({
              name: place.name,
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
              address: place.formatted_address,
              rating: place.rating,
            })
          } else {
            coordinates.push(null)
          }
        } else {
          coordinates.push(null)
        }
      } catch (placeError) {
        console.error(`Error fetching coordinates for ${placeName}:`, placeError)
        coordinates.push(null)
      }

      // Add small delay between requests (except for the last one)
      if (i < places.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    return NextResponse.json({ coordinates })
  } catch (error) {
    console.error('Error fetching place coordinates:', error)
    return NextResponse.json({ error: 'Failed to fetch place coordinates' }, { status: 500 })
  }
}
