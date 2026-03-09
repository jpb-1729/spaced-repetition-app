// app/decks/enroll-button.tsx
'use client'

import { useState } from 'react'
import { enrollInDeck } from '@/actions/enrollment'

interface EnrollButtonProps {
  courseId: string
  deckId: string
  deckName: string
  isEnrolled?: boolean
}

export function EnrollButton({ courseId, deckId, deckName, isEnrolled = false }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false)
  const [enrolled, setEnrolled] = useState(isEnrolled)

  async function handleEnroll() {
    setLoading(true)
    try {
      const result = await enrollInDeck(courseId, deckName)

      if (result.error) {
        alert(result.error)
      } else {
        setEnrolled(true)
      }
    } catch (error) {
      alert('Failed to enroll')
    } finally {
      setLoading(false)
    }
  }

  if (enrolled) {
    return (
      <button
        disabled
        className="brutal-btn bg-success text-success-foreground px-4 py-2"
      >
        Enrolled
      </button>
    )
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="brutal-btn brutal-btn-hover bg-primary text-primary-foreground px-4 py-2 disabled:opacity-50"
    >
      {loading ? 'Enrolling...' : 'Enroll'}
    </button>
  )
}
