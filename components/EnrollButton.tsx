// app/decks/enroll-button.tsx
'use client'

import { useState } from 'react'
import { enrollInDeck } from '@/actions/enrollment'

interface EnrollButtonProps {
  courseId: string
  deckId: string
  deckName: string
}

export function EnrollButton({ courseId, deckId, deckName }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false)
  const [enrolled, setEnrolled] = useState(false)

  async function handleEnroll() {
    setLoading(true)
    try {
      const result = await enrollInDeck(courseId, deckName)

      if (result.error) {
        alert(result.error)
      } else {
        setEnrolled(true)
        // Optional: redirect to study page
        // window.location.href = `/study/${deckId}`
      }
    } catch (error) {
      alert('Failed to enroll')
    } finally {
      setLoading(false)
    }
  }

  if (enrolled) {
    return (
      <button disabled className="rounded-lg bg-green-500 px-4 py-2 text-white">
        ✓ Enrolled
      </button>
    )
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
    >
      {loading ? 'Enrolling...' : 'Enroll'}
    </button>
  )
}
