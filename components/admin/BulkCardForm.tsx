'use client'

import { useActionState } from 'react'
import { bulkInsertCards, type BulkCardActionState } from '@/actions/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function BulkCardForm({ deckId }: { deckId: string }) {
  const [state, formAction, isPending] = useActionState<BulkCardActionState, FormData>(
    bulkInsertCards,
    {}
  )

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <input type="hidden" name="deckId" value={deckId} />

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="json">Card JSON *</Label>
        <Textarea
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
          className="font-mono text-sm"
        />
        <p className="text-muted-foreground text-xs">
          Paste JSON with a &quot;test&quot; array of objects, each with &quot;Question&quot; and
          &quot;Answer&quot; fields.
        </p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Importing...' : 'Import Cards'}
      </Button>
    </form>
  )
}
