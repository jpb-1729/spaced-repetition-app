// actions/enrollment.ts
'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth' // or wherever your auth config is
import { revalidatePath } from 'next/cache'

export async function enrollInDeck(courseId: string, deckName: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  const userId = session.user.id

  try {
    const deck = await prisma.deck.findUnique({
      where: {
        courseId_name: {
          courseId: courseId,
          name: deckName,
        },
      },
      include: {
        course: {
          select: {
            _count: { select: { decks: true } },
          },
        },
        _count: {
          select: { cards: true },
        },
      },
    })

    if (!deck) {
      return { error: 'Deck not found' }
    }

    // Enroll in course
    await prisma.courseEnrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {
        lastStudiedAt: new Date(),
      },
      create: {
        userId,
        courseId,
        totalDecks: deck.course._count.decks,
        status: 'ACTIVE',
      },
    })

    // Create deck progress
    await prisma.deckProgress.upsert({
      where: {
        userId_deckId: {
          userId,
          deckId: deck.id,
        },
      },
      update: {
        lastStudiedAt: new Date(),
      },
      create: {
        userId,
        deckId: deck.id,
        totalCards: deck._count.cards,
      },
    })

    // Initialize card progress
    const cards = await prisma.card.findMany({
      where: { deckId: deck.id },
      select: { id: true },
    })

    await prisma.$transaction(
      cards.map((card) =>
        prisma.cardProgress.upsert({
          where: {
            userId_cardId: {
              userId,
              cardId: card.id,
            },
          },
          update: {},
          create: {
            userId,
            cardId: card.id,
            state: 'NEW',
            due: new Date(),
          },
        })
      )
    )

    revalidatePath('/decks')

    return { success: true }
  } catch (error) {
    console.error('Enrollment error:', error)
    return { error: 'Failed to enroll' }
  }
}
