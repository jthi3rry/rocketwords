import type { Metadata, Viewport } from 'next'
import { Balsamiq_Sans } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

const balsamiq = Balsamiq_Sans({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-balsamiq'
})

export const metadata: Metadata = {
  title: 'Rocket Words - Learn Words Through Play!',
  description: 'A kid-friendly educational web application for learning words through interactive games',
  manifest: './manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Rocket Words',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: './assets/icons/favicon-32x32.png',
    apple: './assets/icons/apple-touch-icon.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Rocket Words',
    'application-name': 'Rocket Words',
    'msapplication-TileColor': '#1d2b53',
    'msapplication-config': 'none',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#1d2b53',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={balsamiq.className}>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  )
}

