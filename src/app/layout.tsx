import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TripBrief - AI Travel Planning & City Guides | Instant Travel Briefs',
  description: 'Generate comprehensive travel guides for any destination in seconds. Get instant information on transportation, attractions, food, culture, and local tips. AI-powered travel planning made simple.',
  keywords: ['travel planning', 'city guide', 'travel tips', 'destination guide', 'travel information', 'AI travel', 'travel brief', 'travel companion'],
  authors: [{ name: 'TripBrief' }],
  creator: 'TripBrief',
  publisher: 'TripBrief',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tripbrief.io',
    siteName: 'TripBrief',
    title: 'TripBrief - AI Travel Planning & City Guides',
    description: 'Generate comprehensive travel guides for any destination in seconds. Get instant information on transportation, attractions, food, culture, and local tips.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TripBrief - AI Travel Planning & City Guides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TripBrief - AI Travel Planning & City Guides',
    description: 'Generate comprehensive travel guides for any destination in seconds. Transportation, attractions, food, culture, and local tips.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://tripbrief.io',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {process.env.NODE_ENV === 'production' && (
          <Script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id="6fecb0c3-1f79-4b71-be4d-bc67a36c36a5"
            strategy="afterInteractive"
          />
        )}
        {children}
        <Analytics />
        <SpeedInsights />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "TripBrief",
              "description": "AI-powered travel planning tool that generates comprehensive travel guides for any destination in seconds.",
              "url": "https://tripbrief.io",
              "applicationCategory": "TravelApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "TripBrief"
              },
              "keywords": "travel planning, city guide, travel tips, AI travel, destination guide"
            })
          }}
        />
      </body>
    </html>
  )
}