import type { Metadata } from 'next'
import { Newsreader, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { auth } from '@/auth'
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  return (
    <html lang="en">
      <body
        className={`${newsreader.variable} ${interTight.variable} ${jetbrainsMono.variable} bg-paper text-ink grain flex min-h-screen flex-col font-sans antialiased`}
      >
        <Navbar user={session?.user} />
        <main className="flex-1">{children}</main>
        <footer className="border-t-3 border-border p-8">
          <p className="text-foreground text-sm font-bold uppercase tracking-wide">
            &copy; {new Date().getFullYear()} Nunya Business
          </p>
        </footer>
      </body>
    </html>
  )
}
