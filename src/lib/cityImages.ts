// City image service with Pexels API integration and fallback system

interface PexelsImage {
  id: number
  width: number
  height: number
  photographer: string
  photographer_url: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    tiny: string
  }
}

interface PexelsResponse {
  photos: PexelsImage[]
  total_results: number
}

export interface CityImage {
  url: string
  photographer?: string
  photographer_url?: string
  source: 'pexels' | 'fallback'
}

// Cache for city images (in-memory, could be enhanced with localStorage)
const imageCache = new Map<string, { image: CityImage; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Popular city fallback images (you could store these in your public folder)
const FALLBACK_IMAGES: Record<string, string> = {
  'tokyo': '/images/cities/tokyo-fallback.jpg',
  'paris': '/images/cities/paris-fallback.jpg',
  'london': '/images/cities/london-fallback.jpg',
  'new york': '/images/cities/newyork-fallback.jpg',
  'rome': '/images/cities/rome-fallback.jpg',
  'barcelona': '/images/cities/barcelona-fallback.jpg',
  // Add more as needed
}

const DEFAULT_FALLBACK = '/images/cities/default-cityscape.svg'

async function searchPexelsAPI(cityName: string): Promise<CityImage | null> {
  const apiKey = process.env.PEXELS_API_KEY
  
  if (!apiKey || apiKey === 'your_pexels_api_key_here') {
    console.warn('Pexels API key not configured')
    return null
  }

  try {
    // Try different search terms for better results
    const searchTerms = [
      `${cityName} city skyline`,
      `${cityName} landmark`,
      `${cityName} architecture`,
      `${cityName} cityscape`
    ]

    for (const searchTerm of searchTerms) {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=5&orientation=landscape`,
        {
          headers: {
            'Authorization': apiKey
          }
        }
      )

      if (!response.ok) {
        console.error(`Pexels API error: ${response.status}`)
        continue
      }

      const data: PexelsResponse = await response.json()
      
      if (data.photos && data.photos.length > 0) {
        const photo = data.photos[0] // Take the first result
        return {
          url: photo.src.large, // Use large size for better quality
          photographer: photo.photographer,
          photographer_url: photo.photographer_url,
          source: 'pexels'
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching from Pexels API:', error)
    return null
  }
}

function getFallbackImage(cityName: string): CityImage {
  const normalizedCity = cityName.toLowerCase().trim()
  
  // Check if we have a specific fallback for this city
  const fallbackUrl = FALLBACK_IMAGES[normalizedCity] || DEFAULT_FALLBACK
  
  return {
    url: fallbackUrl,
    source: 'fallback'
  }
}

function getCachedImage(cityName: string): CityImage | null {
  const cached = imageCache.get(cityName.toLowerCase())
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.image
  }
  
  // Remove expired cache entries
  if (cached) {
    imageCache.delete(cityName.toLowerCase())
  }
  
  return null
}

function setCachedImage(cityName: string, image: CityImage): void {
  imageCache.set(cityName.toLowerCase(), {
    image,
    timestamp: Date.now()
  })
}

// Client-side function to fetch city image from our API
export async function getCityImageClient(cityName: string): Promise<CityImage> {
  try {
    const response = await fetch(`/api/city-image?city=${encodeURIComponent(cityName)}`)
    if (!response.ok) {
      throw new Error('Failed to fetch city image')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching city image:', error)
    return getFallbackImage(cityName)
  }
}

// Server-side function (used in API route)
export async function getCityImage(cityName: string): Promise<CityImage> {
  // Clean up city name (remove country, common suffixes)
  const cleanCityName = cityName
    .replace(/,.*$/, '') // Remove country part (e.g., "Tokyo, Japan" -> "Tokyo")
    .replace(/\s+(city|municipality|prefecture)$/i, '') // Remove common suffixes
    .trim()

  // Check cache first
  const cached = getCachedImage(cleanCityName)
  if (cached) {
    return cached
  }

  // Try Pexels API
  const pexelsImage = await searchPexelsAPI(cleanCityName)
  if (pexelsImage) {
    setCachedImage(cleanCityName, pexelsImage)
    return pexelsImage
  }

  // Fallback to local images
  const fallbackImage = getFallbackImage(cleanCityName)
  setCachedImage(cleanCityName, fallbackImage)
  return fallbackImage
}

export function getImageAttribution(image: CityImage): string | null {
  if (image.source === 'pexels' && image.photographer) {
    return `Photo by ${image.photographer} on Pexels`
  }
  return null
}