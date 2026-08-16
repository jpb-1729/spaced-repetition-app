'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Rating } from '@prisma/client'
import { reviewCard } from '@/actions/review-card'
import {
  DAY_MS,
  formatInterval,
  ratingMap,
  reverseStateMap,
  scheduler,
  toFsrsCard,
} from '@/lib/fsrs'
import type { LogRow, ProgressRow, QueueCard, StudyDashboardData } from '@/lib/study'
import { Masthead } from './Masthead'
import { DeckIndex, type DeckStat } from './DeckIndex'
import { StudySurface } from './StudySurface'
import { Metrics } from './Metrics'

type Order = 'sequential' | 'shuffled'

interface FailedReview {
  progressId: string
  rating: Rating
  clientReviewId: string
}

function collapsedState(state: ProgressRow['state']): 'new' | 'learning' | 'review' {
  if (state === 'NEW') return 'new'
  if (state === 'REVIEW') return 'review'
  return 'learning'
}

function clampLimit(n: number) {
  return Math.min(40, Math.max(4, Math.round(n / 4) * 4))
}

function buildSnapshotMap(rows: ProgressRow[]): Map<string, ProgressRow> {
  return new Map(rows.map((r) => [r.progressId, r]))
}

function buildQueue(rows: ProgressRow[], order: Order, limit: number, nowMs: number): string[] {
  let pool = rows.filter((r) => r.due <= nowMs)
  if (pool.length === 0) pool = [...rows].sort((a, b) => a.due - b.due).slice(0, 6)
  const sorted =
    order === 'shuffled'
      ? [...pool].sort(() => Math.random() - 0.5)
      : [...pool].sort((a, b) => {
          const sa = collapsedState(a.state)
          const sb = collapsedState(b.state)
          if (sa === sb) return a.due - b.due
          return sa === 'new' ? 1 : -1
        })
  return sorted.slice(0, limit).map((r) => r.progressId)
}

export function StudyDashboard({
  data,
  initialDeckId,
  signOutAction,
}: {
  data: StudyDashboardData
  initialDeckId: string
  signOutAction: () => Promise<void>
}) {
  const router = useRouter()
  const decks = data.decks
  const initialDeck = decks.find((d) => d.id === initialDeckId) ?? decks[0]

  // Card text by progress id, accumulated across refreshes so a mid-session
  // card never loses its text when a new tranche of queue data arrives.
  const [textCache] = useState<Map<string, QueueCard>>(() => {
    const m = new Map<string, QueueCard>()
    for (const rows of Object.values(data.queues)) for (const r of rows) m.set(r.progressId, r)
    return m
  })

  const [snapshot, setSnapshot] = useState<Map<string, ProgressRow>>(() =>
    buildSnapshotMap(data.snapshot)
  )
  const [activeDeck, setActiveDeck] = useState(initialDeck.id)
  const [order, setOrder] = useState<Order>('sequential')
  const [limit, setLimit] = useState(() => clampLimit(initialDeck.cardsPerSession))
  // Every time-derived computation renders from this state. It is seeded with
  // the server timestamp (identical on the SSR pass and the hydration pass)
  // and only advances on mount and on user actions — hydration-safe.
  const [now, setNow] = useState<Date>(() => new Date(data.serverNow))
  const [queue, setQueue] = useState<string[]>(() =>
    buildQueue(
      data.snapshot.filter((r) => r.deckId === initialDeck.id && textCache.has(r.progressId)),
      'sequential',
      clampLimit(initialDeck.cardsPerSession),
      data.serverNow
    )
  )
  const [pos, setPos] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [sessionLog, setSessionLog] = useState<LogRow[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [failed, setFailed] = useState<FailedReview[]>([])

  // Serialized submission chain: reviews post one at a time, in order, so the
  // AGAIN-requeue second grade can never race the first on the same row.
  const chainRef = useRef<Promise<void>>(Promise.resolve())

  // After router.refresh() delivers fresh props, adopt server truth wholesale
  // (render-phase state adjustment, per React's derived-state guidance).
  // Optimistic local values were computed with the same pinned FSRS params, so
  // any drift is a few seconds of `now` skew — server wins.
  const [prevServerNow, setPrevServerNow] = useState(data.serverNow)
  if (prevServerNow !== data.serverNow) {
    setPrevServerNow(data.serverNow)
    for (const rows of Object.values(data.queues))
      for (const r of rows) textCache.set(r.progressId, r)
    setSnapshot(buildSnapshotMap(data.snapshot))
  }

  useEffect(() => {
    // Adopt the real client clock right after hydration (the SSR pass rendered
    // from the server timestamp).
    const syncNow = window.setTimeout(() => setNow(new Date()), 0)
    const t = window.setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => {
      window.clearTimeout(syncNow)
      window.clearInterval(t)
    }
  }, [])

  const nowMs = now.getTime()
  const complete = pos >= queue.length
  const currentId = complete ? null : queue[pos]
  const current: QueueCard | null = useMemo(() => {
    if (!currentId) return null
    const text = textCache.get(currentId)
    const row = snapshot.get(currentId)
    if (!text) return null
    return row ? { ...text, ...row } : text
  }, [currentId, snapshot, textCache])
  const deck = decks.find((d) => d.id === activeDeck) ?? decks[0]

  const deckRows = useCallback(
    (deckId: string) =>
      [...snapshot.values()].filter((r) => r.deckId === deckId && textCache.has(r.progressId)),
    [snapshot, textCache]
  )

  const rebuild = useCallback(
    (deckId: string, o: Order, l: number) => {
      const nowD = new Date()
      setNow(nowD)
      setQueue(buildQueue(deckRows(deckId), o, l, nowD.getTime()))
      setPos(0)
      setRevealed(false)
    },
    [deckRows]
  )

  const submit = useCallback(
    (progressId: string, rating: Rating, clientReviewId: string = crypto.randomUUID()) => {
      chainRef.current = chainRef.current.then(async () => {
        try {
          const result = await reviewCard(progressId, rating, clientReviewId)
          if ('error' in result && result.error) {
            setFailed((f) => [...f, { progressId, rating, clientReviewId }])
          }
        } catch {
          setFailed((f) => [...f, { progressId, rating, clientReviewId }])
        }
      })
    },
    []
  )

  const retryFailed = useCallback(() => {
    setFailed((prev) => {
      // Same clientReviewId: the server treats a replay as idempotent success.
      for (const f of prev) submit(f.progressId, f.rating, f.clientReviewId)
      return []
    })
  }, [submit])

  const grade = useCallback(
    (g: Rating) => {
      if (!current || !revealed) return
      const nowD = new Date()
      const next = scheduler.next(toFsrsCard(current, nowD), nowD, ratingMap[g]).card
      const patched: ProgressRow = {
        progressId: current.progressId,
        cardId: current.cardId,
        deckId: current.deckId,
        state: reverseStateMap[next.state],
        due: next.due.getTime(),
        stability: next.stability,
        difficulty: next.difficulty,
        scheduledDays: next.scheduled_days,
        reps: next.reps,
        lapses: next.lapses,
        lastReviewedAt: nowD.getTime(),
        learningSteps: next.learning_steps,
      }
      setSnapshot((m) => new Map(m).set(current.progressId, patched))
      setSessionLog((l) => [
        {
          id: current.progressId,
          front: current.front,
          grade: g,
          ts: nowD.getTime(),
          interval: formatInterval((next.due.getTime() - nowD.getTime()) / DAY_MS),
        },
        ...l,
      ])
      if (g === 'AGAIN') setQueue((q) => [...q, current.progressId])
      setPos((p) => p + 1)
      setRevealed(false)
      setNow(nowD)
      submit(current.progressId, g)
    },
    [current, revealed, submit]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      )
        return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!revealed && current) setRevealed(true)
        return
      }
      const map: Record<string, Rating> = { '1': 'AGAIN', '2': 'HARD', '3': 'GOOD', '4': 'EASY' }
      if (map[e.key]) {
        e.preventDefault()
        grade(map[e.key])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [revealed, current, grade])

  /* ---------- derived statistics ---------- */

  const allRows = useMemo(() => [...snapshot.values()], [snapshot])

  const deckStats = useMemo(() => {
    const out: Record<string, DeckStat> = {}
    decks.forEach((d) => {
      const inDeck = allRows.filter((r) => r.deckId === d.id)
      const maturity =
        inDeck.reduce((a, r) => a + Math.min(1, r.stability / 21), 0) / Math.max(1, inDeck.length)
      out[d.id] = {
        total: inDeck.length,
        due: inDeck.filter((r) => r.due <= nowMs).length,
        neu: inDeck.filter((r) => collapsedState(r.state) === 'new').length,
        maturity,
      }
    })
    return out
  }, [allRows, decks, nowMs])

  const forecast = useMemo(() => {
    const days = Array.from({ length: 14 }, () => 0)
    allRows.forEach((r) => {
      const until = (r.due - nowMs) / DAY_MS
      if (until <= 0.5) days[0] += 1
      else {
        const d = Math.round(until)
        if (d >= 1 && d < 14) days[d] += 1
      }
    })
    return days
  }, [allRows, nowMs])

  // Session entries not yet reflected in the server-fetched history (the
  // fetch horizon is data.serverNow, which advances on every refresh).
  const unsyncedLog = useMemo(
    () => sessionLog.filter((e) => e.ts > data.serverNow),
    [sessionLog, data.serverNow]
  )

  const heat = useMemo(() => {
    const counts = new Map<number, number>()
    const bump = (ts: number) => {
      const d = new Date(ts)
      d.setHours(0, 0, 0, 0)
      counts.set(d.getTime(), (counts.get(d.getTime()) ?? 0) + 1)
    }
    data.recentReviews.forEach((r) => bump(r.ts))
    unsyncedLog.forEach((e) => bump(e.ts))
    const today = new Date(nowMs)
    today.setHours(0, 0, 0, 0)
    return Array.from({ length: 126 }, (_, i) => {
      const day = new Date(today)
      day.setDate(day.getDate() - (125 - i))
      return Math.min(1, (counts.get(day.getTime()) ?? 0) / 10)
    })
  }, [data.recentReviews, unsyncedLog, nowMs])

  const streak = useMemo(() => {
    const days = new Set<number>()
    const add = (ts: number) => {
      const d = new Date(ts)
      d.setHours(0, 0, 0, 0)
      days.add(d.getTime())
    }
    data.recentReviews.forEach((r) => add(r.ts))
    unsyncedLog.forEach((e) => add(e.ts))
    const day = new Date(nowMs)
    day.setHours(0, 0, 0, 0)
    if (!days.has(day.getTime())) day.setDate(day.getDate() - 1) // today isn't over yet
    let s = 0
    while (days.has(day.getTime())) {
      s++
      day.setDate(day.getDate() - 1)
    }
    return s
  }, [data.recentReviews, unsyncedLog, nowMs])

  const again = sessionLog.filter((l) => l.grade === 'AGAIN').length
  const summary = {
    reviewed: sessionLog.length,
    again,
    accuracy: sessionLog.length ? (sessionLog.length - again) / sessionLog.length : 0,
    elapsed,
    stability: allRows.length ? allRows.reduce((a, r) => a + r.stability, 0) / allRows.length : 0,
  }

  const dueToday = allRows.filter((r) => r.due <= nowMs).length
  const displayLog = useMemo(
    () => [...unsyncedLog, ...data.latestLog],
    [unsyncedLog, data.latestLog]
  )
  const totalEntries = data.totalReviews + unsyncedLog.length

  const refreshWhenSynced = useCallback(() => {
    // Pull the next tranche of queue data once in-flight reviews settle.
    chainRef.current.then(() => router.refresh())
  }, [router])

  const nextDeck = useCallback(() => {
    const i = decks.findIndex((d) => d.id === activeDeck)
    const n = decks[(i + 1) % decks.length]
    setActiveDeck(n.id)
    rebuild(n.id, order, limit)
    refreshWhenSynced()
  }, [decks, activeDeck, order, limit, rebuild, refreshWhenSynced])

  return (
    <div className="min-h-screen lg:flex lg:h-screen lg:flex-col">
      <div className="mx-auto w-full max-w-[1680px] px-5 sm:px-8 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:px-10">
        <Masthead
          dueToday={dueToday}
          corpusSize={allRows.length}
          elapsed={elapsed}
          progress={queue.length ? Math.min(pos / queue.length, 1) : 0}
          now={now}
        />

        <main className="grid grid-cols-1 lg:min-h-0 lg:flex-1 lg:grid-cols-[262px_minmax(0,1fr)_290px]">
          <div className="border-ink/20 order-2 border-t py-7 lg:order-none lg:min-h-0 lg:border-t-0 lg:pr-7">
            <div className="hide-scroll h-full overflow-y-auto">
              <DeckIndex
                decks={decks}
                stats={deckStats}
                active={activeDeck}
                onSelect={(id) => {
                  setActiveDeck(id)
                  rebuild(id, order, limit)
                }}
                order={order}
                onOrder={(o) => {
                  setOrder(o)
                  rebuild(activeDeck, o, limit)
                }}
                limit={limit}
                onLimit={(n) => {
                  setLimit(n)
                  rebuild(activeDeck, order, n)
                }}
                isAdmin={data.isAdmin}
                signOutAction={signOutAction}
              />
            </div>
          </div>

          <div className="lg:border-ink/20 order-1 py-7 lg:order-none lg:min-h-0 lg:border-l lg:px-8">
            <StudySurface
              card={current}
              deck={deck}
              revealed={revealed}
              onReveal={() => setRevealed(true)}
              onGrade={grade}
              position={pos}
              total={queue.length}
              complete={complete}
              onRestart={() => {
                rebuild(activeDeck, order, limit)
                refreshWhenSynced()
              }}
              onNextDeck={nextDeck}
              summary={summary}
              now={now}
              failedCount={failed.length}
              onRetryFailed={retryFailed}
            />
          </div>

          <div className="border-ink/20 order-3 border-t py-7 lg:order-none lg:min-h-0 lg:border-t-0 lg:border-l lg:pl-7">
            <div className="hide-scroll h-full overflow-y-auto">
              <Metrics
                summary={summary}
                forecast={forecast}
                heat={heat}
                log={displayLog}
                streak={streak}
                totalEntries={totalEntries}
              />
            </div>
          </div>
        </main>

        <footer className="border-ink flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t py-4">
          <span className="label text-ink-mute">
            Olivero Recall — FSRS-6 scheduler, retention-targeted intervals
          </span>
          <span className="label text-ink-mute">
            Set in Newsreader &amp; Inter Tight · Grid 3 : 7 : 3
          </span>
          <span className="label text-ink-mute">
            Ed. IV / № {String(totalEntries + 12).padStart(3, '0')}
          </span>
        </footer>
      </div>
    </div>
  )
}
