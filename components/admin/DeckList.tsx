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
        <tr>
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
          <tr key={deck.id} className="border-rule border-b">
            <Td className="text-ink-mute font-mono text-[12.5px] tabular-nums">
              {String(deck.ordinal).padStart(2, '0')}
            </Td>
            <Td>
              <Link
                href={`/admin/courses/${courseId}/decks/${deck.id}`}
                className="hover:text-accent font-serif text-[17px] font-semibold transition-colors"
              >
                {deck.name}
              </Link>
            </Td>
            <TdNum>{deck._count.cards}</TdNum>
            <TdNum>{deck.cardsPerSession}</TdNum>
            <TdNum>{deck.passingScore}%</TdNum>
            <Td>
              {deck.isOptional ? (
                <span className="text-ink-soft text-[13px]">Optional</span>
              ) : (
                <span className="text-rule-2">—</span>
              )}
            </Td>
            <Td>
              <div className="flex justify-end gap-4">
                <Link href={`/admin/courses/${courseId}/decks/${deck.id}`} className={btnQuiet}>
                  Cards
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
