import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
        cardCount: 4,
        enrolled: true,
      },
      {
        id: 'd2',
        name: 'Typography',
        courseId: 'c2',
        courseName: 'Design History',
        index: '02',
        cardsPerSession: 4,
        cardCount: 4,
        enrolled: true,
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

  it('opens a deep link on the briefing when its session would be empty', () => {
    const data = makeData()
    data.decks[1] = { ...data.decks[1], enrolled: false }
    data.snapshot = data.snapshot.filter((r) => r.deckId !== 'd2')
    data.queues.d2 = []
    render(
      <StudyDashboard
        data={data}
        initialDeckId="d2"
        autoStart
        signOutAction={vi.fn(async () => {})}
      />
    )
    expect(screen.getByText(/not enrolled/i)).toBeInTheDocument()
    expect(screen.queryByText(/session complete/i)).toBeNull()
  })

  it('says when every card in an enrolled deck is suspended', () => {
    const data = makeData()
    data.snapshot = data.snapshot.filter((r) => r.deckId !== 'd2')
    data.queues.d2 = []
    data.suspended = [
      { progressId: 'pd21', deckId: 'd2', front: 'Omega question' },
      { progressId: 'pd22', deckId: 'd2', front: 'Sigma question' },
    ]
    render(<StudyDashboard data={data} initialDeckId="d2" signOutAction={vi.fn(async () => {})} />)
    expect(screen.getByText(/all suspended/i)).toBeInTheDocument()
    expect(screen.queryByText(/not enrolled/i)).toBeNull()
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

  it('stops the session clock once the session is complete', async () => {
    vi.useFakeTimers()
    try {
      renderDashboard()
      act(() => vi.advanceTimersByTime(3000))
      expect(screen.getAllByText('00:03').length).toBeGreaterThan(0)

      for (const front of ['Alpha question', 'Beta question', 'Gamma question', 'Delta question']) {
        expectPrompt(front)
        reveal()
        pressGrade('3')
      }
      expect(screen.getByText(/session complete/i)).toBeInTheDocument()

      act(() => vi.advanceTimersByTime(60_000))
      expect(screen.getAllByText('00:03').length).toBeGreaterThan(0)
      expect(screen.queryByText('01:03')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
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

  it("switching decks lands on that deck's briefing", async () => {
    renderDashboard()

    await userEvent.click(screen.getByRole('button', { name: /typography/i }))

    expect(screen.getByRole('heading', { level: 2, name: /2 cards are waiting in Typography/ }))
    const activeDeckButton = screen.getByRole('button', { name: /typography/i })
    expect(activeDeckButton.className).toContain('bg-paper-2')

    fireEvent.keyDown(window, { key: 'Enter' })
    expectPrompt('Omega question')
  })

  it('returns to the briefing with Done after the session completes', async () => {
    renderDashboard()
    for (const front of ['Alpha question', 'Beta question', 'Gamma question', 'Delta question']) {
      expectPrompt(front)
      reveal()
      pressGrade('3')
    }
    expect(screen.getByText(/session complete/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next collection|study again/i })).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Done' }))
    // Everything was just graded, so the briefing offers to study ahead
    // (with its warning) rather than silently starting another session.
    expect(screen.getByText(/nothing due/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /study ahead/i })).toBeInTheDocument()
  })

  it('caps unseen cards with the new-card limit, keeping reviews first', async () => {
    const reviews = [qc(1, 'd1', 'Review one'), qc(2, 'd1', 'Review two')]
    const unseen = Array.from({ length: 12 }, (_, i) => ({
      ...qc(i + 3, 'd1', `New ${i + 1}`),
      state: 'NEW' as const,
      reps: 0,
      stability: 0,
      lastReviewedAt: null,
      due: NOW - DAY + i * 1000,
    }))
    const data = makeData()
    data.decks[0].cardsPerSession = 20
    data.snapshot = [...reviews, ...unseen, ...deckTwoCards]
    data.queues.d1 = [...reviews, ...unseen]
    renderBriefing(data)

    // Defaults follow cardsPerSession: all 12 unseen fit under 20.
    expect(screen.getByText('This session').previousSibling).toHaveTextContent('14')

    // 20 -> 10 new cards
    await userEvent.click(screen.getByRole('button', { name: 'fewer new cards' }))
    await userEvent.click(screen.getByRole('button', { name: 'fewer new cards' }))
    expect(screen.getByText('This session').previousSibling).toHaveTextContent('12')
    expect(screen.getByText('New this session').previousSibling).toHaveTextContent('10/12')

    // Reviews still lead the queue.
    fireEvent.keyDown(window, { key: 'Enter' })
    expectPrompt('Review one')
  })

  it('disables Begin when only unseen cards are due and the new-card limit is 0', async () => {
    const data = makeData()
    data.snapshot = data.snapshot.map((r) => (r.deckId === 'd1' ? { ...r, state: 'NEW' } : r))
    data.queues.d1 = data.queues.d1.map((r) => ({ ...r, state: 'NEW' }))
    renderBriefing(data)

    // cardsPerSession 4 -> new limit 5; one step reaches 0
    await userEvent.click(screen.getByRole('button', { name: 'fewer new cards' }))
    expect(screen.getByRole('button', { name: /begin session/i })).toBeDisabled()
    expect(screen.getByText(/new-card limit is set to 0/i)).toBeInTheDocument()

    // The keyboard shortcut must not bypass the disabled button.
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(screen.queryByText(/session complete/i)).toBeNull()
    expect(screen.getByRole('button', { name: /begin session/i })).toBeInTheDocument()
  })

  it('explains an unenrolled deck and ignores Enter instead of completing an empty session', () => {
    const data = makeData()
    data.decks.push({
      id: 'd3',
      name: 'Chapter 3',
      courseId: 'c1',
      courseName: 'Cognitive Science',
      index: '03',
      cardsPerSession: 20,
      cardCount: 19,
      enrolled: false,
    })
    data.queues.d3 = []
    render(<StudyDashboard data={data} initialDeckId="d3" signOutAction={vi.fn(async () => {})} />)

    expect(screen.getByText(/not enrolled/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /enroll on the decks page/i })).toHaveAttribute(
      'href',
      '/decks'
    )
    expect(screen.getByRole('button', { name: /begin session/i })).toBeDisabled()

    fireEvent.keyDown(window, { key: 'Enter' })
    expect(screen.getByRole('button', { name: /begin session/i })).toBeInTheDocument()
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
