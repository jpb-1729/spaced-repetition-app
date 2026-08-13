import { Kbd } from './ui'

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
    <header className="border-ink border-b">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pt-5 pb-3">
        <div className="flex items-end gap-4">
          <h1 className="font-serif text-[28px] leading-[0.82] font-normal tracking-[-0.035em] sm:text-[38px]">
            Olivero Recall<span className="text-vermillion">.</span>
          </h1>
          <p className="label text-ink-mute mb-1 hidden max-w-[13rem] leading-[1.5] sm:block">
            Spaced repetition
            <br />
            study instrument
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-x-7 gap-y-3">
          <Meta k="Due today" v={String(dueToday).padStart(3, '0')} accent />
          <Meta k="Cards" v={String(corpusSize)} />
          <Meta k="Session" v={clock} />
          <Meta k="Date" v={date} suppressHydrationWarning />
          <div className="hidden items-center gap-1.5 pb-0.5 lg:flex">
            <Kbd>Space</Kbd>
            <span className="label text-ink-mute">reveal</span>
            <Kbd>1—4</Kbd>
            <span className="label text-ink-mute">grade</span>
          </div>
        </div>
      </div>

      <div className="bg-ink/10 relative h-[3px] w-full">
        <div
          className="bg-vermillion absolute inset-y-0 left-0 transition-[width] duration-500 ease-out"
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>
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
      <span className="label text-ink-mute">{k}</span>
      <span
        suppressHydrationWarning={suppressHydrationWarning}
        className={`font-mono text-[13px] leading-none tabular-nums ${
          accent ? 'text-vermillion' : 'text-ink'
        }`}
      >
        {v}
      </span>
    </div>
  )
}
