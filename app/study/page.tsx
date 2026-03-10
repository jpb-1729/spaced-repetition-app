// app/study/page.tsx
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { StudySession } from './StudySession'
import { Prisma } from '@prisma/client'

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
  const courseId = typeof searchParams.courseId === 'string' ? searchParams.courseId : undefined

  // Require a scope — redirect if neither deckId nor courseId is provided
  if (!deckId && !courseId) {
    redirect('/view_decks')
  }

  // Construct the Where Clause dynamically
  const cardFilter: Prisma.CardWhereInput = {}
  if (deckId) {
    cardFilter.deckId = deckId
  } else if (courseId) {
    cardFilter.deck = { courseId: courseId }
  }

  const whereClause: Prisma.CardProgressWhereInput = {
    userId: session.user.id,
    due: {
      lte: new Date(),
    },
    suspended: false,
    card: cardFilter,
  }

  const dueCards = await prisma.cardProgress.findMany({
    where: whereClause,
    select: {
      id: true,
      state: true,
      due: true,
      stability: true,
      difficulty: true,
      scheduledDays: true,
      reps: true,
      lapses: true,
      lastReviewedAt: true,
      learningSteps: true,
      card: {
        select: {
          front: true,
          back: true,
          notes: true,
          deck: {
            select: {
              name: true,
              course: { select: { name: true } },
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

  // Fetch scope name for the title
  let studyTitle = 'Study'
  if (deckId) {
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: { name: true },
    })
    if (deck) studyTitle = `Studying: ${deck.name}`
  } else if (courseId) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { name: true },
    })
    if (course) studyTitle = `Studying: ${course.name}`
  }

  if (dueCards.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <div className="py-16 text-center">
          <h1 className="text-foreground mb-4 text-4xl font-bold uppercase">
            {deckId ? 'Deck Complete!' : 'Course Complete!'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {deckId
              ? "You've finished reviews for this deck."
              : "You've finished reviews for all decks in this course."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <h2 className="text-foreground text-2xl font-bold uppercase">{studyTitle}</h2>
      </div>
      <StudySession cards={dueCards} />
    </div>
  )
}
