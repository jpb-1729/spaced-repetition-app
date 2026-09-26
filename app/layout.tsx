import type { Metadata } from 'next'
import { Schibsted_Grotesk, Source_Serif_4, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const schibsted = Schibsted_Grotesk({
  variable: '--font-schibsted',
  subsets: ['latin'],
})

const sourceSerif = Source_Serif_4({
  variable: '--font-source-serif',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
})

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the stored theme before first paint. Without this the page
            renders in the system theme and then snaps, flashing on every load. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${schibsted.variable} ${sourceSerif.variable} ${plexMono.variable} bg-paper text-ink flex min-h-screen flex-col font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
