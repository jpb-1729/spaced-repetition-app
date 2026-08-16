// app/(site)/decks/page.tsx
import { prisma } from '@/lib/prisma'
import { EnrollButton } from '@/components/EnrollButton'
import { auth } from '@/auth'

export default async function DecksPage() {
  const session = await auth()
  const userId = session?.user?.id

  const enrolledDeckIds = userId
    ? (
        await prisma.deckProgress.findMany({
          where: { userId },
          select: { deckId: true },
        })
      ).map((dp) => dp.deckId)
    : []

  const decks = await prisma.deck.findMany({
    include: {
      course: {
        select: {
          id: true,
          name: true,
          creator: {
            select: {
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          cards: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="mx-auto max-w-[1680px] px-5 py-10 sm:px-8 lg:px-10">
      <div className="border-ink flex items-baseline justify-between gap-3 border-b pb-3">
        <h1 className="flex items-baseline gap-2">
          <span className="label text-vermillion">Index</span>
          <span className="label text-ink">All decks</span>
        </h1>
        <span className="label text-ink-mute">
          {decks.length} {decks.length === 1 ? 'collection' : 'collections'}
        </span>
      </div>

      <div>
        {decks.map((deck, i) => (
          <div
            key={deck.id}
            className="border-ink/12 flex items-start justify-between gap-6 border-b py-6"
          >
            <div className="flex min-w-0 gap-5">
              <span className="label text-ink-mute pt-1.5">{String(i + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <h2 className="font-serif text-[22px] leading-tight font-medium tracking-tight">
                  {deck.name}
                </h2>
                <p className="label text-ink-mute mt-2">
                  {deck.course.name} · {deck.course.creator.name || 'Unknown'}
                </p>
                {deck.description && (
                  <p className="text-ink-soft mt-3 max-w-[52ch] text-[14px] leading-relaxed">
                    {deck.description}
                  </p>
                )}
                <p className="text-ink-mute mt-3 font-mono text-[11px] tabular-nums">
                  {deck._count.cards} cards
                </p>
              </div>
            </div>

            <EnrollButton
              courseId={deck.course.id}
              deckId={deck.id}
              deckName={deck.name}
              isEnrolled={enrolledDeckIds.includes(deck.id)}
            />
          </div>
        ))}

        {decks.length === 0 && (
          <p className="text-ink-mute py-16 text-center font-serif text-xl italic">
            No decks available yet.
          </p>
        )}
      </div>
    </div>
  )
}
