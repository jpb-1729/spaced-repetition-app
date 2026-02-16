'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { createDeckSchema, updateDeckSchema } from '@/lib/schemas/deck'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

export type DeckActionState = {
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function createDeck(
  _prevState: DeckActionState,
  formData: FormData
): Promise<DeckActionState> {
  await requireAdmin()

  const raw = Object.fromEntries(formData.entries())
  const result = createDeckSchema.safeParse(raw)

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const data = result.data

  try {
    await prisma.deck.create({
      data: {
        courseId: data.courseId,
        name: data.name,
        description: data.description || null,
        ordinal: data.ordinal,
        cardsPerSession: data.cardsPerSession,
        passingScore: data.passingScore,
        isOptional: data.isOptional,
      },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const target = (e.meta?.target as string[]) || []
      if (target.includes('ordinal')) {
        return { error: 'A deck with that ordinal already exists in this course.' }
      }
      return { error: 'A deck with that name already exists in this course.' }
    }
    throw e
  }

  redirect(`/admin/courses/${data.courseId}`)
}

export async function updateDeck(
  _prevState: DeckActionState,
  formData: FormData
): Promise<DeckActionState> {
  await requireAdmin()

  const raw = Object.fromEntries(formData.entries())
  const result = updateDeckSchema.safeParse(raw)

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { id, courseId, ...data } = result.data

  try {
    await prisma.deck.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        ordinal: data.ordinal,
        cardsPerSession: data.cardsPerSession,
        passingScore: data.passingScore,
        isOptional: data.isOptional,
      },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const target = (e.meta?.target as string[]) || []
      if (target.includes('ordinal')) {
        return { error: 'A deck with that ordinal already exists in this course.' }
      }
      return { error: 'A deck with that name already exists in this course.' }
    }
    throw e
  }

  redirect(`/admin/courses/${courseId}`)
}

export async function deleteDeck(id: string) {
  await requireAdmin()
  const deck = await prisma.deck.delete({ where: { id } })
  revalidatePath(`/admin/courses/${deck.courseId}`)
}

export async function getDeck(id: string) {
  await requireAdmin()
  return prisma.deck.findUnique({
    where: { id },
    include: {
      _count: { select: { cards: true } },
    },
  })
}
