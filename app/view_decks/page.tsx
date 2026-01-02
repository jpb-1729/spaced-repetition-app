import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SelectDeckPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const userDecks = await prisma.deck.findMany({
    where: {
      course: {
        enrollments: {
          some: {
            userId: session.user.id,
            status: 'ACTIVE',
          },
        },
      },
    },
    orderBy: {
      ordinal: 'asc',
    },
    include: {
      course: {
        select: { name: true },
      },
      _count: {
        select: {
          cards: true,
        },
      },
    },
  })

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-2xl font-bold">Select a Deck to Study</h1>

      {/* Study all due cards */}
      <Link
        href="/study"
        className="mb-8 block rounded-lg bg-blue-600 p-4 text-center text-white hover:bg-blue-700"
      >
        Study All Due Cards
      </Link>

      {/* Individual deck links */}
      <div className="grid gap-4">
        {userDecks.map((deck) => (
          <Link
            key={deck.id}
            href={`/study?deckId=${deck.id}`}
            className="rounded-lg border p-4 hover:bg-gray-50"
          >
            <h2 className="font-semibold">{deck.name}</h2>
            <p className="text-sm text-gray-600">
              {deck.course.name} · {deck._count.cards} cards
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
