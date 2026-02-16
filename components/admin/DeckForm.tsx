'use client'

import { useActionState } from 'react'
import { createDeck, updateDeck, type DeckActionState } from '@/actions/deck'

type DeckData = {
  id: string
  name: string
  description: string | null
  ordinal: number
  cardsPerSession: number
  passingScore: number
  isOptional: boolean
}

export function DeckForm({
  courseId,
  deck,
  nextOrdinal,
}: {
  courseId: string
  deck?: DeckData
  nextOrdinal?: number
}) {
  const action = deck ? updateDeck : createDeck
  const [state, formAction, isPending] = useActionState<DeckActionState, FormData>(action, {})

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <input type="hidden" name="courseId" value={courseId} />
      {deck && <input type="hidden" name="id" value={deck.id} />}

      {state.error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={deck?.name ?? ''}
          required
          className="mt-1 w-full rounded border px-3 py-2"
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={deck?.description ?? ''}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="ordinal" className="block text-sm font-medium">
            Ordinal *
          </label>
          <input
            id="ordinal"
            name="ordinal"
            type="number"
            min={1}
            defaultValue={deck?.ordinal ?? nextOrdinal ?? 1}
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
          {state.fieldErrors?.ordinal && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.ordinal[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="cardsPerSession" className="block text-sm font-medium">
            Cards/Session
          </label>
          <input
            id="cardsPerSession"
            name="cardsPerSession"
            type="number"
            min={1}
            defaultValue={deck?.cardsPerSession ?? 20}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="passingScore" className="block text-sm font-medium">
            Pass %
          </label>
          <input
            id="passingScore"
            name="passingScore"
            type="number"
            min={0}
            max={100}
            defaultValue={deck?.passingScore ?? 80}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isOptional"
          name="isOptional"
          type="checkbox"
          value="true"
          defaultChecked={deck?.isOptional ?? false}
        />
        <label htmlFor="isOptional" className="text-sm font-medium">
          Optional
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Saving...' : deck ? 'Update Deck' : 'Create Deck'}
      </button>
    </form>
  )
}
