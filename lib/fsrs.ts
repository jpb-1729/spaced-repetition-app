// lib/fsrs.ts — single source of FSRS truth, shared by the review-card server
// action and the study dashboard client.
import {
  fsrs,
  generatorParameters,
  Rating as FsrsRating,
  State,
  type Card as FSRSCard,
  type Grade as FsrsGrade,
} from 'ts-fsrs'
import type { Rating as PrismaRating, CardState as PrismaCardState } from '@prisma/client'

export const DAY_MS = 86_400_000

// Fuzz disabled so client-side interval previews deterministically match the
// schedule the server persists; short-term steps enabled for in-session
// relearning. These are ts-fsrs 5.4 defaults, pinned explicitly so a future
// ts-fsrs upgrade can't silently diverge client from server.
export const scheduler = fsrs(generatorParameters({ enable_fuzz: false, enable_short_term: true }))

export const ratingMap: Record<PrismaRating, FsrsGrade> = {
  AGAIN: FsrsRating.Again,
  HARD: FsrsRating.Hard,
  GOOD: FsrsRating.Good,
  EASY: FsrsRating.Easy,
}

export const stateMap: Record<PrismaCardState, State> = {
  NEW: State.New,
  LEARNING: State.Learning,
  REVIEW: State.Review,
  RELEARNING: State.Relearning,
}

export const reverseStateMap: Record<State, PrismaCardState> = {
  [State.New]: 'NEW',
  [State.Learning]: 'LEARNING',
  [State.Review]: 'REVIEW',
  [State.Relearning]: 'RELEARNING',
}

/**
 * The CardProgress scalar fields FSRS needs. Dates may arrive as Date objects
 * (Prisma, server side) or epoch ms (client DTOs).
 */
export interface ProgressScalars {
  state: PrismaCardState
  due: Date | number | null
  stability: number
  difficulty: number
  scheduledDays: number
  reps: number
  lapses: number
  lastReviewedAt: Date | number | null
  learningSteps: number
}

function toDate(value: Date | number | null | undefined): Date | null {
  if (value == null) return null
  return value instanceof Date ? value : new Date(value)
}

export function toFsrsCard(progress: ProgressScalars, now: Date): FSRSCard {
  const last = toDate(progress.lastReviewedAt)
  const elapsedDays = last ? Math.max(0, Math.floor((now.getTime() - last.getTime()) / DAY_MS)) : 0
  return {
    due: toDate(progress.due) ?? now, // FSRS expects a Date; fallback to now for NEW cards
    stability: progress.stability ?? 0,
    difficulty: progress.difficulty ?? 0,
    elapsed_days: elapsedDays,
    scheduled_days: progress.scheduledDays ?? 0,
    reps: progress.reps ?? 0,
    lapses: progress.lapses ?? 0,
    state: stateMap[progress.state],
    last_review: last ?? undefined,
    learning_steps: progress.learningSteps ?? 0,
  }
}

export function formatInterval(days: number): string {
  if (days < 1 / 24) return `${Math.max(1, Math.round(days * 1440))} min`
  if (days < 1) return `${Math.round(days * 24)} hr`
  if (days < 30) return `${Math.round(days)} d`
  if (days < 365) return `${(days / 30).toFixed(1)} mo`
  return `${(days / 365).toFixed(1)} yr`
}

/** Predicted next interval per rating, formatted for the grade buttons. */
export function previewIntervals(
  progress: ProgressScalars,
  now: Date
): Record<PrismaRating, string> {
  const scheduling = scheduler.repeat(toFsrsCard(progress, now), now)
  const format = (grade: FsrsGrade) =>
    formatInterval((scheduling[grade].card.due.getTime() - now.getTime()) / DAY_MS)
  return {
    AGAIN: format(FsrsRating.Again),
    HARD: format(FsrsRating.Hard),
    GOOD: format(FsrsRating.Good),
    EASY: format(FsrsRating.Easy),
  }
}

/** The three labels the study surface's state chip uses. */
export function cardStateLabel(state: PrismaCardState): 'Unseen' | 'Relearning' | 'In review' {
  if (state === 'NEW') return 'Unseen'
  if (state === 'REVIEW') return 'In review'
  return 'Relearning'
}
