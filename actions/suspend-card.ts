'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// Per-user: the card stays in the deck for everyone else, and the flag can be
// cleared later to bring it back. The study queue already excludes suspended
// progress rows.
export async function suspendCard(cardProgressId: string) {
  return setSuspended(cardProgressId, true)
}

export async function restoreCard(cardProgressId: string) {
  return setSuspended(cardProgressId, false)
}

async function setSuspended(cardProgressId: string, suspended: boolean) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const updated = await prisma.cardProgress.updateMany({
    where: { id: cardProgressId, userId: session.user.id },
    data: { suspended },
  })
  if (updated.count === 0) return { error: 'Card progress not found' }

  return { success: true }
}
