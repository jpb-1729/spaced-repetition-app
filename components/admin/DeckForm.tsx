'use client'

import { useActionState } from 'react'
import { createDeck, updateDeck, type DeckActionState } from '@/actions/deck'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" type="text" defaultValue={deck?.name ?? ''} required />
        {state.fieldErrors?.name && (
          <p className="text-destructive text-sm font-bold">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={deck?.description ?? ''} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="ordinal">Ordinal *</Label>
          <Input
            id="ordinal"
            name="ordinal"
            type="number"
            min={1}
            defaultValue={deck?.ordinal ?? nextOrdinal ?? 1}
            required
          />
          {state.fieldErrors?.ordinal && (
            <p className="text-destructive text-sm font-bold">{state.fieldErrors.ordinal[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cardsPerSession">Cards/Session</Label>
          <Input
            id="cardsPerSession"
            name="cardsPerSession"
            type="number"
            min={1}
            defaultValue={deck?.cardsPerSession ?? 20}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="passingScore">Pass %</Label>
          <Input
            id="passingScore"
            name="passingScore"
            type="number"
            min={0}
            max={100}
            defaultValue={deck?.passingScore ?? 80}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="isOptional" name="isOptional" value="true" defaultChecked={deck?.isOptional ?? false} />
        <Label htmlFor="isOptional">Optional</Label>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : deck ? 'Update Deck' : 'Create Deck'}
      </Button>
    </form>
  )
}
