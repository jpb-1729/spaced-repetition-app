'use client'

import { useActionState } from 'react'
import { bulkInsertCards, type BulkCardActionState } from '@/actions/card'

export function BulkCardForm({ deckId }: { deckId: string }) {
  const [state, formAction, isPending] = useActionState<BulkCardActionState, FormData>(
    bulkInsertCards,
    {}
  )

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <input type="hidden" name="deckId" value={deckId} />

      {state.error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="json" className="block text-sm font-medium">
          Card JSON *
        </label>
        <textarea
          id="json"
          name="json"
          rows={16}
          required
          placeholder={`{
  "test": [
    { "Question": "What is 2+2?", "Answer": "4" },
    { "Question": "Capital of France?", "Answer": "Paris" }
  ]
}`}
          className="mt-1 w-full rounded border px-3 py-2 font-mono text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Paste JSON with a &quot;test&quot; array of objects, each with &quot;Question&quot; and
          &quot;Answer&quot; fields.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Importing...' : 'Import Cards'}
      </button>
    </form>
  )
}
