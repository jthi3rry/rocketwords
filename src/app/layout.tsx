import type { Metadata } from 'next'
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
  themeColor: '#1d2b53',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
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

