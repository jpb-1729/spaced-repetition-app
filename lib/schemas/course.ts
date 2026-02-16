import { z } from 'zod'

export const createCourseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  subject: z.string().max(100).optional(),
  level: z.string().max(50).optional(),
  estimatedHours: z.coerce.number().int().min(0).optional(),
  isPublished: z.coerce.boolean().default(false),
})

export const updateCourseSchema = z.object({
  id: z.string().min(1, 'Course ID is required'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  subject: z.string().max(100).optional(),
  level: z.string().max(50).optional(),
  estimatedHours: z.coerce.number().int().min(0).optional(),
  isPublished: z.coerce.boolean().default(false),
})

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
