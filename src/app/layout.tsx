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
      <body className="pt-[64px]">
        <Header />
        {children}
      </body>
    </html>
  )
}
