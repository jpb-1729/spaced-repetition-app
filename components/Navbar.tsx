import Link from 'next/link'
import { signOut } from '@/auth'

type Props = { user?: { name?: string | null; image?: string | null } }

export default function Navbar({ user }: Props) {
  const navigation = [
    { name: 'Study', href: '/study' },
    { name: 'Decks', href: '/decks' },
  ]
  const isLoggedIn = !!user

  return (
    <nav className="border-b border-ink">
      <div className="mx-auto flex h-14 max-w-[1680px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="font-serif text-[22px] leading-none tracking-tight">
          Noema<span className="text-vermillion">.</span>
        </Link>
        {isLoggedIn && (
          <div className="flex items-center gap-7">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="label text-ink transition-colors hover:text-vermillion"
              >
                {item.name}
              </Link>
            ))}
            <form
              action={async () => {
                'use server'
                await signOut()
              }}
            >
              <button
                type="submit"
                className="label cursor-pointer text-ink-mute transition-colors hover:text-vermillion"
              >
                Sign Out
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  )
}
