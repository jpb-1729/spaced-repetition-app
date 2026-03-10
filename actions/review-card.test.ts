import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fsrs, Rating as FSRSRating, State } from 'ts-fsrs'

// ── Mocks ──────────────────────────────────────────────────────────

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    cardProgress: { findFirst: vi.fn() },
    $transaction: vi.fn(),
  },
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { reviewCard } from '@/actions/review-card'

const mockedAuth = vi.mocked(auth)
const mockedFindFirst = vi.mocked(prisma.cardProgress.findFirst)
const mockedTransaction = vi.mocked(prisma.$transaction)

// ── Helpers ────────────────────────────────────────────────────────

/** Build a fake cardProgress row in LEARNING state with a nonzero learningSteps */
function makeLearningCardProgress(learningSteps: number) {
  const now = new Date('2025-06-01T12:00:00Z')
  return {
    id: 'cp-1',
    userId: 'user-1',
    state: 'LEARNING' as const,
    due: now,
    stability: 2.5,
    difficulty: 5.0,
    scheduledDays: 0,
    reps: 2,
    lapses: 0,
    lastReviewedAt: new Date('2025-06-01T11:50:00Z'),
    learningSteps,
    version: 3,
    card: {
      deckId: 'deck-1',
      deck: { courseId: 'course-1' },
    },
  }
}

/**
 * Compute what FSRS would produce when learning_steps is correctly passed
 * versus hardcoded to 0, so the test is grounded in real algorithm output.
 */
function expectedFsrsResults(cardProgress: ReturnType<typeof makeLearningCardProgress>) {
  const f = fsrs()
  const now = new Date()

  const correctCard = {
    due: cardProgress.due,
    stability: cardProgress.stability,
    difficulty: cardProgress.difficulty,
    elapsed_days: 0,
    scheduled_days: cardProgress.scheduledDays,
    reps: cardProgress.reps,
    lapses: cardProgress.lapses,
    state: State.Learning,
    last_review: cardProgress.lastReviewedAt ?? undefined,
    learning_steps: cardProgress.learningSteps, // correct
  }

  const brokenCard = { ...correctCard, learning_steps: 0 } // bug

  const correctResult = f.repeat(correctCard, now)[FSRSRating.Hard].card
  const brokenResult = f.repeat(brokenCard, now)[FSRSRating.Hard].card

  return { correctResult, brokenResult, differ: correctResult.due.getTime() !== brokenResult.due.getTime() }
}

// ── Tests ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockedAuth.mockResolvedValue({
    user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
    expires: '2099-01-01',
  } as any)
})

describe('reviewCard — learning_steps bugs', () => {
  it('confirms that wrong learning_steps produces different FSRS scheduling', () => {
    // Sanity check: the bug actually matters for the algorithm
    const cp = makeLearningCardProgress(3)
    const { differ } = expectedFsrsResults(cp)
    expect(differ).toBe(true)
  })

  it('reads learningSteps from the database (bug #1: was hardcoded to 0)', async () => {
    const cp = makeLearningCardProgress(3)
    mockedFindFirst.mockResolvedValue(cp as any)

    // Make transaction resolve so reviewCard completes
    mockedTransaction.mockImplementation(async (fn: any) => {
      // Provide a fake tx with the methods the transaction body calls
      const tx = {
        cardProgress: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
        review: { create: vi.fn().mockResolvedValue({}) },
        courseEnrollment: { updateMany: vi.fn().mockResolvedValue({}) },
      }
      return fn(tx)
    })

    await reviewCard('cp-1', 'HARD', 'client-review-1')

    // The findFirst select must include learningSteps
    const findFirstCall = mockedFindFirst.mock.calls[0][0] as any
    expect(findFirstCall.select.learningSteps).toBe(true)
  })

  it('writes learningSteps back to the database (bug #2: was never persisted)', async () => {
    const cp = makeLearningCardProgress(3)
    mockedFindFirst.mockResolvedValue(cp as any)

    let capturedUpdateData: any = null
    mockedTransaction.mockImplementation(async (fn: any) => {
      const tx = {
        cardProgress: {
          updateMany: vi.fn().mockImplementation((args: any) => {
            capturedUpdateData = args.data
            return { count: 1 }
          }),
        },
        review: { create: vi.fn().mockResolvedValue({}) },
        courseEnrollment: { updateMany: vi.fn().mockResolvedValue({}) },
      }
      return fn(tx)
    })

    await reviewCard('cp-1', 'HARD', 'client-review-2')

    // The update must include learningSteps (whatever FSRS computed)
    expect(capturedUpdateData).toHaveProperty('learningSteps')
    expect(typeof capturedUpdateData.learningSteps).toBe('number')
  })
})
