import Link from 'next/link'
import Image from 'next/image'
import { signOut } from '@/auth'
import NavLinks from '@/components/NavLinks'

type Props = { user?: { name?: string | null; image?: string | null } }

export default function Navbar({ user }: Props) {
  const isLoggedIn = !!user

  return (
    <nav className="border-b-3 border-border bg-card sticky top-0 z-50">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <Image src="/logo.svg" alt="Spaced Repetition Logo" width={40} height={40} priority />
            <span className="text-foreground hidden text-lg font-bold tracking-tight uppercase sm:inline">
              Olivero <span className="text-primary">Recall</span>
            </span>
          </Link>
          {isLoggedIn && (
            <div className="flex items-center gap-3 md:gap-4">
              <NavLinks />
              <form
                action={async () => {
                  'use server'
                  await signOut()
                }}
              >
                <button
                  type="submit"
                  className="brutal-btn brutal-btn-hover bg-danger text-danger-foreground px-3 py-1.5 text-sm"
                >
                  Sign Out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
