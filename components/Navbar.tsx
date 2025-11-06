import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Study', href: '/study' },
    { name: 'Stats', href: '/stats' },
    { name: 'Decks', href: '/decks' },
  ]

  return (
    <nav className="bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Image src="/logo.svg" alt="Spaced Repetition Logo" width={64} height={64} priority />

          <div className="flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
