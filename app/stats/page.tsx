// app/my-cards/page.tsx (simpler version)
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function MyCardsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const cardProgresses = await prisma.cardProgress.findMany({
    where: {
      userId: session.user.id,
      suspended: false,
    },
    include: {
      card: {
        include: {
          deck: {
            include: {
              course: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
    orderBy: { due: 'asc' },
  })

  const now = new Date()

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-3xl font-bold">My Active Cards</h1>

      <div className="mb-6 grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="text-2xl font-bold">{cardProgresses.length}</div>
          <div className="text-sm text-gray-600">Total Cards</div>
        </div>
        <div className="rounded-lg bg-red-50 p-4">
          <div className="text-2xl font-bold text-red-600">
            {cardProgresses.filter((p) => p.due <= now).length}
          </div>
          <div className="text-sm text-gray-600">Due Now</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <div className="text-2xl font-bold text-green-600">
            {cardProgresses.filter((p) => p.state === 'REVIEW').length}
          </div>
          <div className="text-sm text-gray-600">In Review</div>
        </div>
      </div>

      {cardProgresses.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-16 text-center">
          <p className="mb-4 text-gray-600">No active cards. Enroll in a deck to get started!</p>
          <a
            href="/decks"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Browse Decks
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {cardProgresses.map((progress) => {
            const isDue = progress.due <= now
            const daysUntilDue = Math.ceil(
              (progress.due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            )

            return (
              <div
                key={progress.id}
                className={`rounded-lg border p-4 ${
                  isDue ? 'border-yellow-300 bg-yellow-50' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-1 text-xs text-gray-500">
                      {progress.card.deck.course.name} → {progress.card.deck.name}
                    </div>
                    <div className="mb-1 text-lg font-medium">{progress.card.front}</div>
                    <div className="text-gray-600">{progress.card.back}</div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        progress.state === 'NEW'
                          ? 'bg-blue-100 text-blue-800'
                          : progress.state === 'LEARNING'
                            ? 'bg-purple-100 text-purple-800'
                            : progress.state === 'REVIEW'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {progress.state}
                    </span>

                    <div className="mt-2 text-sm">
                      {isDue ? (
                        <span className="font-semibold text-red-600">Due now!</span>
                      ) : daysUntilDue <= 0 ? (
                        <span className="text-red-600">Overdue</span>
                      ) : (
                        <span className="text-gray-600">Due in {daysUntilDue}d</span>
                      )}
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      {progress.reps} reps · {progress.lapses} lapses
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
