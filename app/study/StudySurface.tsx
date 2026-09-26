import type { Rating } from '@prisma/client'
import type { DeckInfo, QueueCard } from '@/lib/study'
import { cardStateLabel, formatInterval, previewIntervals } from '@/lib/fsrs'
import { cn } from '@/lib/cn'
import { SectionHead } from './ui'

export const GRADES: { key: Rating; digit: string; label: string; gloss: string }[] = [
  { key: 'AGAIN', digit: '1', label: 'Again', gloss: 'Forgotten' },
  { key: 'HARD', digit: '2', label: 'Hard', gloss: 'Effortful' },
  { key: 'GOOD', digit: '3', label: 'Good', gloss: 'Recalled' },
  { key: 'EASY', digit: '4', label: 'Easy', gloss: 'Immediate' },
]

/* Static class strings per grade, so Tailwind can see every one of them. */
const GRADE_TONE: Record<Rating, { fill: string; border: string }> = {
  AGAIN: { fill: 'bg-grade-again', border: 'hover:border-grade-again' },
  HARD: { fill: 'bg-grade-hard', border: 'hover:border-grade-hard' },
  GOOD: { fill: 'bg-grade-good', border: 'hover:border-grade-good' },
  EASY: { fill: 'bg-grade-easy', border: 'hover:border-grade-easy' },
}

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
            <span className="text-ink font-bold tabular-nums">
              {Math.min(position + 1, total)}
              <span className="text-rule-2 font-normal"> / </span>
              {total}
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
            <div className="anim-rise relative max-w-[720px] overflow-hidden pt-8 pb-2 sm:pt-10">
              <span
                aria-hidden
                className="text-paper-2 pointer-events-none absolute -top-2 right-0 text-[110px] leading-none font-extrabold tracking-[-0.05em] select-none sm:text-[150px]"
              >
                {String(position + 1).padStart(2, '0')}
              </span>
              <div className="relative">
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
                  <span className="label text-accent">{cardStateLabel(card.state)}</span>
                  <span className="bg-rule-2 h-3 w-px" aria-hidden />
                  <span className="text-ink-mute text-[13px]">{deck.name}</span>
                </div>
                <h2 className="mt-[18px] font-serif text-[clamp(26px,3.4vw,40px)] leading-[1.18] font-semibold tracking-[-0.015em] text-balance [font-variation-settings:'opsz'_60]">
                  {card.front}
                </h2>
                <p className="text-ink-soft mt-[18px] text-[13.5px]">
                  <b className="text-ink font-bold">{deck.courseName}</b> · {deck.name}
                </p>
              </div>
            </div>

            {/* Answer */}
            <div className="max-w-[720px] pb-6">
              {revealed ? (
                <div className="anim-fade mt-9">
                  <h3 className="border-ink flex justify-between gap-3 border-b-2 pb-3 text-[13px] leading-none font-extrabold tracking-[0.1em] uppercase">
                    Answer
                    <span className="text-ink-mute text-[12.5px] font-semibold tracking-[0.04em] normal-case">
                      {cardStateLabel(card.state)}
                    </span>
                  </h3>
                  <p className="mt-5 font-serif text-[19px] leading-[1.65]">{card.back}</p>
                  {card.notes && (
                    <div className="border-rule mt-7 border-t pt-4">
                      <p className="text-ink-mute mb-2.5 text-[12px] leading-none font-extrabold tracking-[0.09em] uppercase">
                        Notes
                      </p>
                      <p className="text-ink-soft font-serif text-[15.5px] leading-relaxed">
                        {card.notes}
                      </p>
                    </div>
                  )}
                  <dl className="border-rule mt-7 grid grid-cols-2 border-y sm:grid-cols-4">
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
                <div
                  className="border-rule mt-9 grid place-items-center gap-3.5 border px-6 py-11 text-center"
                  style={{
                    background:
                      'repeating-linear-gradient(135deg, transparent 0 9px, var(--rule) 9px 10px), var(--paper-2)',
                  }}
                >
                  <p className="text-ink-soft max-w-[44ch] font-serif text-[17px] italic">
                    Recall the answer before you reveal it.
                  </p>
                  <button onClick={onReveal} className="btn h-[50px] px-[26px]">
                    Reveal answer
                    <kbd className="rounded-[3px] border border-b-2 border-current/40 px-[5px] pt-[3px] pb-[2px] font-mono text-[11px] leading-none font-medium">
                      Space
                    </kbd>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Grading */}
          <div className="border-rule shrink-0 border-t pt-3.5">
            <div
              className={cn(
                'grid grid-cols-2 gap-2.5 transition-opacity duration-300 sm:grid-cols-4',
                revealed ? 'opacity-100' : 'pointer-events-none opacity-0'
              )}
            >
              {GRADES.map((g) => (
                <button
                  key={g.key}
                  onClick={() => onGrade(g.key)}
                  disabled={!revealed}
                  title={g.gloss}
                  className={cn(
                    'group border-rule-2 bg-paper relative grid grid-cols-[auto_1fr_auto] items-center gap-x-2.5 gap-y-0.5 overflow-hidden rounded border px-3.5 pt-2.5 pb-[11px] text-left transition-[border-color,transform] duration-100 active:translate-y-px',
                    GRADE_TONE[g.key].border
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-[0.08] group-active:opacity-[0.16]',
                      GRADE_TONE[g.key].fill
                    )}
                  />
                  <span
                    aria-hidden
                    className={cn('row-span-2 size-[9px] rounded-full', GRADE_TONE[g.key].fill)}
                  />
                  <b className="text-[15px] leading-[1.1] font-bold">{g.label}</b>
                  <kbd className="border-rule-2 text-ink-soft bg-paper row-span-2 rounded-[3px] border border-b-2 px-[5px] pt-[3px] pb-[2px] font-mono text-[11px] leading-none font-medium">
                    {g.digit}
                  </kbd>
                  <small className="text-ink-soft col-start-2 font-mono text-[12.5px] leading-[1.1] font-medium tabular-nums">
                    {previews?.[g.key]}
                  </small>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between py-3 text-[13px]">
              <span className="text-ink-mute">
                <span className="tabular-nums">{Math.max(0, total - position)}</span> left in queue
              </span>
              {failedCount > 0 && (
                <button
                  onClick={onRetryFailed}
                  className="text-bad hover:decoration-bad decoration-rule-2 cursor-pointer font-semibold underline underline-offset-[3px] transition-colors"
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
    <div className="border-rule py-3.5 pr-4 even:border-l even:pl-4 sm:[&:nth-child(3)]:border-l sm:[&:nth-child(3)]:pl-4 [&:nth-child(n+3)]:border-t sm:[&:nth-child(n+3)]:border-t-0">
      <dd className="text-[22px] leading-none font-extrabold tracking-[-0.02em] tabular-nums">
        {v}
      </dd>
      <dt className="text-ink-mute mt-1.5 text-[12.5px]">{k}</dt>
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
    <div className="flex max-w-[760px] flex-1 flex-col justify-center py-16">
      <span className="label text-good inline-flex items-center gap-2">
        <span className="bg-good size-2 rounded-full" aria-hidden />
        Session complete
      </span>
      <h2 className="mt-6 max-w-[18ch] text-[clamp(34px,4.6vw,58px)] leading-[1.02] font-extrabold tracking-[-0.04em]">
        The session for {deck.name} is closed.
      </h2>
      <div className="border-t-ink border-b-rule mt-9 grid grid-cols-2 border-t-2 border-b sm:grid-cols-4">
        <Cell k="Reviewed" v={String(summary.reviewed)} />
        <Cell k="Forgotten" v={String(summary.again)} />
        <Cell k="Accuracy" v={`${Math.round(summary.accuracy * 100)}%`} accent />
        <Cell
          k="Seconds / card"
          v={summary.reviewed ? (summary.elapsed / summary.reviewed).toFixed(1) : '—'}
        />
      </div>
      <div className="mt-9 flex flex-wrap gap-2.5">
        <button onClick={onRestart} className="btn">
          Study again
        </button>
        <button onClick={onNextDeck} className="btn-ghost">
          Advance to next collection →
        </button>
      </div>
    </div>
  )
}

function Cell({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="border-rule py-[18px] pr-4 even:border-l even:pl-4 sm:[&:nth-child(3)]:border-l sm:[&:nth-child(3)]:pl-4 [&:nth-child(n+3)]:border-t sm:[&:nth-child(n+3)]:border-t-0">
      <div
        className={cn(
          'text-[34px] leading-none font-extrabold tracking-[-0.03em] tabular-nums',
          accent && 'text-accent'
        )}
      >
        {v}
      </div>
      <div className="text-ink-mute mt-2 text-[13px]">{k}</div>
    </div>
  )
}
