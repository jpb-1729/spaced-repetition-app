import { getCard } from '@/actions/card'
import { CardForm } from '@/components/admin/CardForm'
import { PageHead } from '@/components/admin/ui'
import { notFound } from 'next/navigation'

export default async function EditCardPage({
  params,
}: {
  params: Promise<{ id: string; deckId: string; cardId: string }>
}) {
  const { deckId, cardId } = await params
  const card = await getCard(cardId)

  if (!card || card.deckId !== deckId) {
    notFound()
  }

  return (
    <div>
      <PageHead eyebrow="Card" title="Edit card" />
      <div className="mt-8">
        <CardForm deckId={deckId} card={card} />
      </div>
    </div>
  )
}
