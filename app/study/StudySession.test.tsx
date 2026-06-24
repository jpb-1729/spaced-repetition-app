import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StudySession } from './StudySession'

vi.mock('@/actions/review-card', () => ({
  reviewCard: vi.fn().mockResolvedValue({}),
}))

const mockCard = {
  id: 'cp-1',
  state: 'NEW' as const,
  due: new Date(),
  stability: 0,
  difficulty: 0,
  scheduledDays: 0,
  reps: 0,
  lapses: 0,
  lastReviewedAt: null,
  learningSteps: 0,
  card: {
    front: 'What is the capital of France?',
    back: 'Paris',
    notes: null,
    deck: {
      name: 'Geography',
      course: { name: 'World Facts' },
    },
  },
}

describe('StudySession answer reveal', () => {
  it('does not show the answer before clicking Show Answer', () => {
    render(<StudySession cards={[mockCard]} />)

    expect(screen.queryByText('Paris')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show answer/i })).toBeInTheDocument()
  })

  it('shows the answer after clicking Show Answer', async () => {
    render(<StudySession cards={[mockCard]} />)

    await userEvent.click(screen.getByRole('button', { name: /show answer/i }))

    expect(screen.getByText('Paris')).toBeInTheDocument()
  })

  it('applies animate-fade-in-up class to the answer section on reveal', async () => {
    render(<StudySession cards={[mockCard]} />)

    await userEvent.click(screen.getByRole('button', { name: /show answer/i }))

    // The answer text is inside the animated wrapper — walk up to find it
    const answerText = screen.getByText('Paris')
    const animatedWrapper = answerText.closest('.animate-fade-in-up')

    expect(animatedWrapper).toBeInTheDocument()
  })

  it('question remains visible before and after reveal', async () => {
    render(<StudySession cards={[mockCard]} />)

    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /show answer/i }))

    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()
  })
})
