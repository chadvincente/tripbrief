import { NextRequest, NextResponse } from 'next/server'
import { getCityImage } from '@/lib/cityImages'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      )
    }

    const image = await getCityImage(city)
    
    return NextResponse.json(image)
  } catch (error) {
    console.error('Error fetching city image:', error)
    return NextResponse.json(
      { error: 'Failed to fetch city image' },
      { status: 500 }
    )
  }
}