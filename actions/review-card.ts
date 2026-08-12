// actions/review-card.ts
'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Prisma } from '@prisma/client'
import type { Rating as PrismaRating } from '@prisma/client'
import { scheduler, toFsrsCard, ratingMap, reverseStateMap, DAY_MS } from '@/lib/fsrs'

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
        learningSteps: true,
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
      ? Math.max(0, Math.floor((now.getTime() - last.getTime()) / DAY_MS))
      : 0

    const fsrsCard = toFsrsCard(cardProgress, now)
    const scheduling = scheduler.repeat(fsrsCard, now)
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
            learningSteps: nextCard.learning_steps,
            lastReviewedAt: now,
            version: { increment: 1 },
          },
        })

        if (updated.count === 0) {
          // Someone else updated this card first; surface a benign message
          throw new Prisma.PrismaClientKnownRequestError('Version conflict', {
            code: 'P2034', // arbitrary here; you can use a custom error class instead
            clientVersion: 'n/a',
          })
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
      stability: nextCard.stability,
      difficulty: nextCard.difficulty,
      reps: nextCard.reps,
      lapses: nextCard.lapses,
      learningSteps: nextCard.learning_steps,
      // log, // expose if you want client insights
    }
  } catch (error) {
    const code = (error as { code?: string } | null)?.code
    if (code === 'P2034') {
      return { error: 'Card was updated elsewhere. Please retry.' }
    }
    if (code === 'P2002') {
      // Unique(clientReviewId) — idempotent success
      return { success: true, message: 'Review already recorded' }
    }
    console.error('Review error:', error)
    return { error: 'Failed to record review' }
  }
}
