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
      <button 
        disabled
        className="px-4 py-2 bg-green-500 text-white rounded-lg"
      >
        ✓ Enrolled
      </button>
    )
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
    >
      {loading ? 'Enrolling...' : 'Enroll'}
    </button>
  )
}