import Header from '../components/header/Header'
import '../styles/globals.scss'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
}

export const metadata: Metadata = {
  title: '비공식 어쿠스틱 드링크',
  description: '아쿠스틱 드링크의 다양한 레시피를 간편하게 확인해보세요!',
  metadataBase: new URL('https://acoustic-drink.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://acoustic-drink.vercel.app',
    siteName: '비공식 어쿠스틱 드링크',
    title: '비공식 어쿠스틱 드링크',
    description: '아쿠스틱 드링크의 다양한 레시피를 간편하게 확인해보세요!',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: '비공식 어쿠스틱 드링크',
      },
    ],
  },
  other: {
    'og:image': '/images/og-image.png',
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': '비공식 어쿠스틱 드링크',
    'twitter:image': '/images/og-image.png',
    'twitter:image:alt': '비공식 어쿠스틱 드링크',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={inter.className}>
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className="pt-[64px]">
        <Header />
        {children}
      </body>
    </html>
  )
}
