import type { Metadata } from 'next'
import { Space_Grotesk, Space_Mono } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { auth } from '@/auth'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
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
        className={`${spaceGrotesk.variable} ${spaceMono.variable} bg-background text-foreground flex min-h-screen flex-col font-sans`}
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
