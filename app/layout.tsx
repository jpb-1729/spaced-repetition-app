import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Navbar from '@/components/Navbar'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Olivero Recall',
  description: 'Spaced repetition system.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistMono.className} flex min-h-screen flex-col antialiased`}>
        <Navbar />
        <main className="bg-background flex-1">{children}</main>
        <footer className="border-t border-gray-200 p-8">
          <p className="text-foreground text-sm">© 2025 Nunya Business</p>
        </footer>
      </body>
    </html>
  )
}
