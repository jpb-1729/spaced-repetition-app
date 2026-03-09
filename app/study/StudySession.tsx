// app/study/study-session.tsx
'use client'

import { useState } from 'react'
import { reviewCard } from '@/actions/review-card'
import { Rating, Prisma } from '@prisma/client'

// Infer exactly what your Prisma query returns:
// CardProgress with Card → Deck → Course (names + card fields you use)
type StudyCard = Prisma.CardProgressGetPayload<{
  select: {
    id: true
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

export function StudySession({ cards }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!cards || cards.length === 0 || currentIndex >= cards.length) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-foreground mb-4 text-3xl font-bold uppercase">Session Complete!</h2>
        <p className="text-muted-foreground text-lg">No more cards to review.</p>
      </div>
    )
  }

  const currentCard = cards[currentIndex]

  async function handleRating(rating: Rating) {
    setLoading(true)
    try {
      const clientReviewId = `${Date.now()}-${Math.random()}`
      const result = await reviewCard(currentCard.id, rating, clientReviewId)

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
              <button
                onClick={() => handleRating(Rating.AGAIN)}
                disabled={loading}
                className="brutal-btn brutal-btn-hover bg-danger text-danger-foreground py-3 text-sm disabled:opacity-50"
              >
                Again
              </button>
              <button
                onClick={() => handleRating(Rating.HARD)}
                disabled={loading}
                className="brutal-btn brutal-btn-hover bg-warn text-warn-foreground py-3 text-sm disabled:opacity-50"
              >
                Hard
              </button>
              <button
                onClick={() => handleRating(Rating.GOOD)}
                disabled={loading}
                className="brutal-btn brutal-btn-hover bg-success text-success-foreground py-3 text-sm disabled:opacity-50"
              >
                Good
              </button>
              <button
                onClick={() => handleRating(Rating.EASY)}
                disabled={loading}
                className="brutal-btn brutal-btn-hover bg-info text-info-foreground py-3 text-sm disabled:opacity-50"
              >
                Easy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
