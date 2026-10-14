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

vi.mock('@/actions/suspend-card', () => ({
  suspendCard: vi.fn().mockResolvedValue({ success: true }),
  restoreCard: vi.fn().mockResolvedValue({ success: true }),
}))

import { reviewCard } from '@/actions/review-card'
import { suspendCard, restoreCard } from '@/actions/suspend-card'
const mockedReviewCard = vi.mocked(reviewCard)
const mockedSuspendCard = vi.mocked(suspendCard)
const mockedRestoreCard = vi.mocked(restoreCard)

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
    suspended: [],
  }
}

function renderBriefing(data: StudyDashboardData = makeData()) {
  return render(
    <StudyDashboard data={data} initialDeckId="d1" signOutAction={vi.fn(async () => {})} />
  )
}

/** Render and press Enter on the briefing so the first card is showing. */
function renderDashboard() {
  const r = renderBriefing()
  fireEvent.keyDown(window, { key: 'Enter' })
  return r
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
  mockedSuspendCard.mockClear()
  mockedRestoreCard.mockClear()
})

describe('StudyDashboard briefing', () => {
  it('opens on a briefing with no card showing and does not grade or reveal', () => {
    renderBriefing()

    expect(screen.getByText(/session ready/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /4 cards are waiting in Memory/ }))
    expect(screen.queryByRole('heading', { level: 2, name: 'Alpha question' })).toBeNull()
    expect(screen.queryByText('Answer to Alpha question')).toBeNull()

    pressGrade('3')
    expect(mockedReviewCard).not.toHaveBeenCalled()
  })

  it('starts the session from the Begin button', async () => {
    renderBriefing()

    await userEvent.click(screen.getByRole('button', { name: /begin session/i }))
    expectPrompt('Alpha question')
  })

  it('starts the session with Space as well as Enter', () => {
    renderBriefing()
    fireEvent.keyDown(window, { key: ' ' })
    expectPrompt('Alpha question')
    // The first Space only began the session; the answer is still hidden.
    expect(screen.queryByText('Answer to Alpha question')).toBeNull()
  })

  it('switching decks while briefing updates the briefing without starting', async () => {
    renderBriefing()

    await userEvent.click(screen.getByRole('button', { name: /typography/i }))
    expect(screen.getByRole('heading', { level: 2, name: /2 cards are waiting in Typography/ }))
    expect(screen.queryByRole('heading', { level: 2, name: 'Omega question' })).toBeNull()

    fireEvent.keyDown(window, { key: 'Enter' })
    expectPrompt('Omega question')
  })

  it('reports the session size after the limit stepper changes', async () => {
    renderBriefing()
    // d1 has 4 due cards and a limit of 4; raising the limit cannot exceed the pool.
    await userEvent.click(screen.getByRole('button', { name: 'increase' }))
    expect(
      screen.getByText(
        (_, el) => el?.tagName === 'P' && /covers 4 of them/.test(el.textContent ?? '')
      )
    ).toBeInTheDocument()
  })

  it('offers to study ahead when nothing is due', () => {
    const data = makeData()
    data.snapshot = data.snapshot.map((r) => ({ ...r, due: NOW + 2 * DAY }))
    renderBriefing(data)

    expect(screen.getByText(/nothing due/i)).toBeInTheDocument()
    expect(screen.getByText(/next card comes due in 2 d/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /study ahead/i }))
    expectPrompt('Alpha question')
  })

  it('skips the briefing when autoStart is set', () => {
    render(
      <StudyDashboard
        data={makeData()}
        initialDeckId="d2"
        autoStart
        signOutAction={vi.fn(async () => {})}
      />
    )
    expectPrompt('Omega question')
  })
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

  it('suspends the current card with S, before reveal, and moves on', async () => {
    renderDashboard()

    expectPrompt('Alpha question')
    fireEvent.keyDown(window, { key: 's' })

    expectPrompt('Beta question')
    expect(screen.getByText(/left in queue/)).toHaveTextContent('3 left in queue')
    await waitFor(() => expect(mockedSuspendCard).toHaveBeenCalledWith('pd11'))
    expect(mockedReviewCard).not.toHaveBeenCalled()
  })

  it('suspending a requeued AGAIN card removes both copies without skipping', async () => {
    renderDashboard()

    // Alpha is graded AGAIN and requeued at the end: [A, B, C, D, A]
    reveal()
    pressGrade('1')
    expectPrompt('Beta question')
    reveal()
    pressGrade('3')
    expectPrompt('Gamma question')

    // Suspend Gamma mid-session; Delta must follow, not be skipped.
    fireEvent.keyDown(window, { key: 's' })
    expectPrompt('Delta question')
    reveal()
    pressGrade('3')

    // Alpha's requeued copy is still there; suspend it now that it's current.
    expectPrompt('Alpha question')
    fireEvent.keyDown(window, { key: 's' })
    expect(screen.getByText(/session complete/i)).toBeInTheDocument()

    await waitFor(() => expect(mockedSuspendCard).toHaveBeenCalledTimes(2))
    expect(mockedSuspendCard.mock.calls.map((c) => c[0])).toEqual(['pd13', 'pd11'])
  })

  it('lists a suspended card under the active deck and restores it', async () => {
    renderDashboard()

    expect(screen.queryByRole('heading', { name: /suspended/i })).not.toBeInTheDocument()
    fireEvent.keyDown(window, { key: 's' })

    const section = screen.getByRole('region', { name: /suspended/i })
    expect(within(section).getByText('Alpha question')).toBeInTheDocument()
    expect(within(section).getByText(/1 card$/)).toBeInTheDocument()

    await userEvent.click(within(section).getByRole('button', { name: /restore/i }))
    expect(screen.queryByRole('region', { name: /suspended/i })).not.toBeInTheDocument()
    await waitFor(() => expect(mockedRestoreCard).toHaveBeenCalledWith('pd11'))
  })

  it('only shows suspended cards belonging to the active deck', async () => {
    const data = makeData()
    data.suspended = [
      { progressId: 'pd19', deckId: 'd1', front: 'Shelved alpha' },
      { progressId: 'pd29', deckId: 'd2', front: 'Shelved omega' },
    ]
    renderBriefing(data)

    const section = screen.getByRole('region', { name: /suspended/i })
    expect(within(section).getByText('Shelved alpha')).toBeInTheDocument()
    expect(within(section).queryByText('Shelved omega')).not.toBeInTheDocument()
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
