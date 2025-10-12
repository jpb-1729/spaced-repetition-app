// app/study/study-session.tsx
'use client'

import { useState } from 'react'
import { reviewCard } from '@/actions/review-card'
import { Rating } from '@prisma/client'

interface StudySessionProps {
  cards: any[] // Type this properly based on your Prisma query
}

export function StudySession({ cards }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(false)

  // Safety check
  if (!cards || cards.length === 0 || currentIndex >= cards.length) {
    return (
      <div className="py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold">Session Complete!</h2>
        <p className="text-gray-600">No more cards to review.</p>
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

      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowAnswer(false)
      } else {
        // Session complete - show completion
        setCurrentIndex(cards.length) // Trigger the safety check above
      }
    } catch (error) {
      alert('Failed to record review')
    } finally {
      setLoading(false)
    }
  }

  console.log(cards)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 text-sm text-gray-600">
        Card {currentIndex + 1} of {cards.length}
      </div>

      <div className="mb-2 text-sm text-gray-500">
        {currentCard.card.deck.course.name} → {currentCard.card.deck.name}
      </div>

      <div className="flex min-h-[300px] flex-col justify-center rounded-lg border bg-white p-8 shadow-lg">
        {!showAnswer ? (
          <div>
            <div className="mb-2 text-sm text-gray-500">Question</div>
            <div className="mb-8 text-2xl">{currentCard.card.front}</div>
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full rounded-lg bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Show Answer
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-2 text-sm text-gray-500">Question</div>
            <div className="mb-4 text-xl">{currentCard.card.front}</div>

            <div className="mb-2 text-sm text-gray-500">Answer</div>
            <div className="mb-8 text-2xl">{currentCard.card.back}</div>

            {currentCard.card.notes && (
              <div className="mb-8 rounded bg-gray-50 p-4 text-sm text-gray-600">
                {currentCard.card.notes}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleRating('AGAIN')}
                disabled={loading}
                className="rounded-lg bg-red-500 py-3 text-white transition-colors hover:bg-red-600 disabled:bg-gray-400"
              >
                Again
              </button>
              <button
                onClick={() => handleRating('HARD')}
                disabled={loading}
                className="rounded-lg bg-orange-500 py-3 text-white transition-colors hover:bg-orange-600 disabled:bg-gray-400"
              >
                Hard
              </button>
              <button
                onClick={() => handleRating('GOOD')}
                disabled={loading}
                className="rounded-lg bg-green-500 py-3 text-white transition-colors hover:bg-green-600 disabled:bg-gray-400"
              >
                Good
              </button>
              <button
                onClick={() => handleRating('EASY')}
                disabled={loading}
                className="rounded-lg bg-blue-500 py-3 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-400"
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
