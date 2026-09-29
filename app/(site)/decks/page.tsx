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
    <div className="mx-auto max-w-[1280px] px-[clamp(16px,3.2vw,40px)]">
      <header className="border-rule border-b pt-11 pb-7">
        <p className="label text-accent">Index</p>
        <h1 className="mt-3 text-[clamp(34px,4.6vw,52px)] leading-[1.04] font-extrabold tracking-[-0.035em]">
          All decks
        </h1>
        <p className="text-ink-soft mt-3.5 font-serif text-[19px] leading-normal">
          {decks.length} {decks.length === 1 ? 'collection' : 'collections'} open for enrollment.
        </p>
      </header>

      <div>
        {decks.map((deck, i) => (
          <div
            key={deck.id}
            className="border-rule flex items-start justify-between gap-6 border-b py-5"
          >
            <div className="flex min-w-0 gap-4">
              <span className="bg-ink text-paper flex h-[52px] w-10 shrink-0 flex-col justify-between rounded-[1px] p-[5px] pb-1 text-[13px] leading-none font-extrabold tracking-[-0.02em]">
                <b>{String(i + 1).padStart(2, '0')}</b>
                <i className="font-mono text-[7px] font-medium not-italic opacity-85">
                  {deck._count.cards}
                </i>
              </span>
              <div className="min-w-0">
                <h2 className="text-[17.5px] leading-tight font-bold tracking-[-0.01em]">
                  {deck.name}
                </h2>
                <p className="text-ink-mute mt-1 text-[13px]">
                  {deck.course.name} · {deck.course.creator.name || 'Unknown'} ·{' '}
                  <span className="tabular-nums">{deck._count.cards} cards</span>
                </p>
                {deck.description && (
                  <p className="text-ink-soft mt-2.5 max-w-[60ch] font-serif text-[16px] leading-normal">
                    {deck.description}
                  </p>
                )}
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
