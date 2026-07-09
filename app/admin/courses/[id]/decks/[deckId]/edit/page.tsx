import { getDeck } from '@/actions/deck'
import { DeckForm } from '@/components/admin/DeckForm'
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
      <h1 className="text-foreground text-3xl font-black uppercase">Edit Deck</h1>
      <div className="mt-6">
        <DeckForm courseId={id} deck={deck} />
      </div>
    </div>
  )
}
