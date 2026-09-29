'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

/* Split out of Navbar, which is a server component, because marking the
   current page needs the pathname. */
export function NavLinks({ items }: { items: { name: string; href: string }[] }) {
  const pathname = usePathname()

  return (
    <div className="flex self-stretch">
      {items.map((item) => {
        const current = pathname === item.href || pathname?.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.name}
            href={item.href}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'relative flex items-center px-3 text-[15px] font-semibold transition-colors',
              current ? 'text-ink' : 'text-ink-soft hover:text-ink'
            )}
          >
            {item.name}
            {current && <span className="bg-accent absolute inset-x-3 -bottom-px h-[3px]" />}
          </Link>
        )
      })}
    </div>
  )
}
