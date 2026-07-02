import './globals.css'
import AppFrame from '@/components/layout/AppFrame'
import LoginStatePersistence from '@/components/features/auth/LoginStatePersistence'
import { AuthProvider } from '@/lib/auth/auth-context'
import SessionProvider from '@/lib/providers/SessionProvider'
import GlobalErrorHandler from '@/components/GlobalErrorHandler'
import type { Metadata } from 'next'

// Comprehensive metadata for better SEO and user experience
export const metadata: Metadata = {
  title: {
    template: '%s | NayiBareilly - Smart Civic Platform',
    default: 'NayiBareilly - Smart Civic Platform for Better Bareilly'
  },
  description: 'नयी बरेली - A modern digital platform for civic engagement in Bareilly. Report issues, track progress, and connect with municipal services. Building a smarter, more responsive city together.',
  keywords: ['Bareilly', 'civic engagement', 'municipal services', 'issue reporting', 'city management', 'smart city', 'government services', 'नयी बरेली'],
  authors: [{ name: 'Bareilly Municipal Corporation' }],
  creator: 'NayiBareilly Team',
  publisher: 'Bareilly Municipal Corporation',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  metadataBase: new URL('https://nayibareilly.gov.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NayiBareilly - Smart Civic Platform for Better Bareilly',
    description: 'A modern digital platform for civic engagement in Bareilly. Report issues, track progress, and connect with municipal services.',
    url: 'https://nayibareilly.gov.in',
    siteName: 'NayiBareilly',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/icon.png',
        width: 1200,
        height: 630,
        alt: 'NayiBareilly - Smart Civic Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NayiBareilly - Smart Civic Platform',
    description: 'Building a smarter, more responsive Bareilly together.',
    images: ['/icon.png'],
  },
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-transparent" suppressHydrationWarning>
        {/* Skip link for keyboard users to jump directly to main content */}
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <GlobalErrorHandler />
        <AuthProvider>
          <SessionProvider>
            <LoginStatePersistence>
              <AppFrame>{children}</AppFrame>
            </LoginStatePersistence>
          </SessionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}