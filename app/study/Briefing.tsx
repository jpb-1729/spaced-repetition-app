import type { DeckInfo } from '@/lib/study'
import { formatInterval, DAY_MS } from '@/lib/fsrs'
import { cn } from '@/lib/cn'
import { Kbd, SectionHead } from './ui'

export interface BriefingStats {
  /** Cards in the deck due now (excluding unseen). */
  dueReviews: number
  /** Unseen cards due now. */
  dueNew: number
  /** Cards in the deck. */
  total: number
  /** How many cards the session will actually contain. */
  sessionSize: number
  /** Whether the session pulls not-yet-due cards forward because nothing is due. */
  studyingAhead: boolean
  /** Epoch ms of the soonest due card, or null when the deck is empty. */
  nextDue: number | null
  /** Estimated seconds per card from recent history. */
  secondsPerCard: number
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${Math.max(5, Math.round(seconds / 5) * 5)} sec`
  const m = Math.round(seconds / 60)
  return m === 1 ? '1 min' : `${m} min`
}

function formatUntil(ms: number, nowMs: number) {
  const days = (ms - nowMs) / DAY_MS
  if (days < 1 / 24) return 'under an hour'
  if (days < 1) return `${Math.round(days * 24)} h`
  return formatInterval(days)
}

export function Briefing({
  deck,
  stats,
  onBegin,
  nowMs,
}: {
  deck: DeckInfo
  stats: BriefingStats
  onBegin: () => void
  nowMs: number
}) {
  const dueTotal = stats.dueReviews + stats.dueNew
  const nothingDue = dueTotal === 0
  const estimate = formatDuration(stats.sessionSize * stats.secondsPerCard)

  return (
    <div className="flex h-full flex-col">
      <SectionHead n="03" title="Today" meta={deck.courseName} />

      <div className="anim-rise flex max-w-[760px] flex-1 flex-col justify-center py-12">
        <span
          className={cn(
            'label inline-flex items-center gap-2',
            nothingDue ? 'text-ink-mute' : 'text-accent'
          )}
        >
          <span
            className={cn('size-2 rounded-full', nothingDue ? 'bg-rule-2' : 'bg-accent')}
            aria-hidden
          />
          {nothingDue ? 'Nothing due' : 'Session ready'}
        </span>

        <h2 className="mt-5 max-w-[20ch] font-serif text-[clamp(32px,4.2vw,52px)] leading-[1.1] font-semibold tracking-[-0.015em] text-balance [font-variation-settings:'opsz'_60]">
          {nothingDue ? (
            <>{deck.name} is up to date.</>
          ) : (
            <>
              <span className="tabular-nums">{dueTotal}</span>{' '}
              {dueTotal === 1 ? 'card is' : 'cards are'} waiting in {deck.name}.
            </>
          )}
        </h2>

        <p className="text-ink-soft mt-4 max-w-[52ch] font-serif text-[17px] leading-relaxed">
          {nothingDue ? (
            stats.nextDue ? (
              <>
                The next card comes due in {formatUntil(stats.nextDue, nowMs)}. You can study ahead,
                but reviewing early shortens the intervals the scheduler was aiming for.
              </>
            ) : (
              <>This collection has no cards yet.</>
            )
          ) : (
            <>
              This session covers <span className="tabular-nums">{stats.sessionSize}</span> of them
              and should take about {estimate} at your recent pace.
            </>
          )}
        </p>

        <dl className="border-t-ink border-b-rule mt-9 grid grid-cols-2 border-t-2 border-b sm:grid-cols-4">
          <Cell k="Due for review" v={String(stats.dueReviews)} accent={stats.dueReviews > 0} />
          <Cell k="New today" v={String(stats.dueNew)} />
          <Cell k="This session" v={String(stats.sessionSize)} />
          <Cell k="Est. time" v={stats.sessionSize ? estimate : '—'} />
        </dl>

        <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            onClick={onBegin}
            disabled={stats.sessionSize === 0}
            className="btn disabled:cursor-not-allowed disabled:opacity-40"
          >
            {stats.studyingAhead ? 'Study ahead' : 'Begin session'}
          </button>
          <span className="text-ink-mute flex items-center gap-1.5 text-[13px]">
            <Kbd>Enter</Kbd>
            <span>to begin</span>
          </span>
        </div>

        <p className="text-ink-mute mt-8 text-[13px]">
          Pick a different collection, order, or session size in the index. The queue is built when
          you begin.
        </p>
      </div>
    </div>
  )
}

function Cell({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="border-rule py-[18px] pr-4 even:border-l even:pl-4 sm:[&:nth-child(3)]:border-l sm:[&:nth-child(3)]:pl-4 [&:nth-child(n+3)]:border-t sm:[&:nth-child(n+3)]:border-t-0">
      <dd
        className={cn(
          'text-[34px] leading-none font-extrabold tracking-[-0.03em] tabular-nums',
          accent && 'text-accent'
        )}
      >
        {v}
      </dd>
      <dt className="text-ink-mute mt-2 text-[13px]">{k}</dt>
    </div>
  )
}
