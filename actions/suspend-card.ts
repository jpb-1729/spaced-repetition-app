'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// Per-user: the card stays in the deck for everyone else, and the flag can be
// cleared later to bring it back. The study queue already excludes suspended
// progress rows.
export async function suspendCard(cardProgressId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const updated = await prisma.cardProgress.updateMany({
    where: { id: cardProgressId, userId: session.user.id },
    data: { suspended: true },
  })
  if (updated.count === 0) return { error: 'Card progress not found' }

  return { success: true }
}
