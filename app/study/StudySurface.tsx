import type { Rating } from '@prisma/client'
import type { DeckInfo, QueueCard } from '@/lib/study'
import { cardStateLabel, formatInterval, previewIntervals } from '@/lib/fsrs'
import { cn } from '@/lib/cn'
import { Kbd, SectionHead } from './ui'

export const GRADES: { key: Rating; digit: string; label: string; gloss: string }[] = [
  { key: 'AGAIN', digit: '1', label: 'Again', gloss: 'Forgotten' },
  { key: 'HARD', digit: '2', label: 'Hard', gloss: 'Effortful' },
  { key: 'GOOD', digit: '3', label: 'Good', gloss: 'Recalled' },
  { key: 'EASY', digit: '4', label: 'Easy', gloss: 'Immediate' },
]

export interface SessionSummary {
  reviewed: number
  again: number
  accuracy: number
  elapsed: number
}

export function StudySurface({
  card,
  deck,
  revealed,
  onReveal,
  onGrade,
  position,
  total,
  complete,
  onRestart,
  onNextDeck,
  summary,
  now,
  failedCount,
  onRetryFailed,
}: {
  card: QueueCard | null
  deck: DeckInfo
  revealed: boolean
  onReveal: () => void
  onGrade: (g: Rating) => void
  position: number
  total: number
  complete: boolean
  onRestart: () => void
  onNextDeck: () => void
  summary: SessionSummary
  now: Date
  failedCount: number
  onRetryFailed: () => void
}) {
  const previews = card ? previewIntervals(card, now) : null

  return (
    <div className="flex h-full flex-col">
      <SectionHead
        n="03"
        title="Review"
        meta={
          <span className="flex items-center gap-3">
            <span>{deck.courseName}</span>
            <span className="text-vermillion">
              {String(Math.min(position + 1, total)).padStart(2, '0')} /{' '}
              {String(total).padStart(2, '0')}
            </span>
          </span>
        }
      />

      {complete || !card ? (
        <Complete summary={summary} onRestart={onRestart} onNextDeck={onNextDeck} deck={deck} />
      ) : (
        <article key={card.progressId} className="flex min-h-0 flex-1 flex-col">
          <div className="hide-scroll min-h-0 flex-1 overflow-y-auto">
            {/* Prompt */}
            <div className="anim-rise relative overflow-hidden pt-8 pb-7 sm:pt-12">
              <span
                aria-hidden
                className="text-ink/[0.055] pointer-events-none absolute -top-3 right-0 font-serif text-[110px] leading-none select-none sm:text-[150px]"
              >
                {String(position + 1).padStart(2, '0')}
              </span>
              <div className="relative">
                <div className="mb-5 flex items-center gap-2">
                  <span className="bg-vermillion h-[7px] w-[7px]" />
                  <span className="label text-ink-mute">
                    {cardStateLabel(card.state)}
                    {' · '}
                    {deck.name}
                  </span>
                </div>
                <h2 className="max-w-[22ch] font-serif text-[26px] leading-[1.06] font-light tracking-[-0.025em] text-balance sm:text-[36px] lg:text-[44px]">
                  {card.front}
                </h2>
                <p className="label text-ink-mute mt-6">
                  {deck.courseName} · {deck.name}
                </p>
              </div>
            </div>

            {/* Answer */}
            <div className="border-ink border-t">
              {revealed ? (
                <div className="anim-fade grid gap-6 py-7 lg:grid-cols-[1fr_auto] lg:gap-10">
                  <div className="relative pl-5">
                    <span
                      aria-hidden
                      className="anim-draw bg-vermillion absolute inset-y-0 -left-[2px] w-[2px]"
                    />
                    <p className="label text-vermillion mb-3">Answer</p>
                    <p className="text-ink max-w-[58ch] font-serif text-[18px] leading-[1.55] sm:text-[21px]">
                      {card.back}
                    </p>
                    {card.notes && (
                      <p className="text-ink-soft mt-4 max-w-[58ch] font-serif text-[15px] leading-[1.55]">
                        {card.notes}
                      </p>
                    )}
                  </div>
                  <dl className="border-ink/12 lg:border-ink/12 grid grid-cols-2 gap-x-8 gap-y-3 self-start border-t pt-4 lg:w-[186px] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
                    <Field k="Difficulty" v={card.difficulty.toFixed(2)} />
                    <Field
                      k="Interval"
                      v={card.scheduledDays > 0 ? formatInterval(card.scheduledDays) : '—'}
                    />
                    <Field k="Reviews" v={String(card.reps)} />
                    <Field k="Forgotten" v={String(card.lapses)} />
                  </dl>
                </div>
              ) : (
                <button
                  onClick={onReveal}
                  className="group hover:bg-paper-2 flex w-full items-center justify-between py-7 text-left transition-colors duration-200"
                >
                  <span className="label text-ink transition-transform duration-200 group-hover:translate-x-1">
                    Reveal answer
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="label text-ink-mute">press</span>
                    <Kbd>Space</Kbd>
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Grading */}
          <div className="shrink-0">
            <div
              className={cn(
                'border-ink grid grid-cols-2 border-t transition-opacity duration-300 sm:grid-cols-4',
                revealed ? 'opacity-100' : 'pointer-events-none opacity-0'
              )}
            >
              {GRADES.map((g, i) => (
                <button
                  key={g.key}
                  onClick={() => onGrade(g.key)}
                  disabled={!revealed}
                  className={cn(
                    'group border-ink/12 hover:bg-ink hover:text-paper flex flex-col justify-between gap-6 px-3.5 py-4 text-left transition-all duration-150 active:translate-y-px',
                    i > 0 && 'sm:border-l',
                    i === 1 && 'border-l',
                    i > 1 && 'border-t sm:border-t-0',
                    i === 3 && 'border-l'
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="label opacity-60">{g.digit}</span>
                    <span
                      className={cn(
                        'font-mono text-[11px] tabular-nums',
                        g.key === 'AGAIN'
                          ? 'text-vermillion group-hover:text-paper'
                          : 'text-ink-mute group-hover:text-paper/70'
                      )}
                    >
                      {previews?.[g.key]}
                    </span>
                  </div>
                  <div>
                    <div className="font-serif text-[21px] leading-none tracking-[-0.02em]">
                      {g.label}
                    </div>
                    <div className="label text-ink-mute group-hover:text-paper/60 mt-2">
                      {g.gloss}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-ink/12 flex items-center justify-between border-t py-2.5">
              <span className="label text-ink-mute">
                Queue remaining {String(Math.max(0, total - position)).padStart(2, '0')}
              </span>
              {failedCount > 0 && (
                <button
                  onClick={onRetryFailed}
                  className="label text-vermillion hover:text-ink cursor-pointer transition-colors"
                >
                  {failedCount} {failedCount === 1 ? 'review' : 'reviews'} not saved · Retry
                </button>
              )}
            </div>
          </div>
        </article>
      )}
    </div>
  )
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="label text-ink-mute">{k}</dt>
      <dd className="mt-1.5 font-mono text-[13px] tabular-nums">{v}</dd>
    </div>
  )
}

function Complete({
  summary,
  onRestart,
  onNextDeck,
  deck,
}: {
  summary: SessionSummary
  onRestart: () => void
  onNextDeck: () => void
  deck: DeckInfo
}) {
  return (
    <div className="flex flex-1 flex-col justify-center py-16">
      <span className="label text-vermillion mb-5">Session complete</span>
      <h2 className="max-w-[16ch] font-serif text-[38px] leading-[0.98] font-light tracking-[-0.03em] sm:text-[56px]">
        The session for {deck.name} is closed.
      </h2>
      <div className="border-ink mt-10 grid grid-cols-2 border-t sm:grid-cols-4">
        <Cell k="Reviewed" v={String(summary.reviewed).padStart(2, '0')} />
        <Cell k="Forgotten" v={String(summary.again).padStart(2, '0')} />
        <Cell k="Accuracy" v={`${Math.round(summary.accuracy * 100)}%`} accent />
        <Cell
          k="Seconds / card"
          v={summary.reviewed ? (summary.elapsed / summary.reviewed).toFixed(1) : '—'}
        />
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <button
          onClick={onRestart}
          className="label border-ink bg-ink text-paper hover:text-ink border px-6 py-3.5 transition-colors hover:bg-transparent"
        >
          Study again
        </button>
        <button
          onClick={onNextDeck}
          className="label border-ink hover:bg-ink hover:text-paper border px-6 py-3.5 transition-colors"
        >
          Advance to next collection →
        </button>
      </div>
    </div>
  )
}

function Cell({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="border-ink/12 border-b py-4 pr-4">
      <div className="label text-ink-mute">{k}</div>
      <div
        className={cn(
          'mt-2.5 font-serif text-[30px] leading-none tabular-nums',
          accent && 'text-vermillion'
        )}
      >
        {v}
      </div>
    </div>
  )
}
