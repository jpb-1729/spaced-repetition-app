'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { deleteDeck } from '@/actions/deck'
import { EmptyState, Td, TdNum, Th, btnDanger, btnQuiet } from '@/components/admin/ui'

type Deck = {
  id: string
  name: string
  ordinal: number
  cardsPerSession: number
  passingScore: number
  isOptional: boolean
  _count: { cards: number }
}

export function DeckList({ decks, courseId }: { decks: Deck[]; courseId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete deck "${name}" and all its cards? This cannot be undone.`)) {
      return
    }
    startTransition(() => deleteDeck(id))
  }

  if (decks.length === 0) {
    return <EmptyState>No decks yet. Add one to get started.</EmptyState>
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-ink/12 border-b">
          <Th className="w-10">№</Th>
          <Th>Name</Th>
          <Th className="text-right">Cards</Th>
          <Th className="text-right">Per session</Th>
          <Th className="text-right">Pass</Th>
          <Th>Optional</Th>
          <Th className="text-right">Actions</Th>
        </tr>
      </thead>
      <tbody>
        {decks.map((deck) => (
          <tr key={deck.id} className="border-ink/12 border-b">
            <Td className="text-ink-mute font-mono text-[13px] tabular-nums">
              {String(deck.ordinal).padStart(2, '0')}
            </Td>
            <Td className="font-serif text-[17px]">{deck.name}</Td>
            <TdNum>{deck._count.cards}</TdNum>
            <TdNum>{deck.cardsPerSession}</TdNum>
            <TdNum>{deck.passingScore}%</TdNum>
            <Td>
              {deck.isOptional ? (
                <span className="label text-ink-mute">Optional</span>
              ) : (
                <span className="text-ink-mute/50">—</span>
              )}
            </Td>
            <Td>
              <div className="flex justify-end gap-4">
                <Link
                  href={`/admin/courses/${courseId}/decks/${deck.id}/cards/bulk`}
                  className={btnQuiet}
                >
                  Import
                </Link>
                <Link
                  href={`/admin/courses/${courseId}/decks/${deck.id}/edit`}
                  className={btnQuiet}
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(deck.id, deck.name)}
                  disabled={isPending}
                  className={btnDanger}
                >
                  Delete
                </button>
              </div>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
