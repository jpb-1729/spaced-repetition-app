import { getDeck } from '@/actions/deck'
import { DeckForm } from '@/components/admin/DeckForm'
import { PageHead } from '@/components/admin/ui'
import { notFound } from 'next/navigation'

export default async function EditDeckPage({
  params,
}: {
  params: Promise<{ id: string; deckId: string }>
}) {
  const { id, deckId } = await params
  const deck = await getDeck(deckId)

  if (!deck) {
    notFound()
  }

  return (
    <div>
      <PageHead
        eyebrow={`Deck · ${deck.name}`}
        title="Edit deck"
        meta={`${deck._count.cards} ${deck._count.cards === 1 ? 'card' : 'cards'}`}
      />
      <div className="mt-8">
        <DeckForm courseId={id} deck={deck} />
      </div>
    </div>
  )
}
