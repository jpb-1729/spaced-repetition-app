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
      <h1 className="text-foreground mb-8 text-3xl font-bold uppercase">My Active Cards</h1>

      <div className="mb-6 grid grid-cols-3 gap-4 text-center">
        <div className="brutal-border brutal-shadow bg-info p-4">
          <div className="font-mono text-3xl font-bold text-white">{cardProgresses.length}</div>
          <div className="text-sm font-bold uppercase tracking-wider text-white/80">Total Cards</div>
        </div>
        <div className="brutal-border brutal-shadow bg-danger p-4">
          <div className="font-mono text-3xl font-bold text-white">
            {cardProgresses.filter((p) => p.due <= now).length}
          </div>
          <div className="text-sm font-bold uppercase tracking-wider text-white/80">Due Now</div>
        </div>
        <div className="brutal-border brutal-shadow bg-success p-4">
          <div className="font-mono text-3xl font-bold text-success-foreground">
            {cardProgresses.filter((p) => p.state === 'REVIEW').length}
          </div>
          <div className="text-success-foreground/80 text-sm font-bold uppercase tracking-wider">In Review</div>
        </div>
      </div>

      {cardProgresses.length === 0 ? (
        <div className="brutal-border brutal-shadow bg-muted py-16 text-center">
          <p className="text-muted-foreground mb-4 text-lg">
            No active cards. Enroll in a deck to get started!
          </p>
          <Link
            href="/decks"
            className="brutal-btn brutal-btn-hover bg-primary text-primary-foreground inline-block px-6 py-2"
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
                className={`brutal-border p-4 ${
                  isDue ? 'bg-warn/20 brutal-shadow' : 'bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-muted-foreground mb-1 font-mono text-xs uppercase tracking-wider">
                      {progress.card.deck.course.name} &rarr; {progress.card.deck.name}
                    </div>
                    <div className="text-foreground mb-1 text-lg font-bold">{progress.card.front}</div>
                    <div className="text-muted-foreground">{progress.card.back}</div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <span
                      className={`brutal-border inline-block px-3 py-1 text-xs font-bold uppercase ${
                        progress.state === 'NEW'
                          ? 'bg-info text-info-foreground'
                          : progress.state === 'LEARNING'
                            ? 'bg-accent text-accent-foreground'
                            : progress.state === 'REVIEW'
                              ? 'bg-success text-success-foreground'
                              : 'bg-warn text-warn-foreground'
                      }`}
                    >
                      {progress.state}
                    </span>

                    <div className="mt-2 text-sm font-bold">
                      {isDue ? (
                        <span className="text-danger">Due now!</span>
                      ) : daysUntilDue <= 0 ? (
                        <span className="text-danger">Overdue</span>
                      ) : (
                        <span className="text-muted-foreground">Due in {daysUntilDue}d</span>
                      )}
                    </div>

                    <div className="text-muted-foreground mt-1 font-mono text-xs">
                      {progress.reps} reps &middot; {progress.lapses} lapses
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
