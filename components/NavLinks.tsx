'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'

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
                  ? 'shadow-[2px_2px_0px_hsl(var(--shadow-color))] border-foreground bg-accent text-accent-foreground'
                  : 'hover:border-foreground hover:bg-accent hover:text-accent-foreground border-transparent'
              }`}
            >
              {item.name}
            </Link>
          )
        })}
      </div>

      {/* Mobile menu trigger + drawer */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Toggle menu"
        className="md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <SheetClose key={item.name} asChild>
                  <Link
                    href={item.href}
                    className={`border-3 border-foreground px-4 py-3 text-lg font-bold tracking-wider uppercase ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                </SheetClose>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
