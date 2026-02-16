'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const cardEntrySchema = z.object({
  Question: z.string().min(1, 'Question is required'),
  Answer: z.string().min(1, 'Answer is required'),
})

const bulkCardsSchema = z.object({
  test: z.array(cardEntrySchema).min(1, 'At least one card is required'),
})

export type BulkCardActionState = {
  error?: string
  inserted?: number
}

export async function bulkInsertCards(
  _prevState: BulkCardActionState,
  formData: FormData
): Promise<BulkCardActionState> {
  await requireAdmin()

  const deckId = formData.get('deckId')
  const jsonStr = formData.get('json')

  if (typeof deckId !== 'string' || !deckId) {
    return { error: 'Deck ID is required.' }
  }
  if (typeof jsonStr !== 'string' || !jsonStr.trim()) {
    return { error: 'JSON input is required.' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    return { error: 'Invalid JSON. Please check your syntax.' }
  }

  const result = bulkCardsSchema.safeParse(parsed)
  if (!result.success) {
    const issues = result.error.issues.map((i) => i.message).join('; ')
    return { error: `Validation failed: ${issues}` }
  }

  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    select: { id: true, courseId: true },
  })
  if (!deck) {
    return { error: 'Deck not found.' }
  }

  const cards = result.data.test

  await prisma.card.createMany({
    data: cards.map((c) => ({
      deckId: deck.id,
      front: c.Question,
      back: c.Answer,
    })),
  })

  redirect(`/admin/courses/${deck.courseId}`)
}
