import { getDeck } from '@/actions/deck'
import { BulkCardForm } from '@/components/admin/BulkCardForm'
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
      <h1 className="text-foreground text-3xl font-black uppercase">Import Cards</h1>
      <p className="text-muted-foreground mt-1">
        Adding cards to: {deck.name} ({deck._count.cards} existing)
      </p>
      <div className="mt-6">
        <BulkCardForm deckId={deckId} />
      </div>
    </div>
  )
}
