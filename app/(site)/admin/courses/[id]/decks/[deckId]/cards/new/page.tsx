import { getDeck } from '@/actions/deck'
import { CardForm } from '@/components/admin/CardForm'
import { PageHead } from '@/components/admin/ui'
import { notFound } from 'next/navigation'

export default async function NewCardPage({
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
      <PageHead eyebrow={`Deck · ${deck.name}`} title="New card" />
      <div className="mt-8">
        <CardForm deckId={deck.id} />
      </div>
    </div>
  )
}
