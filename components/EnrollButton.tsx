'use client'

import { useState } from 'react'
import { enrollInDeck } from '@/actions/enrollment'

interface EnrollButtonProps {
  courseId: string
  deckId: string
  deckName: string
  isEnrolled?: boolean
}

export function EnrollButton({
  courseId,
  deckId,
  deckName,
  isEnrolled = false,
}: EnrollButtonProps) {
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
    return (
      <span className="border-rule-2 text-ink-soft inline-flex h-[34px] items-center gap-2 rounded border px-3 text-[13px] font-semibold whitespace-nowrap">
        <span className="bg-good size-2 rounded-full" aria-hidden />
        Enrolled
      </span>
    )
  }

  return (
    <button onClick={handleEnroll} disabled={loading} className="btn h-[34px] px-3 text-[13px]">
      {loading ? 'Enrolling…' : 'Enroll'}
    </button>
  )
}
