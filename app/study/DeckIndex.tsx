import Link from 'next/link'
import type { DeckInfo, SuspendedRow } from '@/lib/study'
import { Inline } from '@/components/Inline'
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
  suspended,
  onRestore,
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
  /** Suspended cards in the active deck, newest first. */
  suspended: SuspendedRow[]
  onRestore: (progressId: string) => void
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
                    'group border-rule relative w-full border-b py-3.5 pr-1 pl-3 text-left transition-colors duration-150',
                    isActive ? 'bg-paper-2' : 'hover:bg-paper-2'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0 bottom-0 left-0 w-[3px] transition-colors',
                      isActive ? 'bg-accent' : 'bg-transparent'
                    )}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-ink-mute font-mono text-[11px] tabular-nums">
                          {d.index}
                        </span>
                        <h3 className="text-[16px] leading-tight font-bold tracking-[-0.01em]">
                          {d.name}
                        </h3>
                      </div>
                      <p className="text-ink-mute mt-1 pl-[22px] text-[12.5px]">{d.courseName}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div
                        className={cn(
                          'text-[18px] leading-none font-bold tabular-nums',
                          s.due > 0 ? 'text-accent' : 'text-rule-2'
                        )}
                      >
                        {s.due}
                      </div>
                      <div className="text-ink-mute mt-1 text-[11.5px]">due</div>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2 pl-[22px]">
                    <div className="bg-paper-3 h-1 flex-1 overflow-hidden rounded-sm">
                      <div
                        className={cn('h-full rounded-sm', isActive ? 'bg-accent' : 'bg-ink-soft')}
                        style={{ width: `${s.maturity * 100}%` }}
                      />
                    </div>
                    <span className="text-ink-soft text-[12px] whitespace-nowrap tabular-nums">
                      {Math.round(s.maturity * 100)}% · {s.total} cards
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {suspended.length > 0 && (
        <section aria-labelledby="suspended-heading">
          <div className="border-rule flex items-baseline justify-between border-b pb-2">
            <h3 id="suspended-heading" className="text-[13px] font-semibold">
              Suspended
            </h3>
            <span className="text-ink-mute text-[12.5px] tabular-nums">
              {suspended.length} {suspended.length === 1 ? 'card' : 'cards'}
            </span>
          </div>
          <ul>
            {suspended.map((r) => (
              <li
                key={r.progressId}
                className="border-rule flex items-start justify-between gap-3 border-b py-2.5"
              >
                <span className="text-ink-soft min-w-0 flex-1 truncate font-serif text-[14px] leading-snug">
                  <Inline text={r.front} />
                </span>
                <button
                  onClick={() => onRestore(r.progressId)}
                  className="text-ink decoration-rule-2 hover:text-accent hover:decoration-accent shrink-0 cursor-pointer text-[12.5px] font-semibold underline underline-offset-[3px] transition-colors"
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <SectionHead n="02" title="Settings" />
        <div className="pt-3">
          <div className="mb-4">
            <p className="text-ink mb-2 text-[13px] font-semibold">Queue order</p>
            <div className="border-rule-2 grid grid-cols-2 overflow-hidden rounded border">
              {(['sequential', 'shuffled'] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => onOrder(o)}
                  className={cn(
                    'h-8 text-[13px] font-semibold capitalize transition-colors duration-150',
                    order === o ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-2 bg-paper',
                    o === 'shuffled' && 'border-rule-2 border-l'
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-ink mb-2 text-[13px] font-semibold">Session limit</p>
            <div className="border-rule-2 flex items-stretch overflow-hidden rounded border">
              <button
                onClick={() => onLimit(Math.max(4, limit - 4))}
                className="border-rule-2 text-ink-soft hover:bg-paper-2 hover:text-ink w-10 border-r text-[16px] font-semibold transition-colors"
                aria-label="decrease"
              >
                −
              </button>
              <div className="flex h-9 flex-1 items-center justify-center gap-1.5">
                <span className="text-[15px] font-bold tabular-nums">{limit}</span>
                <span className="text-ink-mute text-[13px]">cards</span>
              </div>
              <button
                onClick={() => onLimit(Math.min(40, limit + 4))}
                className="border-rule-2 text-ink-soft hover:bg-paper-2 hover:text-ink w-10 border-l text-[16px] font-semibold transition-colors"
                aria-label="increase"
              >
                +
              </button>
            </div>
          </div>

          <div className="border-rule mt-5 border-t pt-4">
            <Link
              href="/decks"
              className="text-ink decoration-rule-2 hover:text-accent hover:decoration-accent block text-[14px] font-semibold underline underline-offset-[3px] transition-colors"
            >
              Browse decks →
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-ink decoration-rule-2 hover:text-accent hover:decoration-accent mt-2.5 block text-[14px] font-semibold underline underline-offset-[3px] transition-colors"
              >
                Admin
              </Link>
            )}
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-ink-soft decoration-rule-2 hover:text-accent hover:decoration-accent mt-2.5 block cursor-pointer text-[14px] font-semibold underline underline-offset-[3px] transition-colors"
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
