import Link from 'next/link'
import Image from 'next/image'

type Props = { user?: { name?: string | null; image?: string | null } }

export default function Navbar({ user }: Props) {
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Study', href: '/view_decks' },
    { name: 'Stats', href: '/stats' },
    { name: 'Decks', href: '/decks' },
  ]
  const isLoggedIn = !!user

  return (
    <nav className="border-b-3 border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Image src="/logo.svg" alt="Spaced Repetition Logo" width={64} height={64} priority />
          {isLoggedIn && (
            <div className="flex items-center space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-foreground text-sm font-bold uppercase tracking-wider transition-colors hover:bg-primary hover:text-white px-3 py-1"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
