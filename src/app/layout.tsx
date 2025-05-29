import Header from '../components/header/Header'
import '../styles/globals.scss'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acoustic Drink',
  description: 'Acoustic Drink Page',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <link
          href="https://unpkg.com/tossface@latest/dist/tossface.css"
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
