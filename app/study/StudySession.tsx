// app/study/study-session.tsx
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { reviewCard } from '@/actions/review-card'
import { Rating, Prisma } from '@prisma/client'
import { fsrs, Rating as FSRSRating, State, type Card as FSRSCard } from 'ts-fsrs'
import { Card } from '@/components/ui/card'
import { Sticker } from '@/components/ui/sticker'
import { Button, type ButtonProps } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

type StudyCard = Prisma.CardProgressGetPayload<{
  select: {
    id: true
    state: true
    due: true
    stability: true
    difficulty: true
    scheduledDays: true
    reps: true
    lapses: true
    lastReviewedAt: true
    learningSteps: true
    card: {
      select: {
        front: true
        back: true
        notes: true
        deck: {
          select: {
            name: true
            course: { select: { name: true } }
          }
        }
      }
    }
  }
}>

interface StudySessionProps {
  cards: StudyCard[]
}

const stateMap = {
  NEW: State.New,
  LEARNING: State.Learning,
  REVIEW: State.Review,
  RELEARNING: State.Relearning,
} as const

const ratingButtons: {
  rating: Rating
  fsrs: FSRSRating
  label: string
  variant: NonNullable<ButtonProps['variant']>
}[] = [
  { rating: Rating.AGAIN, fsrs: FSRSRating.Again, label: 'Again', variant: 'destructive' },
  { rating: Rating.HARD, fsrs: FSRSRating.Hard, label: 'Hard', variant: 'warning' },
  { rating: Rating.GOOD, fsrs: FSRSRating.Good, label: 'Good', variant: 'success' },
  { rating: Rating.EASY, fsrs: FSRSRating.Easy, label: 'Easy', variant: 'info' },
]

function formatDueInterval(due: Date, now: Date): string {
  const diffMs = due.getTime() - now.getTime()

  if (diffMs < 60_000) return '<1 minute'

  const minutes = Math.round(diffMs / 60_000)
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`

  const hours = Math.round(diffMs / 3_600_000)
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`

  const days = Math.round(diffMs / 86_400_000)
  return `${days} ${days === 1 ? 'day' : 'days'}`
}

function computePreviews(card: StudyCard) {
  const now = new Date()
  const last = card.lastReviewedAt ? new Date(card.lastReviewedAt) : null
  const elapsedDays = last
    ? Math.max(0, Math.floor((now.getTime() - last.getTime()) / 86_400_000))
    : 0

  const fsrsCard: FSRSCard = {
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: elapsedDays,
    scheduled_days: card.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    state: stateMap[card.state],
    last_review: last ?? undefined,
    learning_steps: card.learningSteps,
  }

  const f = fsrs()
  const scheduling = f.repeat(fsrsCard, now)

  return {
    [Rating.AGAIN]: formatDueInterval(scheduling[FSRSRating.Again].card.due, now),
    [Rating.HARD]: formatDueInterval(scheduling[FSRSRating.Hard].card.due, now),
    [Rating.GOOD]: formatDueInterval(scheduling[FSRSRating.Good].card.due, now),
    [Rating.EASY]: formatDueInterval(scheduling[FSRSRating.Easy].card.due, now),
  }
}

export function StudySession({ cards }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentCard = currentIndex < cards.length ? cards[currentIndex] : null

  const previews = useMemo(() => {
    if (!currentCard) return null
    return computePreviews(currentCard)
  }, [currentCard])

  if (!currentCard) {
    return (
      <div className="mx-auto max-w-2xl py-16">
        <Card className="bg-success animate-pop relative p-10 text-center shadow-[8px_8px_0px_hsl(var(--shadow-color))]">
          <Sticker
            size="sm"
            rotation="medium"
            className="absolute -top-4 -left-3"
          >
            ★ Nice ★
          </Sticker>
          <h2 className="text-success-foreground text-4xl font-black uppercase sm:text-5xl">
            Session Complete!
          </h2>
          <p className="text-success-foreground mt-4 text-lg font-bold">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'} reviewed. Your future self says
            thanks.
          </p>
          <Button asChild variant="outline" size="lg" className="mt-8">
            <Link href="/view_decks">Back to Decks</Link>
          </Button>
        </Card>
      </div>
    )
  }

  async function handleRating(rating: Rating) {
    setLoading(true)
    setError(null)
    try {
      const clientReviewId = crypto.randomUUID()
      const result = await reviewCard(currentCard!.id, rating, clientReviewId)

      if (result.error) {
        setError(result.error)
        return
      }

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowAnswer(false)
      } else {
        setCurrentIndex(cards.length)
      }
    } catch {
      setError('Failed to record review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <span className="border-3 border-foreground bg-card text-foreground shadow-[2px_2px_0px_hsl(var(--shadow-color))] truncate px-3 py-1 font-mono text-xs font-bold tracking-wider uppercase">
            {currentCard.card.deck.course.name} / {currentCard.card.deck.name}
          </span>
          <span className="text-foreground shrink-0 font-mono text-sm font-bold tabular-nums">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
        <Progress value={(currentIndex / cards.length) * 100} />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription className="font-bold uppercase">{error}</AlertDescription>
        </Alert>
      )}

      <Card
        data-testid="card-container"
        style={{ minHeight: '480px' }}
        className="relative flex flex-col justify-start p-6 pt-8 shadow-[8px_8px_0px_hsl(var(--accent))] sm:p-8"
      >
        <Sticker size="sm" rotation="slight" className="absolute -top-4 left-6">
          Question
        </Sticker>
        <div className="text-foreground text-2xl leading-snug font-bold text-balance sm:text-3xl">
          {currentCard.card.front}
        </div>

        {!showAnswer ? (
          <Button
            onClick={() => setShowAnswer(true)}
            variant="info"
            size="xl"
            className="mt-10 self-center"
          >
            Show Answer
          </Button>
        ) : (
          <div className="animate-fade-in-up border-foreground mt-8 border-t-[3px] pt-6">
            <Sticker size="sm" rotation="slight-right" variant="success" className="mb-4">
              Answer
            </Sticker>
            <div className="text-foreground text-2xl leading-snug font-bold text-balance sm:text-3xl">
              {currentCard.card.back}
            </div>

            {currentCard.card.notes && (
              <div className="text-muted-foreground border-foreground bg-muted mt-6 border-l-[3px] px-4 py-3 text-sm leading-relaxed">
                {currentCard.card.notes}
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ratingButtons.map(({ rating, label, variant }) => (
                <Button
                  key={rating}
                  onClick={() => handleRating(rating)}
                  disabled={loading}
                  variant={variant}
                  size="lg"
                  className="h-auto flex-col py-4 text-sm"
                >
                  <span className="block">{label}</span>
                  <span className="block font-mono text-xs opacity-75">{previews?.[rating]}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
