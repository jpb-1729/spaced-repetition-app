'use client'

import { useActionState } from 'react'
import { createDeck, updateDeck, type DeckActionState } from '@/actions/deck'
import { CheckField, Field, FormError, btnSolid, inputClass } from '@/components/admin/ui'

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
    <form action={formAction} className="max-w-[52ch] space-y-7">
      <input type="hidden" name="courseId" value={courseId} />
      {deck && <input type="hidden" name="id" value={deck.id} />}

      {state.error && <FormError>{state.error}</FormError>}

      <Field label="Name" htmlFor="name" required error={state.fieldErrors?.name?.[0]}>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={deck?.name ?? ''}
          required
          className={inputClass}
        />
      </Field>

      <Field label="Description" htmlFor="description" error={state.fieldErrors?.description?.[0]}>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={deck?.description ?? ''}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-3 gap-5">
        <Field label="Ordinal" htmlFor="ordinal" required error={state.fieldErrors?.ordinal?.[0]}>
          <input
            id="ordinal"
            name="ordinal"
            type="number"
            min={1}
            defaultValue={deck?.ordinal ?? nextOrdinal ?? 1}
            required
            className={inputClass}
          />
        </Field>
        <Field
          label="Cards / session"
          htmlFor="cardsPerSession"
          error={state.fieldErrors?.cardsPerSession?.[0]}
        >
          <input
            id="cardsPerSession"
            name="cardsPerSession"
            type="number"
            min={1}
            defaultValue={deck?.cardsPerSession ?? 20}
            className={inputClass}
          />
        </Field>
        <Field label="Pass %" htmlFor="passingScore" error={state.fieldErrors?.passingScore?.[0]}>
          <input
            id="passingScore"
            name="passingScore"
            type="number"
            min={0}
            max={100}
            defaultValue={deck?.passingScore ?? 80}
            className={inputClass}
          />
        </Field>
      </div>

      <CheckField
        id="isOptional"
        name="isOptional"
        label="Optional"
        defaultChecked={deck?.isOptional ?? false}
      />

      <button type="submit" disabled={isPending} className={btnSolid}>
        {isPending ? 'Saving…' : deck ? 'Update deck' : 'Create deck'}
      </button>
    </form>
  )
}
