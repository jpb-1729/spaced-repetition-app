// app/study/study-session.tsx
'use client'

import { useState, useMemo } from 'react'
import { reviewCard } from '@/actions/review-card'
import { Rating, Prisma } from '@prisma/client'
import { fsrs, Rating as FSRSRating, State, type Card as FSRSCard } from 'ts-fsrs'

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

const ratingButtons = [
  { rating: Rating.AGAIN, fsrs: FSRSRating.Again, label: 'Again', className: 'bg-danger text-danger-foreground' },
  { rating: Rating.HARD, fsrs: FSRSRating.Hard, label: 'Hard', className: 'bg-warn text-warn-foreground' },
  { rating: Rating.GOOD, fsrs: FSRSRating.Good, label: 'Good', className: 'bg-success text-success-foreground' },
  { rating: Rating.EASY, fsrs: FSRSRating.Easy, label: 'Easy', className: 'bg-info text-info-foreground' },
] as const

function formatDueInterval(due: Date, now: Date): string {
  const diffMs = due.getTime() - now.getTime()

  if (diffMs < 60_000) return '<1m'

  const minutes = Math.round(diffMs / 60_000)
  if (minutes < 60) return `${minutes}m`

  const hours = Math.round(diffMs / 3_600_000)
  if (hours < 24) return `${hours}h`

  const days = Math.round(diffMs / 86_400_000)
  if (days < 31) return `${days}d`

  const months = Math.round(days / 30)
  if (months < 12) return `${months}mo`

  const years = +(days / 365).toFixed(1)
  return `${years}y`
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

  const currentCard = currentIndex < cards.length ? cards[currentIndex] : null

  const previews = useMemo(() => {
    if (!currentCard) return null
    return computePreviews(currentCard)
  }, [currentCard])

  if (!currentCard) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-foreground mb-4 text-3xl font-bold uppercase">Session Complete!</h2>
        <p className="text-muted-foreground text-lg">No more cards to review.</p>
      </div>
    )
  }

  async function handleRating(rating: Rating) {
    setLoading(true)
    try {
      const clientReviewId = `${Date.now()}-${Math.random()}`
      const result = await reviewCard(currentCard!.id, rating, clientReviewId)

      if (result.error) {
        alert(result.error)
        return
      }

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowAnswer(false)
      } else {
        setCurrentIndex(cards.length)
      }
    } catch {
      alert('Failed to record review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-muted-foreground mb-4 font-mono text-sm font-bold uppercase tracking-wider">
        Card {currentIndex + 1} of {cards.length}
      </div>

      <div className="text-muted-foreground mb-2 font-mono text-sm">
        {currentCard.card.deck.course.name} &rarr; {currentCard.card.deck.name}
      </div>

      <div className="brutal-border brutal-shadow bg-card flex min-h-[300px] flex-col justify-center p-8">
        {!showAnswer ? (
          <div>
            <div className="text-muted-foreground mb-2 text-xs font-bold uppercase tracking-widest">
              Question
            </div>
            <div className="text-foreground mb-8 text-2xl font-bold">{currentCard.card.front}</div>
            <button
              onClick={() => setShowAnswer(true)}
              className="brutal-btn brutal-btn-hover bg-info text-info-foreground w-full py-3"
            >
              Show Answer
            </button>
          </div>
        ) : (
          <div>
            <div className="text-muted-foreground mb-2 text-xs font-bold uppercase tracking-widest">
              Question
            </div>
            <div className="text-foreground mb-4 text-xl font-bold">{currentCard.card.front}</div>

            <div className="text-muted-foreground mb-2 text-xs font-bold uppercase tracking-widest">
              Answer
            </div>
            <div className="text-foreground mb-8 text-2xl font-bold">{currentCard.card.back}</div>

            {currentCard.card.notes && (
              <div className="brutal-border bg-muted mb-8 p-4 text-sm">
                {currentCard.card.notes}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {ratingButtons.map(({ rating, label, className }) => (
                <button
                  key={rating}
                  onClick={() => handleRating(rating)}
                  disabled={loading}
                  className={`brutal-btn brutal-btn-hover ${className} py-3 text-sm disabled:opacity-50`}
                >
                  <span className="block font-mono text-xs opacity-75">
                    {previews?.[rating]}
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
