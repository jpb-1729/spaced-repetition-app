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
              name: true
            }
          }
        }
      },
      _count: {
        select: {
          cards: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">All Decks</h1>
      
      <div className="grid gap-4">
        {decks.map((deck) => (
          <div 
            key={deck.id} 
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{deck.name}</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Course: {deck.course.name}
                </p>
                <p className="text-gray-500 text-sm">
                  By {deck.course.creator.name || 'Unknown'}
                </p>
                {deck.description && (
                  <p className="text-gray-700 mt-2">{deck.description}</p>
                )}
                <p className="text-gray-500 text-sm mt-2">
                  {deck._count.cards} cards
                </p>
              </div>
              
              <EnrollButton 
                courseId={deck.course.id}
                deckId={deck.id}
                deckName={deck.name}
              />
            </div>
          </div>
        ))}

        {decks.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No decks available yet.
          </p>
        )}
      </div>
    </div>
  )
}