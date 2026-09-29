import { Kbd } from './ui'
import ThemeToggle from '@/components/ThemeToggle'
import { Wordmark } from '@/components/Wordmark'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function Masthead({
  dueToday,
  corpusSize,
  elapsed,
  progress,
  now,
}: {
  dueToday: number
  corpusSize: number
  elapsed: number
  progress: number
  now: Date
}) {
  const date = now
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()
  const clock = `${pad(Math.floor(elapsed / 60))}:${pad(elapsed % 60)}`

  return (
    <header className="border-rule relative border-b">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-3 lg:h-16 lg:py-0">
        <div className="flex items-center gap-4">
          <h1>
            <Wordmark />
          </h1>
          <p className="border-rule text-ink-mute hidden h-[22px] items-center border-l pl-4 font-mono text-[11px] font-medium sm:flex">
            Study instrument
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Meta k="Due today" v={String(dueToday).padStart(3, '0')} accent />
          <Meta k="Cards" v={String(corpusSize)} />
          <Meta k="Session" v={clock} />
          <Meta k="Date" v={date} suppressHydrationWarning />
          <div className="text-ink-mute hidden items-center gap-1.5 text-[13px] lg:flex">
            <Kbd>Space</Kbd>
            <span>reveal</span>
            <Kbd>1–4</Kbd>
            <span>grade</span>
          </div>
          {/* /study sits outside the (site) group, so it never renders Navbar
              and needs its own theme control. */}
          <ThemeToggle />
        </div>
      </div>

      <div
        className="bg-accent absolute -bottom-px left-0 h-0.5 transition-[width] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]"
        style={{ width: `${Math.min(100, progress * 100)}%` }}
      />
    </header>
  )
}

function Meta({
  k,
  v,
  accent,
  suppressHydrationWarning,
}: {
  k: string
  v: string
  accent?: boolean
  suppressHydrationWarning?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-ink-mute text-[11px] leading-none font-bold tracking-[0.09em] uppercase">
        {k}
      </span>
      <span
        suppressHydrationWarning={suppressHydrationWarning}
        className={`text-[15px] leading-none font-bold tabular-nums ${
          accent ? 'text-accent' : 'text-ink'
        }`}
      >
        {v}
      </span>
    </div>
  )
}
