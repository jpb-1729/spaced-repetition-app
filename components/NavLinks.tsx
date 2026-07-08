'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navigation = [
  { name: 'Study', href: '/view_decks' },
  { name: 'Stats', href: '/stats' },
  { name: 'Decks', href: '/decks' },
]

export default function NavLinks() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop links */}
      <div className="hidden items-center gap-2 md:flex">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`border-3 px-3 py-1 text-sm font-bold tracking-wider uppercase transition-all ${
                isActive
                  ? 'brutal-shadow-sm border-border bg-accent text-accent-foreground'
                  : 'hover:border-border hover:bg-accent hover:text-accent-foreground border-transparent'
              }`}
            >
              {item.name}
            </Link>
          )
        })}
      </div>

      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="brutal-border brutal-shadow-sm bg-card text-foreground px-2 py-0.5 text-lg font-bold md:hidden"
      >
        ☰
      </button>

      {/* Mobile menu panel */}
      {open && (
        <div className="border-border bg-card absolute inset-x-0 top-full z-50 border-b-3 md:hidden">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border-border block border-t-3 px-6 py-4 text-lg font-bold tracking-wider uppercase ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
