// app/study/page.tsx
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { StudySession } from './StudySession'
import { Prisma } from '@prisma/client' // Import Prisma types for type safety

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function StudyPage(props: Props) {
  const searchParams = await props.searchParams
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const deckId = typeof searchParams.deckId === 'string' ? searchParams.deckId : undefined

  // 1. Construct the Where Clause Object dynamically
  const whereClause: Prisma.CardProgressWhereInput = {
    userId: session.user.id,
    due: {
      lte: new Date(),
    },
    suspended: false,
    // Conditionally add the deck filter if deckId is present
    ...(deckId && {
      card: {
        deckId: deckId,
      },
    }),
  }

  // 2. Fetch using the dynamic where clause
  const dueCards = await prisma.cardProgress.findMany({
    where: whereClause,
    include: {
      card: {
        include: {
          deck: {
            include: {
              course: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      due: 'asc',
    },
    take: 20,
  })

  // 3. Optional: Fetch Deck details if filtering, to show a better title
  let studyTitle = 'All Due Cards'
  if (deckId) {
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: { name: true },
    })
    if (deck) studyTitle = `Studying: ${deck.name}`
  }

  if (dueCards.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <div className="py-16 text-center">
          <h1 className="mb-4 text-3xl font-bold">{deckId ? 'Deck Complete!' : 'No Cards Due!'}</h1>
          <p className="text-gray-600">
            {deckId
              ? "You've finished reviews for this deck."
              : "You're all caught up. Check back later."}
          </p>
          {/* Add a 'Back to Dashboard' or 'Study All' button here */}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{studyTitle}</h2>
      </div>
      <StudySession cards={dueCards} />
    </div>
  )
}
