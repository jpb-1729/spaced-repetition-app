import Navbar from '@/components/Navbar'
import { auth } from '@/auth'

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  return (
    <>
      <Navbar user={session?.user} />
      <main className="flex-1">{children}</main>
      <footer className="border-ink border-t px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-3">
          <span className="label text-ink-mute">
            &copy; {new Date().getFullYear()} Nunya Business
          </span>
          <span className="label text-ink-mute">Set in Newsreader &amp; Inter Tight</span>
        </div>
      </footer>
    </>
  )
}
