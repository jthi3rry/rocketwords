import type { Metadata } from 'next'
import { Balsamiq_Sans } from 'next/font/google'
import './globals.css'

const balsamiq = Balsamiq_Sans({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-balsamiq'
})

export const metadata: Metadata = {
  title: 'Rocket Words - Learn Words Through Play!',
  description: 'A kid-friendly educational web application for learning words through interactive games',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/assets/icons/favicon-32x32.png',
    apple: '/assets/icons/apple-touch-icon.png',
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
        {children}
      </body>
    </html>
  )
}

