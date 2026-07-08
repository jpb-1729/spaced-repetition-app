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
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="border-border border-t-3">
          <div className="bg-stripes border-border h-5 border-b-3" />
          <div className="bg-ink text-ink-foreground">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
              <div>
                <p className="text-2xl font-bold tracking-tight uppercase">
                  Olivero <span className="text-accent">Recall</span>
                </p>
                <p className="mt-1 text-sm font-bold tracking-wide uppercase opacity-70">
                  Learn smarter, not harder.
                </p>
              </div>
              <p className="font-mono text-xs font-bold tracking-wider uppercase opacity-70">
                &copy; {new Date().getFullYear()} Nunya Business
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
