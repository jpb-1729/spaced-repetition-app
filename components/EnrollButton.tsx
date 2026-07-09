// app/decks/enroll-button.tsx
'use client'

import { useState } from 'react'
import { enrollInDeck } from '@/actions/enrollment'
import { Button } from '@/components/ui/button'

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
      <Button disabled variant="success">
        Enrolled
      </Button>
    )
  }

  return (
    <Button onClick={handleEnroll} disabled={loading}>
      {loading ? 'Enrolling...' : 'Enroll'}
    </Button>
  )
}
