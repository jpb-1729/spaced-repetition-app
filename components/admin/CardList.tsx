'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { deleteCard } from '@/actions/card'
import { EmptyState, Td, Th, btnDanger, btnQuiet } from '@/components/admin/ui'

type Card = {
  id: string
  front: string
  back: string
  notes: string | null
  tags: string[]
}

export function CardList({
  cards,
  courseId,
  deckId,
}: {
  cards: Card[]
  courseId: string
  deckId: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    if (!window.confirm('Delete this card and everyone’s progress on it? This cannot be undone.')) {
      return
    }
    startTransition(() => deleteCard(id))
  }

  if (cards.length === 0) {
    return <EmptyState>No cards yet. Add one or import a batch.</EmptyState>
  }

  return (
    <table className="w-full table-fixed">
      <thead>
        <tr>
          <Th className="w-12">№</Th>
          <Th>Front</Th>
          <Th>Back</Th>
          <Th className="w-[18%]">Tags</Th>
          <Th className="w-28 text-right">Actions</Th>
        </tr>
      </thead>
      <tbody>
        {cards.map((card, i) => (
          <tr key={card.id} className="border-rule border-b align-top">
            <Td className="text-ink-mute font-mono text-[12.5px] tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </Td>
            <Td className="font-serif text-[16px] font-semibold">
              <p className="line-clamp-3 whitespace-pre-line">{card.front}</p>
            </Td>
            <Td className="text-ink-soft">
              <p className="line-clamp-3 whitespace-pre-line">{card.back}</p>
              {card.notes && (
                <p className="text-ink-mute mt-1.5 line-clamp-2 text-[12.5px] italic">
                  {card.notes}
                </p>
              )}
            </Td>
            <Td>
              {card.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border-rule-2 text-ink-soft rounded-full border px-2 py-0.5 text-[12px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-rule-2">—</span>
              )}
            </Td>
            <Td>
              <div className="flex justify-end gap-4">
                <Link
                  href={`/admin/courses/${courseId}/decks/${deckId}/cards/${card.id}/edit`}
                  className={btnQuiet}
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(card.id)}
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
