import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SelectDeckPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const now = new Date()

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
        select: { id: true, name: true },
      },
      _count: {
        select: {
          cards: true,
        },
      },
      cards: {
        select: {
          cardProgresses: {
            where: {
              userId: session.user.id,
              due: { lte: now },
              suspended: false,
            },
            select: { id: true },
          },
        },
      },
    },
  })

  // Group decks by course
  const courseMap = new Map<string, {
    courseId: string
    courseName: string
    decks: typeof userDecks
  }>()

  for (const deck of userDecks) {
    const key = deck.course.id
    if (!courseMap.has(key)) {
      courseMap.set(key, {
        courseId: deck.course.id,
        courseName: deck.course.name,
        decks: [],
      })
    }
    courseMap.get(key)!.decks.push(deck)
  }

  const courses = Array.from(courseMap.values())

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-2xl font-bold">Choose What to Study</h1>

      {courses.length === 0 && (
        <p className="text-gray-600">You are not enrolled in any courses yet.</p>
      )}

      <div className="space-y-8">
        {courses.map((course) => {
          const courseDueCount = course.decks.reduce(
            (sum, deck) => sum + deck.cards.reduce((s, c) => s + c.cardProgresses.length, 0),
            0
          )

          return (
            <div key={course.courseId} className="rounded-lg border p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{course.courseName}</h2>
                  <p className="text-sm text-gray-600">
                    {courseDueCount} card{courseDueCount !== 1 ? 's' : ''} due
                  </p>
                </div>
                <Link
                  href={`/study?courseId=${course.courseId}`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Study Course
                </Link>
              </div>

              <div className="grid gap-3">
                {course.decks.map((deck) => {
                  const deckDueCount = deck.cards.reduce((s, c) => s + c.cardProgresses.length, 0)

                  return (
                    <Link
                      key={deck.id}
                      href={`/study?deckId=${deck.id}`}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                    >
                      <div>
                        <h3 className="font-medium">{deck.name}</h3>
                        <p className="text-sm text-gray-500">{deck._count.cards} cards total</p>
                      </div>
                      {deckDueCount > 0 && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                          {deckDueCount} due
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
