import { z } from 'zod'

// Tags arrive from a single comma-separated input.
const tagsField = z
  .string()
  .optional()
  .transform((s) => [
    ...new Set(
      (s ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    ),
  ])

export const createCardSchema = z.object({
  deckId: z.string().min(1, 'Deck ID is required'),
  front: z.string().trim().min(1, 'Front is required'),
  back: z.string().trim().min(1, 'Back is required'),
  notes: z.string().trim().optional(),
  tags: tagsField,
})

export const updateCardSchema = createCardSchema.extend({
  id: z.string().min(1, 'Card ID is required'),
})

export type CreateCardInput = z.infer<typeof createCardSchema>
export type UpdateCardInput = z.infer<typeof updateCardSchema>
