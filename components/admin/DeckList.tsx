'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { deleteDeck } from '@/actions/deck'

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
    return <p className="text-gray-500">No decks yet. Add one to get started.</p>
  }

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b text-sm text-gray-500">
          <th className="pb-2">#</th>
          <th className="pb-2">Name</th>
          <th className="pb-2">Cards</th>
          <th className="pb-2">Per Session</th>
          <th className="pb-2">Pass %</th>
          <th className="pb-2">Optional</th>
          <th className="pb-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {decks.map((deck) => (
          <tr key={deck.id} className="border-b">
            <td className="py-3">{deck.ordinal}</td>
            <td className="py-3">{deck.name}</td>
            <td className="py-3">{deck._count.cards}</td>
            <td className="py-3">{deck.cardsPerSession}</td>
            <td className="py-3">{deck.passingScore}%</td>
            <td className="py-3">{deck.isOptional ? 'Yes' : 'No'}</td>
            <td className="py-3">
              <div className="flex gap-2">
                <Link
                  href={`/admin/courses/${courseId}/decks/${deck.id}/cards/bulk`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Import Cards
                </Link>
                <Link
                  href={`/admin/courses/${courseId}/decks/${deck.id}/edit`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(deck.id, deck.name)}
                  disabled={isPending}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
