// app/my-cards/page.tsx
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MyCardsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/api/auth/signin')

  const cardProgresses = await prisma.cardProgress.findMany({
    where: { userId: session.user.id, suspended: false },
    include: {
      card: { include: { deck: { include: { course: { select: { name: true } } } } } },
    },
    orderBy: { due: 'asc' },
  })

  const now = new Date()

  return (
    <div className="bg-background text-foreground container mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-3xl font-bold">My Active Cards</h1>

      <div className="mb-6 grid grid-cols-3 gap-4 text-center">
        <div className="bg-info-surface rounded-lg p-4">
          <div className="text-2xl font-bold">{cardProgresses.length}</div>
          <div className="text-muted-foreground text-sm">Total Cards</div>
        </div>
        <div className="bg-danger-surface rounded-lg p-4">
          <div className="text-danger text-2xl font-bold">
            {cardProgresses.filter((p) => p.due <= now).length}
          </div>
          <div className="text-muted-foreground text-sm">Due Now</div>
        </div>
        <div className="bg-success-surface rounded-lg p-4">
          <div className="text-success text-2xl font-bold">
            {cardProgresses.filter((p) => p.state === 'REVIEW').length}
          </div>
          <div className="text-muted-foreground text-sm">In Review</div>
        </div>
      </div>

      {cardProgresses.length === 0 ? (
        <div className="bg-muted rounded-lg py-16 text-center">
          <p className="text-muted-foreground mb-4">
            No active cards. Enroll in a deck to get started!
          </p>
          <Link
            href="/decks"
            className="bg-primary text-primary-foreground hover:bg-primary-600 inline-block rounded-lg px-6 py-2"
          >
            Browse Decks
          </Link>
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
                  isDue ? 'border-warn bg-warn-surface' : 'bg-card border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-subtle-foreground mb-1 text-xs">
                      {progress.card.deck.course.name} → {progress.card.deck.name}
                    </div>
                    <div className="mb-1 text-lg font-medium">{progress.card.front}</div>
                    <div className="text-muted-foreground">{progress.card.back}</div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        progress.state === 'NEW'
                          ? 'bg-info-surface text-info-foreground'
                          : progress.state === 'LEARNING'
                            ? 'bg-accent-surface text-accent-foreground'
                            : progress.state === 'REVIEW'
                              ? 'bg-success-surface text-success-foreground'
                              : 'bg-warn-surface text-warn-foreground'
                      }`}
                    >
                      {progress.state}
                    </span>

                    <div className="mt-2 text-sm">
                      {isDue ? (
                        <span className="text-danger font-semibold">Due now!</span>
                      ) : daysUntilDue <= 0 ? (
                        <span className="text-danger">Overdue</span>
                      ) : (
                        <span className="text-muted-foreground">Due in {daysUntilDue}d</span>
                      )}
                    </div>

                    <div className="text-subtle-foreground mt-1 text-xs">
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
