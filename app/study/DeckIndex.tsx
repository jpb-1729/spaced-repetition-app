import Link from 'next/link'
import type { DeckInfo } from '@/lib/study'
import { cn } from '@/lib/cn'
import { SectionHead } from './ui'

export interface DeckStat {
  due: number
  total: number
  neu: number
  maturity: number
}

export function DeckIndex({
  decks,
  stats,
  active,
  onSelect,
  order,
  onOrder,
  limit,
  onLimit,
  isAdmin,
  signOutAction,
}: {
  decks: DeckInfo[]
  stats: Record<string, DeckStat>
  active: string
  onSelect: (id: string) => void
  order: 'sequential' | 'shuffled'
  onOrder: (o: 'sequential' | 'shuffled') => void
  limit: number
  onLimit: (n: number) => void
  isAdmin: boolean
  signOutAction: () => Promise<void>
}) {
  return (
    <div className="flex h-full flex-col gap-8">
      <section>
        <SectionHead n="01" title="Index" meta={`${decks.length} collections`} />
        <ul>
          {decks.map((d) => {
            const s = stats[d.id] ?? { due: 0, total: 0, neu: 0, maturity: 0 }
            const isActive = d.id === active
            return (
              <li key={d.id}>
                <button
                  onClick={() => onSelect(d.id)}
                  className={cn(
                    'group border-ink/12 relative w-full border-b py-3 pr-1 pl-3 text-left transition-colors duration-200',
                    isActive ? 'bg-paper-2' : 'hover:bg-paper-2/60'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0 bottom-0 left-0 w-[3px] transition-colors',
                      isActive ? 'bg-vermillion' : 'bg-transparent'
                    )}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="label text-ink-mute">{d.index}</span>
                        <h3 className="font-serif text-[19px] leading-tight tracking-[-0.015em]">
                          {d.name}
                        </h3>
                      </div>
                      <p className="label text-ink-mute mt-1.5 pl-[22px]">{d.courseName}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div
                        className={cn(
                          'font-mono text-[17px] leading-none tabular-nums',
                          s.due > 0 ? 'text-vermillion' : 'text-ink-mute'
                        )}
                      >
                        {String(s.due).padStart(2, '0')}
                      </div>
                      <div className="label text-ink-mute mt-1.5">due</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 pl-[22px]">
                    <div className="bg-ink/12 h-[2px] flex-1">
                      <div
                        className={cn('h-full', isActive ? 'bg-vermillion' : 'bg-ink/60')}
                        style={{ width: `${s.maturity * 100}%` }}
                      />
                    </div>
                    <span className="label text-ink-mute">
                      {Math.round(s.maturity * 100)}% learned · {s.total} cards
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <SectionHead n="02" title="Settings" />
        <div className="pt-3">
          <div className="mb-4">
            <p className="label text-ink-mute mb-2">Queue order</p>
            <div className="border-ink grid grid-cols-2 border">
              {(['sequential', 'shuffled'] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => onOrder(o)}
                  className={cn(
                    'label py-2.5 transition-colors duration-150',
                    order === o ? 'bg-ink text-paper' : 'text-ink hover:bg-paper-2 bg-transparent',
                    o === 'shuffled' && 'border-ink border-l'
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label text-ink-mute mb-2">Session limit</p>
            <div className="border-ink flex items-stretch border">
              <button
                onClick={() => onLimit(Math.max(4, limit - 4))}
                className="border-ink hover:bg-ink hover:text-paper w-11 border-r font-mono text-[15px] transition-colors"
                aria-label="decrease"
              >
                −
              </button>
              <div className="flex flex-1 items-baseline justify-center gap-1.5 py-2.5">
                <span className="font-mono text-[15px] tabular-nums">{limit}</span>
                <span className="label text-ink-mute">cards</span>
              </div>
              <button
                onClick={() => onLimit(Math.min(40, limit + 4))}
                className="border-ink hover:bg-ink hover:text-paper w-11 border-l font-mono text-[15px] transition-colors"
                aria-label="increase"
              >
                +
              </button>
            </div>
          </div>

          <div className="border-ink/12 mt-5 border-t pt-4">
            <Link
              href="/decks"
              className="label text-ink-mute decoration-ink/30 hover:text-ink block underline underline-offset-4 transition-colors"
            >
              Browse decks →
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="label text-ink-mute decoration-ink/30 hover:text-ink mt-3 block underline underline-offset-4 transition-colors"
              >
                Admin
              </Link>
            )}
            <form action={signOutAction}>
              <button
                type="submit"
                className="label text-ink-mute decoration-ink/30 hover:text-vermillion mt-3 block cursor-pointer underline underline-offset-4 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
