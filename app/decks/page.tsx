// app/decks/page.tsx
import { prisma } from '@/lib/prisma'
import { EnrollButton } from '@/components/EnrollButton'

export default async function DecksPage() {
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
      <h1 className="text-foreground mb-8 text-3xl font-bold uppercase">All Decks</h1>

      <div className="grid gap-4">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="brutal-border brutal-shadow bg-card p-6 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <div className="flex items-start justify-between">
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

              <EnrollButton courseId={deck.course.id} deckId={deck.id} deckName={deck.name} />
            </div>
          </div>
        ))}

        {decks.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-lg">No decks available yet.</p>
        )}
      </div>
    </div>
  )
}
