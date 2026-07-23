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
  {
    rating: Rating.AGAIN,
    fsrs: FSRSRating.Again,
    label: 'Again',
    className: 'bg-danger text-danger-foreground',
  },
  {
    rating: Rating.HARD,
    fsrs: FSRSRating.Hard,
    label: 'Hard',
    className: 'bg-warn text-warn-foreground',
  },
  {
    rating: Rating.GOOD,
    fsrs: FSRSRating.Good,
    label: 'Good',
    className: 'bg-success text-success-foreground',
  },
  {
    rating: Rating.EASY,
    fsrs: FSRSRating.Easy,
    label: 'Easy',
    className: 'bg-info text-info-foreground',
  },
] as const

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
      const clientReviewId = crypto.randomUUID()
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
      <div className="text-subtle-foreground mb-6 flex items-baseline justify-between font-mono text-sm">
        <span className="truncate">
          {currentCard.card.deck.course.name} / {currentCard.card.deck.name}
        </span>
        <span className="shrink-0 tabular-nums">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      <div
        data-testid="card-container"
        style={{ minHeight: '480px' }}
        className="brutal-border brutal-shadow-sm bg-card flex flex-col justify-start p-6 sm:p-6"
      >
        <div className="text-subtle-foreground mb-3 text-[0.7rem] font-bold tracking-[0.2em] uppercase">
          Question
        </div>
        <div className="text-foreground text-2xl leading-snug font-semibold text-balance">
          {currentCard.card.front}
        </div>

        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="brutal-btn brutal-btn-hover bg-info text-info-foreground mt-8 self-center px-6 py-3"
          >
            Show Answer
          </button>
        ) : (
          <div className="animate-fade-in-up border-border mt-8 border-t-[3px] pt-8">
            <div className="text-subtle-foreground mb-3 text-[0.7rem] font-bold tracking-[0.2em] uppercase">
              Answer
            </div>
            <div className="text-foreground text-2xl leading-snug font-semibold text-balance">
              {currentCard.card.back}
            </div>

            {currentCard.card.notes && (
              <div className="text-muted-foreground border-border bg-muted mt-6 border-l-[3px] px-4 py-3 text-sm leading-relaxed">
                {currentCard.card.notes}
              </div>
            )}

            <div className="mt-8 grid grid-cols-4 gap-2">
              {ratingButtons.map(({ rating, label, className }) => (
                <button
                  key={rating}
                  onClick={() => handleRating(rating)}
                  disabled={loading}
                  className={`brutal-btn brutal-btn-hover ${className} py-3 text-sm disabled:opacity-50`}
                >
                  <span className="block">{label}</span>
                  <span className="block font-mono text-xs opacity-75">{previews?.[rating]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
