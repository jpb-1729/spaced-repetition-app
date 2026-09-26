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
      <footer className="border-rule mt-16 border-t">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-[clamp(16px,3.2vw,40px)] py-6">
          <span className="text-[15px] font-extrabold tracking-[-0.02em]">Olivero Recall</span>
          <span className="text-ink-mute text-[13px]">
            {`© ${new Date().getFullYear()} Nunya Business · Set in Schibsted Grotesk & Source Serif`}
          </span>
        </div>
      </footer>
    </>
  )
}
