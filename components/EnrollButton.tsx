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
    } catch {
      alert('Failed to enroll')
    } finally {
      setLoading(false)
    }
  }

  if (enrolled) {
    return <span className="label border border-moss/40 px-4 py-2.5 text-moss">Enrolled</span>
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="label cursor-pointer border border-ink px-4 py-2.5 text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
    >
      {loading ? 'Enrolling…' : 'Enroll'}
    </button>
  )
}
