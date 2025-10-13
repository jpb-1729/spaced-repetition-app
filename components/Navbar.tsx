export default function Navbar() {
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Study', href: '/study' },
    { name: 'Stats', href: '/stats' },
    { name: 'Decks', href: '/decks' },
  ]

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="text-2xl font-bold text-blue-600">
            Logo
          </a>

          <div className="flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
