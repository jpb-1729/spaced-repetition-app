import { z } from 'zod'

export const createDeckSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  ordinal: z.coerce.number().int().min(1, 'Ordinal must be at least 1'),
  cardsPerSession: z.coerce.number().int().min(1).default(20),
  passingScore: z.coerce.number().int().min(0).max(100).default(80),
  isOptional: z.coerce.boolean().default(false),
})

export const updateDeckSchema = z.object({
  id: z.string().min(1, 'Deck ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  ordinal: z.coerce.number().int().min(1, 'Ordinal must be at least 1'),
  cardsPerSession: z.coerce.number().int().min(1).default(20),
  passingScore: z.coerce.number().int().min(0).max(100).default(80),
  isOptional: z.coerce.boolean().default(false),
})

export type CreateDeckInput = z.infer<typeof createDeckSchema>
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>
