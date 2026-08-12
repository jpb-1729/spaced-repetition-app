// app/study/page.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth, signOut } from '@/auth'
import { DAY_MS, formatInterval } from '@/lib/fsrs'
import {
  progressSnapshotSelect,
  studyCardSelect,
  toProgressRow,
  toQueueCard,
  type QueueCard,
  type StudyDashboardData,
} from '@/lib/study'
import { StudyDashboard } from './StudyDashboard'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function StudyPage(props: Props) {
  const searchParams = await props.searchParams
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }
  const userId = session.user.id

  const enrolledCourseFilter = {
    course: { enrollments: { some: { userId, status: 'ACTIVE' as const } } },
  }

  const decksRaw = await prisma.deck.findMany({
    where: enrolledCourseFilter,
    orderBy: [{ course: { name: 'asc' } }, { ordinal: 'asc' }],
    select: {
      id: true,
      name: true,
      cardsPerSession: true,
      course: { select: { id: true, name: true } },
    },
  })

  if (decksRaw.length === 0) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-5 sm:px-8 lg:px-10">
        <header className="border-ink border-b pt-5 pb-3">
          <h1 className="font-serif text-[40px] leading-[0.82] font-normal tracking-[-0.035em] sm:text-[54px]">
            Noema<span className="text-vermillion">.</span>
          </h1>
        </header>
        <div className="flex flex-1 flex-col justify-center py-16">
          <span className="label text-vermillion mb-5">Nothing enrolled</span>
          <h2 className="max-w-[18ch] font-serif text-[38px] leading-[0.98] font-light tracking-[-0.03em] sm:text-[56px]">
            Your study index is empty.
          </h2>
          <p className="label text-ink-mute mt-6">Enroll in a collection to begin.</p>
          <div className="mt-10">
            <Link
              href="/decks"
              className="label border-ink bg-ink text-paper hover:text-ink inline-block border px-6 py-3.5 transition-colors hover:bg-transparent"
            >
              Browse decks →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const serverNow = new Date()

  const [snapshotRaw, queuesRaw, recentRaw, latestRaw, totalReviews] = await Promise.all([
    prisma.cardProgress.findMany({
      where: { userId, suspended: false, card: { deck: enrolledCourseFilter } },
      select: progressSnapshotSelect,
    }),
    Promise.all(
      decksRaw.map((d) =>
        prisma.cardProgress.findMany({
          where: { userId, suspended: false, card: { deckId: d.id } },
          orderBy: { due: 'asc' },
          take: 40,
          select: studyCardSelect,
        })
      )
    ),
    prisma.review.findMany({
      where: { userId, reviewedAt: { gte: new Date(serverNow.getTime() - 126 * DAY_MS) } },
      select: { reviewedAt: true, rating: true },
      orderBy: { reviewedAt: 'desc' },
    }),
    prisma.review.findMany({
      where: { userId },
      orderBy: { reviewedAt: 'desc' },
      take: 8,
      select: {
        id: true,
        rating: true,
        reviewedAt: true,
        newDue: true,
        cardProgress: { select: { card: { select: { front: true } } } },
      },
    }),
    prisma.review.count({ where: { userId } }),
  ])

  const queues: Record<string, QueueCard[]> = {}
  decksRaw.forEach((d, i) => {
    queues[d.id] = queuesRaw[i].map(toQueueCard)
  })

  const data: StudyDashboardData = {
    serverNow: serverNow.getTime(),
    decks: decksRaw.map((d, i) => ({
      id: d.id,
      name: d.name,
      courseId: d.course.id,
      courseName: d.course.name,
      index: String(i + 1).padStart(2, '0'),
      cardsPerSession: d.cardsPerSession,
    })),
    snapshot: snapshotRaw.map(toProgressRow),
    queues,
    recentReviews: recentRaw.map((r) => ({ ts: r.reviewedAt.getTime(), rating: r.rating })),
    latestLog: latestRaw.map((r) => ({
      id: r.id,
      front: r.cardProgress.card.front,
      grade: r.rating,
      ts: r.reviewedAt.getTime(),
      interval: formatInterval((r.newDue.getTime() - r.reviewedAt.getTime()) / DAY_MS),
    })),
    totalReviews,
    isAdmin: session.user.role === 'ADMIN',
  }

  // Deep-link support: ?deckId= selects the initial collection; ?courseId=
  // falls back to that course's first deck.
  const deckParam = typeof searchParams.deckId === 'string' ? searchParams.deckId : undefined
  const courseParam = typeof searchParams.courseId === 'string' ? searchParams.courseId : undefined
  const initialDeckId =
    (deckParam && data.decks.find((d) => d.id === deckParam)?.id) ||
    (courseParam && data.decks.find((d) => d.courseId === courseParam)?.id) ||
    data.decks[0].id

  async function signOutAction() {
    'use server'
    await signOut()
  }

  return <StudyDashboard data={data} initialDeckId={initialDeckId} signOutAction={signOutAction} />
}
