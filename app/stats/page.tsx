// app/stats/page.tsx
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState, EmptyStateTitle, EmptyStateDescription, EmptyStateActions } from '@/components/ui/empty-state'
import { Layers, AlarmClock, CheckCircle2 } from 'lucide-react'

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

  const stateVariant = {
    NEW: 'info',
    LEARNING: 'accent',
    REVIEW: 'success',
    RELEARNING: 'warning',
  } as const

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="text-foreground mb-8 text-3xl font-black uppercase">My Active Cards</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Cards"
          value={cardProgresses.length}
          icon={<Layers />}
          colorScheme="info"
        />
        <StatCard
          title="Due Now"
          value={cardProgresses.filter((p) => p.due <= now).length}
          icon={<AlarmClock />}
          colorScheme="destructive"
        />
        <StatCard
          title="In Review"
          value={cardProgresses.filter((p) => p.state === 'REVIEW').length}
          icon={<CheckCircle2 />}
          colorScheme="success"
        />
      </div>

      {cardProgresses.length === 0 ? (
        <EmptyState variant="filled">
          <EmptyStateTitle>No active cards</EmptyStateTitle>
          <EmptyStateDescription>Enroll in a deck to get started!</EmptyStateDescription>
          <EmptyStateActions>
            <Button asChild>
              <Link href="/decks">Browse Decks</Link>
            </Button>
          </EmptyStateActions>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {cardProgresses.map((progress) => {
            const isDue = progress.due <= now
            const daysUntilDue = Math.ceil(
              (progress.due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            )

            return (
              <Card key={progress.id} className={isDue ? 'bg-warning/10 p-4' : 'p-4'}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-muted-foreground mb-1 font-mono text-xs uppercase tracking-wider">
                      {progress.card.deck.course.name} &rarr; {progress.card.deck.name}
                    </div>
                    <div className="text-foreground mb-1 text-lg font-bold">{progress.card.front}</div>
                    <div className="text-muted-foreground">{progress.card.back}</div>
                  </div>

                  <div className="shrink-0 text-right">
                    <Badge variant={stateVariant[progress.state]}>{progress.state}</Badge>

                    <div className="mt-2 text-sm font-bold">
                      {isDue ? (
                        <span className="text-destructive">Due now!</span>
                      ) : daysUntilDue <= 0 ? (
                        <span className="text-destructive">Overdue</span>
                      ) : (
                        <span className="text-muted-foreground">Due in {daysUntilDue}d</span>
                      )}
                    </div>

                    <div className="text-muted-foreground mt-1 font-mono text-xs">
                      {progress.reps} reps &middot; {progress.lapses} lapses
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
