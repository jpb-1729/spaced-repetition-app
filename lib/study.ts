// lib/study.ts — shared select literals and serializable DTOs for the study
// dashboard. All timestamps cross the RSC boundary as epoch ms.
import type { Prisma, CardState, Rating } from '@prisma/client'

/** Queue rows: scheduling scalars + card text. */
export const studyCardSelect = {
  id: true,
  state: true,
  due: true,
  stability: true,
  difficulty: true,
  scheduledDays: true,
  reps: true,
  lapses: true,
  lastReviewedAt: true,
  learningSteps: true,
  card: { select: { id: true, deckId: true, front: true, back: true, notes: true } },
} satisfies Prisma.CardProgressSelect

export type StudyCardRow = Prisma.CardProgressGetPayload<{ select: typeof studyCardSelect }>

/** Snapshot rows: scheduling scalars only (no text) — cheap at any corpus size. */
export const progressSnapshotSelect = {
  id: true,
  state: true,
  due: true,
  stability: true,
  difficulty: true,
  scheduledDays: true,
  reps: true,
  lapses: true,
  lastReviewedAt: true,
  learningSteps: true,
  card: { select: { id: true, deckId: true } },
} satisfies Prisma.CardProgressSelect

export type ProgressSnapshotRow = Prisma.CardProgressGetPayload<{
  select: typeof progressSnapshotSelect
}>

export interface ProgressRow {
  progressId: string
  cardId: string
  deckId: string
  state: CardState
  due: number
  stability: number
  difficulty: number
  scheduledDays: number
  reps: number
  lapses: number
  lastReviewedAt: number | null
  learningSteps: number
}

export interface QueueCard extends ProgressRow {
  front: string
  back: string
  notes: string | null
}

export interface DeckInfo {
  id: string
  name: string
  courseId: string
  courseName: string
  /** Position in the flat enrolled-deck list, padded: "01", "02", … */
  index: string
  cardsPerSession: number
}

export interface HistoryReview {
  ts: number
  rating: Rating
}

export interface LogRow {
  id: string
  front: string
  grade: Rating
  ts: number
  /** Pre-formatted next interval, e.g. "3 d". */
  interval: string
}

export interface StudyDashboardData {
  serverNow: number
  decks: DeckInfo[]
  snapshot: ProgressRow[]
  /** Per deck id: the 40 soonest-due cards with text. */
  queues: Record<string, QueueCard[]>
  /** Timestamps of the last 126 days of reviews (heatmap/streak source). */
  recentReviews: HistoryReview[]
  /** Latest 8 reviews, newest first (review-log seed). */
  latestLog: LogRow[]
  totalReviews: number
  isAdmin: boolean
}

export function toProgressRow(row: ProgressSnapshotRow): ProgressRow {
  return {
    progressId: row.id,
    cardId: row.card.id,
    deckId: row.card.deckId,
    state: row.state,
    due: row.due.getTime(),
    stability: row.stability,
    difficulty: row.difficulty,
    scheduledDays: row.scheduledDays,
    reps: row.reps,
    lapses: row.lapses,
    lastReviewedAt: row.lastReviewedAt?.getTime() ?? null,
    learningSteps: row.learningSteps,
  }
}

export function toQueueCard(row: StudyCardRow): QueueCard {
  return {
    ...toProgressRow(row),
    front: row.card.front,
    back: row.card.back,
    notes: row.card.notes,
  }
}
