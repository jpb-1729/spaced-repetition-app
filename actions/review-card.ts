// actions/review-card.ts
'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { fsrs, Rating, Card as FSRSCard, State, Grade, default_request_retention } from 'ts-fsrs'
import { Prisma } from '@prisma/client'
import type { Rating as PrismaRating, CardState as PrismaCardState } from '@prisma/client'

const ratingMap: Record<PrismaRating, Grade> = {
  AGAIN: Rating.Again,
  HARD: Rating.Hard,
  GOOD: Rating.Good,
  EASY: Rating.Easy,
}

const stateMap: Record<PrismaCardState, State> = {
  NEW: State.New,
  LEARNING: State.Learning,
  REVIEW: State.Review,
  RELEARNING: State.Relearning,
}

const reverseStateMap: Record<State, PrismaCardState> = {
  [State.New]: 'NEW',
  [State.Learning]: 'LEARNING',
  [State.Review]: 'REVIEW',
  [State.Relearning]: 'RELEARNING',
}

export async function reviewCard(
  cardProgressId: string,
  rating: PrismaRating,
  clientReviewId: string // idempotency token (must be unique in DB)
) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }
  const userId = session.user.id

  try {
    // Enforce ownership in the query
    const cardProgress = await prisma.cardProgress.findFirst({
      where: { id: cardProgressId, userId: userId },
      select: {
        id: true,
        userId: true,
        state: true,
        due: true,
        stability: true,
        difficulty: true,
        scheduledDays: true,
        reps: true,
        lapses: true,
        lastReviewedAt: true,
        version: true,
        card: {
          select: {
            deckId: true,
            deck: { select: { courseId: true } },
          },
        },
      },
    })

    if (!cardProgress) return { error: 'Card progress not found' }

    const now = new Date()
    const last = cardProgress.lastReviewedAt
    const elapsedDaysSinceLast = last
      ? Math.max(0, Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)))
      : 0

    // Prepare FSRS input
    const fsrsCard: FSRSCard = {
      due: cardProgress.due ?? now, // FSRS expects a Date; fallback to now for NEW cards
      stability: cardProgress.stability ?? 0,
      difficulty: cardProgress.difficulty ?? 0,
      elapsed_days: elapsedDaysSinceLast,
      scheduled_days: cardProgress.scheduledDays ?? 0,
      reps: cardProgress.reps ?? 0,
      lapses: cardProgress.lapses ?? 0,
      state: stateMap[cardProgress.state],
      last_review: last ?? undefined,
      learning_steps: 0,
    }

    const f = fsrs()
    const scheduling = f.repeat(fsrsCard, now)
    const grade = ratingMap[rating]
    const { card: nextCard, log } = scheduling[grade]

    // Transaction with (a) optimistic locking on version, (b) idempotent insert via unique constraint
    await prisma
      .$transaction(async (tx) => {
        const updated = await tx.cardProgress.updateMany({
          where: { id: cardProgressId, userId: userId, version: cardProgress.version },
          data: {
            state: reverseStateMap[nextCard.state],
            due: nextCard.due,
            stability: nextCard.stability,
            difficulty: nextCard.difficulty,
            scheduledDays: nextCard.scheduled_days,
            reps: nextCard.reps,
            lapses: nextCard.lapses,
            lastReviewedAt: now,
            version: { increment: 1 },
          },
        })

        if (updated.count === 0) {
          // Someone else updated this card first; surface a benign message
          throw new Prisma.PrismaClientKnownRequestError('Version conflict', {
            code: 'P2034', // arbitrary here; you can use a custom error class instead
            clientVersion: 'n/a',
          } as any)
        }

        await tx.review.create({
          data: {
            cardProgressId,
            userId: userId,
            rating,
            elapsedDays: elapsedDaysSinceLast,
            scheduledDays: nextCard.scheduled_days,
            newDue: nextCard.due,
            clientReviewId, // must be unique in schema
          },
        })

        // Course enrollment (prefer unique & update)
        await tx.courseEnrollment.updateMany({
          where: { userId: userId, courseId: cardProgress.card.deck.courseId },
          data: { lastStudiedAt: now },
        })
      })
      .catch((err) => {
        // Convert unique violation on clientReviewId into idempotent success
        if (err?.code === 'P2002') {
          return // treat as already recorded
        }
        throw err
      })

    return {
      success: true,
      nextDue: nextCard.due,
      scheduledDays: nextCard.scheduled_days,
      nextState: reverseStateMap[nextCard.state],
      // log, // expose if you want client insights
    }
  } catch (error: any) {
    if (error?.code === 'P2034') {
      return { error: 'Card was updated elsewhere. Please retry.' }
    }
    if (error?.code === 'P2002') {
      // Unique(clientReviewId) — idempotent success
      return { success: true, message: 'Review already recorded' }
    }
    console.error('Review error:', error)
    return { error: 'Failed to record review' }
  }
}
