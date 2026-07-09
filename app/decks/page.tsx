// app/decks/page.tsx
import { prisma } from '@/lib/prisma'
import { EnrollButton } from '@/components/EnrollButton'
import { auth } from '@/auth'
import { Card } from '@/components/ui/card'
import { EmptyState, EmptyStateTitle, EmptyStateDescription } from '@/components/ui/empty-state'

export default async function DecksPage() {
  const session = await auth()
  const userId = session?.user?.id

  const enrolledDeckIds = userId
    ? (
        await prisma.deckProgress.findMany({
          where: { userId },
          select: { deckId: true },
        })
      ).map((dp) => dp.deckId)
    : []

  const decks = await prisma.deck.findMany({
    include: {
      course: {
        select: {
          id: true,
          name: true,
          creator: {
            select: {
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          cards: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-foreground mb-8 text-3xl font-black uppercase">All Decks</h1>

      <div className="grid gap-4">
        {decks.map((deck) => (
          <Card key={deck.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-foreground text-xl font-bold">{deck.name}</h2>
                <p className="text-muted-foreground mt-1 text-sm font-bold">
                  Course: {deck.course.name}
                </p>
                <p className="text-muted-foreground text-sm">
                  By {deck.course.creator.name || 'Unknown'}
                </p>
                {deck.description && (
                  <p className="text-foreground mt-2">{deck.description}</p>
                )}
                <p className="text-muted-foreground mt-2 font-mono text-sm font-bold">
                  {deck._count.cards} cards
                </p>
              </div>

              <EnrollButton courseId={deck.course.id} deckId={deck.id} deckName={deck.name} isEnrolled={enrolledDeckIds.includes(deck.id)} />
            </div>
          </Card>
        ))}

        {decks.length === 0 && (
          <EmptyState variant="filled">
            <EmptyStateTitle>No decks available yet</EmptyStateTitle>
            <EmptyStateDescription>Check back soon.</EmptyStateDescription>
          </EmptyState>
        )}
      </div>
    </div>
  )
}
