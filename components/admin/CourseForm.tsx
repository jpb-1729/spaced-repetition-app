'use client'

import { useActionState } from 'react'
import { createCourse, updateCourse, type CourseActionState } from '@/actions/course'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'

type CourseData = {
  id: string
  name: string
  description: string | null
  subject: string | null
  level: string | null
  estimatedHours: number | null
  isPublished: boolean
}

export function CourseForm({ course }: { course?: CourseData }) {
  const action = course ? updateCourse : createCourse
  const [state, formAction, isPending] = useActionState<CourseActionState, FormData>(action, {})

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {course && <input type="hidden" name="id" value={course.id} />}

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" type="text" defaultValue={course?.name ?? ''} required />
        {state.fieldErrors?.name && (
          <p className="text-destructive text-sm font-bold">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={course?.description ?? ''} />
        {state.fieldErrors?.description && (
          <p className="text-destructive text-sm font-bold">{state.fieldErrors.description[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" name="subject" type="text" defaultValue={course?.subject ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="level">Level</Label>
          <Input id="level" name="level" type="text" defaultValue={course?.level ?? ''} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="estimatedHours">Estimated Hours</Label>
        <Input
          id="estimatedHours"
          name="estimatedHours"
          type="number"
          min={0}
          defaultValue={course?.estimatedHours ?? ''}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="isPublished" name="isPublished" value="true" defaultChecked={course?.isPublished ?? false} />
        <Label htmlFor="isPublished">Published</Label>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
      </Button>
    </form>
  )
}
