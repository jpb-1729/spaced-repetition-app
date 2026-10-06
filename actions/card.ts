'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { createCardSchema, updateCardSchema } from '@/lib/schemas/card'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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

  redirect(`/admin/courses/${deck.courseId}/decks/${deck.id}`)
}

export type CardActionState = {
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function createCard(
  _prevState: CardActionState,
  formData: FormData
): Promise<CardActionState> {
  await requireAdmin()

  const raw = Object.fromEntries(formData.entries())
  const result = createCardSchema.safeParse(raw)

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const data = result.data

  const deck = await prisma.deck.findUnique({
    where: { id: data.deckId },
    select: { id: true, courseId: true },
  })
  if (!deck) {
    return { error: 'Deck not found.' }
  }

  await prisma.card.create({
    data: {
      deckId: deck.id,
      front: data.front,
      back: data.back,
      notes: data.notes || null,
      tags: data.tags,
    },
  })

  redirect(`/admin/courses/${deck.courseId}/decks/${deck.id}`)
}

export async function updateCard(
  _prevState: CardActionState,
  formData: FormData
): Promise<CardActionState> {
  await requireAdmin()

  const raw = Object.fromEntries(formData.entries())
  const result = updateCardSchema.safeParse(raw)

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { id, deckId, ...data } = result.data

  const card = await prisma.card.update({
    where: { id, deckId },
    data: {
      front: data.front,
      back: data.back,
      notes: data.notes || null,
      tags: data.tags,
    },
    select: { deck: { select: { id: true, courseId: true } } },
  })

  redirect(`/admin/courses/${card.deck.courseId}/decks/${card.deck.id}`)
}

export async function deleteCard(id: string) {
  await requireAdmin()
  const card = await prisma.card.delete({
    where: { id },
    select: { deck: { select: { id: true, courseId: true } } },
  })
  revalidatePath(`/admin/courses/${card.deck.courseId}/decks/${card.deck.id}`)
}

export async function getCard(id: string) {
  await requireAdmin()
  return prisma.card.findUnique({ where: { id } })
}
