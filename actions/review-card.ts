// actions/review-card.ts
'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { fsrs, Rating, Card as FSRSCard, State, Grade } from 'ts-fsrs'
import { Rating as PrismaRating, CardState as PrismaCardState } from '@prisma/client'

// Map Prisma enums to FSRS enums
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
  clientReviewId: string // For idempotency
) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get current card progress
    const cardProgress = await prisma.cardProgress.findUnique({
      where: { id: cardProgressId },
      include: {
        card: {
          include: {
            deck: true,
          },
        },
      },
    })

    if (!cardProgress) {
      return { error: 'Card progress not found' }
    }

    if (cardProgress.userId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    // Check for existing review (idempotency)
    const existingReview = await prisma.review.findUnique({
      where: { clientReviewId },
    })

    if (existingReview) {
      return { success: true, message: 'Review already recorded' }
    }

    // Convert to FSRS card format
    const fsrsCard: FSRSCard = {
      due: cardProgress.due,
      stability: cardProgress.stability,
      difficulty: cardProgress.difficulty,
      elapsed_days: cardProgress.scheduledDays,
      scheduled_days: cardProgress.scheduledDays,
      reps: cardProgress.reps,
      lapses: cardProgress.lapses,
      state: stateMap[cardProgress.state],
      last_review: cardProgress.lastReviewedAt || undefined,
    }

    // Initialize FSRS scheduler
    const f = fsrs()
    const now = new Date()

    // Calculate next review schedule
    const schedulingCards = f.repeat(fsrsCard, now)
    const { card: nextCard, log } = schedulingCards[ratingMap[rating]]

    // Calculate elapsed days since last review
    const elapsedDays = cardProgress.lastReviewedAt
      ? Math.floor((now.getTime() - cardProgress.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // Update card progress and create review in transaction
    await prisma.$transaction(async (tx) => {
      // Update card progress
      await tx.cardProgress.update({
        where: { id: cardProgressId },
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

      // Create review record
      await tx.review.create({
        data: {
          cardProgressId,
          userId: session.user.id,
          rating,
          elapsedDays,
          scheduledDays: nextCard.scheduled_days,
          newDue: nextCard.due,
          clientReviewId,
        },
      })

      // Update deck progress
      const deckProgress = await tx.deckProgress.findUnique({
        where: {
          userId_deckId: {
            userId: session.user.id,
            deckId: cardProgress.card.deckId,
          },
        },
      })

      if (deckProgress) {
        await tx.deckProgress.update({
          where: { id: deckProgress.id },
          data: {
            lastStudiedAt: now,
            cardsStudied: { increment: 1 },
          },
        })
      }

      // Update course enrollment
      await tx.courseEnrollment.updateMany({
        where: {
          userId: session.user.id,
          courseId: cardProgress.card.deck.courseId,
        },
        data: {
          lastStudiedAt: now,
        },
      })
    })

    // revalidatePath('/study')

    return {
      success: true,
      nextDue: nextCard.due,
      scheduledDays: nextCard.scheduled_days,
    }
  } catch (error) {
    console.error('Review error:', error)
    return { error: 'Failed to record review' }
  }
}
