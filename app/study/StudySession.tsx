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
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Session Complete!</h2>
        <p className="text-gray-600">No more cards to review.</p>
      </div>
    )
  }

  const currentCard = cards[currentIndex]

  async function handleRating(rating: Rating) {
    setLoading(true)
    try {
      const clientReviewId = `${Date.now()}-${Math.random()}`
      
      const result = await reviewCard(
        currentCard.id,
        rating,
        clientReviewId
      )

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
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 text-sm text-gray-600">
        Card {currentIndex + 1} of {cards.length}
      </div>

      <div className="mb-2 text-sm text-gray-500">
        {currentCard.card.deck.course.name} → {currentCard.card.deck.name}
      </div>

      <div className="bg-white border rounded-lg shadow-lg p-8 min-h-[300px] flex flex-col justify-center">
        {!showAnswer ? (
          <div>
            <div className="text-sm text-gray-500 mb-2">Question</div>
            <div className="text-2xl mb-8">{currentCard.card.front}</div>
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Show Answer
            </button>
          </div>
        ) : (
          <div>
            <div className="text-sm text-gray-500 mb-2">Question</div>
            <div className="text-xl mb-4">{currentCard.card.front}</div>
            
            <div className="text-sm text-gray-500 mb-2">Answer</div>
            <div className="text-2xl mb-8">{currentCard.card.back}</div>

            {currentCard.card.notes && (
              <div className="text-sm text-gray-600 mb-8 p-4 bg-gray-50 rounded">
                {currentCard.card.notes}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleRating('AGAIN')}
                disabled={loading}
                className="py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
              >
                Again
              </button>
              <button
                onClick={() => handleRating('HARD')}
                disabled={loading}
                className="py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400"
              >
                Hard
              </button>
              <button
                onClick={() => handleRating('GOOD')}
                disabled={loading}
                className="py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
              >
                Good
              </button>
              <button
                onClick={() => handleRating('EASY')}
                disabled={loading}
                className="py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
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