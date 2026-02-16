'use client'

import { useActionState } from 'react'
import { createCourse, updateCourse, type CourseActionState } from '@/actions/course'

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
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={course?.name ?? ''}
          required
          className="mt-1 w-full rounded border px-3 py-2"
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={course?.description ?? ''}
          className="mt-1 w-full rounded border px-3 py-2"
        />
        {state.fieldErrors?.description && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.description[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            defaultValue={course?.subject ?? ''}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="level" className="block text-sm font-medium">
            Level
          </label>
          <input
            id="level"
            name="level"
            type="text"
            defaultValue={course?.level ?? ''}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label htmlFor="estimatedHours" className="block text-sm font-medium">
          Estimated Hours
        </label>
        <input
          id="estimatedHours"
          name="estimatedHours"
          type="number"
          min={0}
          defaultValue={course?.estimatedHours ?? ''}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isPublished"
          name="isPublished"
          type="checkbox"
          value="true"
          defaultChecked={course?.isPublished ?? false}
        />
        <label htmlFor="isPublished" className="text-sm font-medium">
          Published
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
      </button>
    </form>
  )
}
