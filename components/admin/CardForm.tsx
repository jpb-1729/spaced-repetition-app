'use client'

import { useActionState } from 'react'
import { createCard, updateCard, type CardActionState } from '@/actions/card'
import { Field, FormError, btnSolid, inputClass } from '@/components/admin/ui'

type CardData = {
  id: string
  front: string
  back: string
  notes: string | null
  tags: string[]
}

export function CardForm({ deckId, card }: { deckId: string; card?: CardData }) {
  const action = card ? updateCard : createCard
  const [state, formAction, isPending] = useActionState<CardActionState, FormData>(action, {})

  return (
    <form action={formAction} className="max-w-[64ch] space-y-7">
      <input type="hidden" name="deckId" value={deckId} />
      {card && <input type="hidden" name="id" value={card.id} />}

      {state.error && <FormError>{state.error}</FormError>}

      <Field label="Front" htmlFor="front" required error={state.fieldErrors?.front?.[0]}>
        <textarea
          id="front"
          name="front"
          rows={3}
          defaultValue={card?.front ?? ''}
          required
          className={inputClass}
        />
      </Field>

      <Field label="Back" htmlFor="back" required error={state.fieldErrors?.back?.[0]}>
        <textarea
          id="back"
          name="back"
          rows={4}
          defaultValue={card?.back ?? ''}
          required
          className={inputClass}
        />
      </Field>

      <Field label="Notes" htmlFor="notes" error={state.fieldErrors?.notes?.[0]}>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={card?.notes ?? ''}
          className={inputClass}
        />
      </Field>

      <Field
        label="Tags"
        htmlFor="tags"
        hint="Comma-separated, e.g. irregular-verb, common-phrase"
        error={state.fieldErrors?.tags?.[0]}
      >
        <input
          id="tags"
          name="tags"
          type="text"
          defaultValue={card?.tags.join(', ') ?? ''}
          className={inputClass}
        />
      </Field>

      <button type="submit" disabled={isPending} className={btnSolid}>
        {isPending ? 'Saving…' : card ? 'Update card' : 'Add card'}
      </button>
    </form>
  )
}
