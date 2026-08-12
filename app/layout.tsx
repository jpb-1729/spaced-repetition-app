import type { Metadata } from 'next'
import { Newsreader, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
})

const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
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
      <body
        className={`${newsreader.variable} ${interTight.variable} ${jetbrainsMono.variable} bg-paper text-ink grain flex min-h-screen flex-col font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
