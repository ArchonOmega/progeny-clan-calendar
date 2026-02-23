import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Progeny Vampire Clan — Calendar',
  description: 'Clan event calendar for Progeny in Second Life',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="relative z-10 antialiased">{children}</body>
    </html>
  )
}
