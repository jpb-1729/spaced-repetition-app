import { getDeck } from '@/actions/deck'
import { BulkCardForm } from '@/components/admin/BulkCardForm'
import { PageHead } from '@/components/admin/ui'
import { notFound } from 'next/navigation'

export default async function BulkCardsPage({
  params,
}: {
  params: Promise<{ id: string; deckId: string }>
}) {
  const { deckId } = await params
  const deck = await getDeck(deckId)

  if (!deck) {
    notFound()
  }

  return (
    <div>
      <PageHead
        eyebrow={`Deck · ${deck.name}`}
        title="Import cards"
        meta={`${deck._count.cards} existing`}
      />
      <div className="mt-8">
        <BulkCardForm deckId={deckId} />
      </div>
    </div>
  )
}
