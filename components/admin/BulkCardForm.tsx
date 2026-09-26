'use client'

import { useActionState } from 'react'
import { bulkInsertCards, type BulkCardActionState } from '@/actions/card'
import { Field, FormError, btnSolid, inputClass } from '@/components/admin/ui'
import { cn } from '@/lib/cn'

export function BulkCardForm({ deckId }: { deckId: string }) {
  const [state, formAction, isPending] = useActionState<BulkCardActionState, FormData>(
    bulkInsertCards,
    {}
  )

  return (
    <form action={formAction} className="max-w-[72ch] space-y-7">
      <input type="hidden" name="deckId" value={deckId} />

      {state.error && <FormError>{state.error}</FormError>}

      <Field
        label="Card JSON"
        htmlFor="json"
        required
        hint={
          <>
            Paste JSON with a &quot;test&quot; array of objects, each with &quot;Question&quot; and
            &quot;Answer&quot; fields.
          </>
        }
      >
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
          className={cn(
            inputClass,
            'placeholder:text-ink-mute/60 font-mono text-[13px] leading-relaxed'
          )}
        />
      </Field>

      <button type="submit" disabled={isPending} className={btnSolid}>
        {isPending ? 'Importing…' : 'Import cards'}
      </button>
    </form>
  )
}
