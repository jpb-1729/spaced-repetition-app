import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: { cardProgress: { updateMany: vi.fn() } },
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { suspendCard, restoreCard } from '@/actions/suspend-card'

const mockedAuth = vi.mocked(auth)
const mockedUpdateMany = vi.mocked(prisma.cardProgress.updateMany)

describe('suspendCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects unauthenticated callers', async () => {
    mockedAuth.mockResolvedValue(null as never)
    expect(await suspendCard('cp-1')).toEqual({ error: 'Not authenticated' })
    expect(mockedUpdateMany).not.toHaveBeenCalled()
  })

  it('only flips rows owned by the caller', async () => {
    mockedAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    mockedUpdateMany.mockResolvedValue({ count: 1 })

    expect(await suspendCard('cp-1')).toEqual({ success: true })
    expect(mockedUpdateMany).toHaveBeenCalledWith({
      where: { id: 'cp-1', userId: 'user-1' },
      data: { suspended: true },
    })
  })

  it("reports a miss when the row isn't the caller's", async () => {
    mockedAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    mockedUpdateMany.mockResolvedValue({ count: 0 })

    expect(await suspendCard('cp-9')).toEqual({ error: 'Card progress not found' })
  })

  it("restores by clearing the flag on the caller's own row", async () => {
    mockedAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    mockedUpdateMany.mockResolvedValue({ count: 1 })

    expect(await restoreCard('cp-1')).toEqual({ success: true })
    expect(mockedUpdateMany).toHaveBeenCalledWith({
      where: { id: 'cp-1', userId: 'user-1' },
      data: { suspended: false },
    })
  })
})
