import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TripBrief - Your Ultimate Travel Planning Companion',
  description: 'Get comprehensive travel information for any destination in seconds. Public transit, attractions, local culture, and more.',
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
      </body>
    </html>
  )
}