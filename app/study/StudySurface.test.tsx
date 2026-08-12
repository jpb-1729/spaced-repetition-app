import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StudySurface } from './StudySurface'
import type { DeckInfo, QueueCard } from '@/lib/study'

const NOW = new Date('2026-08-11T12:00:00Z').getTime()

const deck: DeckInfo = {
  id: 'd1',
  name: 'Memory',
  courseId: 'c1',
  courseName: 'Cognitive Science',
  index: '01',
  cardsPerSession: 12,
}

const card: QueueCard = {
  progressId: 'p1',
  cardId: 'card1',
  deckId: 'd1',
  front: 'What is the testing effect?',
  back: 'Retrieval practice strengthens memory more than restudying.',
  notes: null,
  state: 'REVIEW',
  due: NOW - 1000,
  stability: 5,
  difficulty: 5.2,
  scheduledDays: 3,
  reps: 2,
  lapses: 0,
  lastReviewedAt: NOW - 3 * 86_400_000,
  learningSteps: 0,
}

function renderSurface(revealed: boolean) {
  return render(
    <StudySurface
      card={card}
      deck={deck}
      revealed={revealed}
      onReveal={vi.fn()}
      onGrade={vi.fn()}
      position={0}
      total={4}
      complete={false}
      onRestart={vi.fn()}
      onNextDeck={vi.fn()}
      summary={{ reviewed: 0, again: 0, accuracy: 0, elapsed: 0 }}
      now={new Date(NOW)}
      failedCount={0}
      onRetryFailed={vi.fn()}
    />
  )
}

describe('StudySurface', () => {
  it('hides the answer until revealed', () => {
    renderSurface(false)

    expect(screen.getByText(card.front)).toBeInTheDocument()
    expect(screen.queryByText(card.back)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reveal answer/i })).toBeInTheDocument()
  })

  it('shows the answer when revealed', () => {
    renderSurface(true)

    expect(screen.getByText(card.back)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /reveal answer/i })).not.toBeInTheDocument()
  })

  it('invokes onReveal when the reveal bar is clicked', async () => {
    const onReveal = vi.fn()
    render(
      <StudySurface
        card={card}
        deck={deck}
        revealed={false}
        onReveal={onReveal}
        onGrade={vi.fn()}
        position={0}
        total={4}
        complete={false}
        onRestart={vi.fn()}
        onNextDeck={vi.fn()}
        summary={{ reviewed: 0, again: 0, accuracy: 0, elapsed: 0 }}
        now={new Date(NOW)}
        failedCount={0}
        onRetryFailed={vi.fn()}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /reveal answer/i }))
    expect(onReveal).toHaveBeenCalledOnce()
  })

  it('animates the answer reveal', () => {
    const { container } = renderSurface(true)

    const fadeWrapper = container.querySelector('.anim-fade')
    expect(fadeWrapper).not.toBeNull()
    expect(fadeWrapper!.textContent).toContain(card.back)
  })

  it('keeps the question markup identical across reveal (no layout jump)', () => {
    const { unmount } = renderSurface(false)
    const before = screen.getByText(card.front).className
    unmount()

    renderSurface(true)
    const after = screen.getByText(card.front).className
    expect(after).toBe(before)
  })

  it('keeps grade buttons inert until revealed', () => {
    renderSurface(false)

    for (const label of ['Again', 'Hard', 'Good', 'Easy']) {
      expect(screen.getByRole('button', { name: new RegExp(label) })).toBeDisabled()
    }
  })

  it('scrolls overflow inside the card region without scrollbar chrome', () => {
    const { container } = renderSurface(false)

    const scrollRegion = container.querySelector('article .hide-scroll')
    expect(scrollRegion).not.toBeNull()
    expect(scrollRegion!.className).toContain('overflow-y-auto')
  })
})
