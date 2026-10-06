import { getDeckWithCards } from '@/actions/deck'
import { CardList } from '@/components/admin/CardList'
import { PageHead, btnOutline, btnSolid } from '@/components/admin/ui'
import { SectionHead } from '@/app/study/ui'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string; deckId: string }>
}) {
  const { id, deckId } = await params
  const deck = await getDeckWithCards(deckId)

  if (!deck || deck.courseId !== id) {
    notFound()
  }

  const base = `/admin/courses/${id}/decks/${deck.id}`
  const facts = [
    `Deck ${String(deck.ordinal).padStart(2, '0')}`,
    `${deck.cardsPerSession} per session`,
    `${deck.passingScore}% to pass`,
    deck.isOptional && 'Optional',
  ].filter(Boolean) as string[]

  return (
    <div>
      <Link
        href={`/admin/courses/${id}`}
        className="text-ink-soft hover:text-ink text-[13px] font-semibold transition-colors"
      >
        ← {deck.course.name}
      </Link>

      <div className="mt-4">
        <PageHead
          eyebrow={`Course · ${deck.course.name}`}
          title={deck.name}
          actions={
            <>
              <Link href={`${base}/edit`} className={btnOutline}>
                Edit deck
              </Link>
              <Link href={`${base}/cards/bulk`} className={btnOutline}>
                Import
              </Link>
              <Link href={`${base}/cards/new`} className={btnSolid}>
                Add card
              </Link>
            </>
          }
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        {facts.map((f) => (
          <span key={f} className="text-ink-soft text-[13.5px]">
            {f}
          </span>
        ))}
      </div>

      {deck.description && (
        <p className="text-ink-soft mt-5 max-w-[64ch] font-serif text-[19px] leading-normal">
          {deck.description}
        </p>
      )}

      <section className="mt-12">
        <SectionHead
          n="01"
          title="Cards"
          meta={`${deck.cards.length} ${deck.cards.length === 1 ? 'card' : 'cards'}`}
        />
        <div className="mt-2">
          <CardList cards={deck.cards} courseId={id} deckId={deck.id} />
        </div>
      </section>
    </div>
  )
}
