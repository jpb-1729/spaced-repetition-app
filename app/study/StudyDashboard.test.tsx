import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StudyDashboard } from './StudyDashboard'
import type { QueueCard, StudyDashboardData } from '@/lib/study'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/actions/review-card', () => ({
  reviewCard: vi.fn().mockResolvedValue({ success: true }),
}))

import { reviewCard } from '@/actions/review-card'
const mockedReviewCard = vi.mocked(reviewCard)

const NOW = new Date('2026-08-11T12:00:00Z').getTime()
const DAY = 86_400_000

function qc(n: number, deckId: string, front: string): QueueCard {
  return {
    progressId: `p${deckId}${n}`,
    cardId: `c${deckId}${n}`,
    deckId,
    front,
    back: `Answer to ${front}`,
    notes: null,
    state: 'REVIEW',
    due: NOW - (10 - n) * 1000, // all due, ordered
    stability: 5,
    difficulty: 5,
    scheduledDays: 3,
    reps: 2,
    lapses: 0,
    lastReviewedAt: NOW - 3 * DAY,
    learningSteps: 0,
  }
}

const deckOneCards = [
  qc(1, 'd1', 'Alpha question'),
  qc(2, 'd1', 'Beta question'),
  qc(3, 'd1', 'Gamma question'),
  qc(4, 'd1', 'Delta question'),
]
const deckTwoCards = [qc(1, 'd2', 'Omega question'), qc(2, 'd2', 'Sigma question')]

function makeData(): StudyDashboardData {
  return {
    serverNow: NOW,
    decks: [
      {
        id: 'd1',
        name: 'Memory',
        courseId: 'c1',
        courseName: 'Cognitive Science',
        index: '01',
        cardsPerSession: 4,
      },
      {
        id: 'd2',
        name: 'Typography',
        courseId: 'c2',
        courseName: 'Design History',
        index: '02',
        cardsPerSession: 4,
      },
    ],
    snapshot: [...deckOneCards, ...deckTwoCards],
    queues: { d1: deckOneCards, d2: deckTwoCards },
    recentReviews: [],
    latestLog: [],
    totalReviews: 0,
    isAdmin: false,
  }
}

function renderDashboard() {
  return render(
    <StudyDashboard data={makeData()} initialDeckId="d1" signOutAction={vi.fn(async () => {})} />
  )
}

function reveal() {
  fireEvent.keyDown(window, { key: ' ' })
}

function pressGrade(key: string) {
  fireEvent.keyDown(window, { key })
}

/** The current card's prompt is the only level-2 heading in the study surface. */
function expectPrompt(front: string) {
  expect(screen.getByRole('heading', { level: 2, name: front })).toBeInTheDocument()
}

beforeEach(() => {
  mockedReviewCard.mockClear()
})

describe('StudyDashboard', () => {
  it('reveals with Space and grades with 1-4 only after reveal', async () => {
    renderDashboard()

    expectPrompt('Alpha question')
    expect(screen.queryByText('Answer to Alpha question')).not.toBeInTheDocument()

    // Grading before reveal is a no-op
    pressGrade('3')
    expectPrompt('Alpha question')
    expect(mockedReviewCard).not.toHaveBeenCalled()

    reveal()
    expect(screen.getByText('Answer to Alpha question')).toBeInTheDocument()

    pressGrade('3')
    expectPrompt('Beta question')
    await waitFor(() => expect(mockedReviewCard).toHaveBeenCalledTimes(1))
    expect(mockedReviewCard).toHaveBeenCalledWith('pd11', 'GOOD', expect.any(String))
  })

  it('requeues an AGAIN card to the end of the session', async () => {
    renderDashboard()

    // Grade Alpha as AGAIN, the rest as GOOD
    reveal()
    pressGrade('1')
    for (const front of ['Beta question', 'Gamma question', 'Delta question']) {
      expectPrompt(front)
      reveal()
      pressGrade('3')
    }

    // Alpha comes back at the end of the queue
    expectPrompt('Alpha question')
    reveal()
    pressGrade('3')

    expect(screen.getByText(/session complete/i)).toBeInTheDocument()
    await waitFor(() => expect(mockedReviewCard).toHaveBeenCalledTimes(5))
  })

  it('uses a fresh clientReviewId per submitted review', async () => {
    renderDashboard()

    reveal()
    pressGrade('3')
    reveal()
    pressGrade('3')

    await waitFor(() => expect(mockedReviewCard).toHaveBeenCalledTimes(2))
    const [firstId, secondId] = mockedReviewCard.mock.calls.map((c) => c[2])
    expect(firstId).not.toBe(secondId)
  })

  it('switches decks and rebuilds the queue', async () => {
    renderDashboard()

    await userEvent.click(screen.getByRole('button', { name: /typography/i }))

    expectPrompt('Omega question')
    const activeDeckButton = screen.getByRole('button', { name: /typography/i })
    expect(activeDeckButton.className).toContain('bg-paper-2')
  })

  it('clamps the session limit stepper to 4..40', async () => {
    renderDashboard()

    const stepper = screen.getByRole('button', { name: 'decrease' }).parentElement!

    // cardsPerSession 4 -> initial limit 4; decrease stays at the floor
    await userEvent.click(screen.getByRole('button', { name: 'decrease' }))
    expect(within(stepper).getByText('4')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'increase' }))
    expect(within(stepper).getByText('8')).toBeInTheDocument()
  })
})
