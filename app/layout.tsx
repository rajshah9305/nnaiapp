import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Initialize Inter font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RAJ AI Code Generator - Transform Ideas into Production Apps',
  description: 'Generate complete full-stack applications from natural language descriptions. AI-powered code generation with React, Express, and MySQL.',
  keywords: ['AI', 'code generation', 'app generator', 'React', 'Next.js', 'full-stack', 'Express', 'MySQL'],
  authors: [{ name: 'RAJ AI' }],
  creator: 'RAJ AI',
  openGraph: {
    title: 'RAJ AI Code Generator',
    description: 'Transform natural language into production-ready applications',
    type: 'website',
  },
  robots: { 
    index: true, 
    follow: true 
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.className}`}>
      <body className="antialiased bg-white min-h-screen">
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
