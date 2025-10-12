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
      <h1 className="mb-8 text-3xl font-bold">All Decks</h1>

      <div className="grid gap-4">
        {decks.map((deck) => (
          <div key={deck.id} className="rounded-lg border p-6 transition-shadow hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{deck.name}</h2>
                <p className="mt-1 text-sm text-gray-600">Course: {deck.course.name}</p>
                <p className="text-sm text-gray-500">By {deck.course.creator.name || 'Unknown'}</p>
                {deck.description && <p className="mt-2 text-gray-700">{deck.description}</p>}
                <p className="mt-2 text-sm text-gray-500">{deck._count.cards} cards</p>
              </div>

              <EnrollButton courseId={deck.course.id} deckId={deck.id} deckName={deck.name} />
            </div>
          </div>
        ))}

        {decks.length === 0 && (
          <p className="py-8 text-center text-gray-500">No decks available yet.</p>
        )}
      </div>
    </div>
  )
}
