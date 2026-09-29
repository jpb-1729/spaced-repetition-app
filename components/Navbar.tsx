import Link from 'next/link'
import { signOut } from '@/auth'
import ThemeToggle from '@/components/ThemeToggle'
import { NavLinks } from '@/components/NavLinks'
import { Wordmark } from '@/components/Wordmark'

type Props = { user?: { name?: string | null; image?: string | null } }

export default function Navbar({ user }: Props) {
  const navigation = [
    { name: 'Study', href: '/study' },
    { name: 'Decks', href: '/decks' },
  ]
  const isLoggedIn = !!user

  return (
    <nav className="border-rule bg-paper/92 sticky top-0 z-40 border-b backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-[1280px] items-stretch gap-5 px-[clamp(16px,3.2vw,40px)]">
        <Link href="/" className="flex items-center">
          <Wordmark />
        </Link>
        {isLoggedIn && <NavLinks items={navigation} />}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {isLoggedIn && (
            <form
              action={async () => {
                'use server'
                await signOut()
              }}
            >
              <button
                type="submit"
                className="border-rule-2 bg-paper hover:bg-paper-2 hover:border-ink-soft text-ink-soft hover:text-ink h-9 cursor-pointer rounded border px-3 text-[13px] font-semibold transition-colors"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </div>
    </nav>
  )
}
