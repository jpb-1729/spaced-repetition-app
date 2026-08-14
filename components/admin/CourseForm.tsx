'use client'

import { useActionState } from 'react'
import { createCourse, updateCourse, type CourseActionState } from '@/actions/course'
import { CheckField, Field, FormError, btnSolid, inputClass } from '@/components/admin/ui'

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
    <form action={formAction} className="max-w-[52ch] space-y-7">
      {course && <input type="hidden" name="id" value={course.id} />}

      {state.error && <FormError>{state.error}</FormError>}

      <Field label="Name" htmlFor="name" required error={state.fieldErrors?.name?.[0]}>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={course?.name ?? ''}
          required
          className={inputClass}
        />
      </Field>

      <Field label="Description" htmlFor="description" error={state.fieldErrors?.description?.[0]}>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={course?.description ?? ''}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-5">
        <Field label="Subject" htmlFor="subject" error={state.fieldErrors?.subject?.[0]}>
          <input
            id="subject"
            name="subject"
            type="text"
            defaultValue={course?.subject ?? ''}
            className={inputClass}
          />
        </Field>
        <Field label="Level" htmlFor="level" error={state.fieldErrors?.level?.[0]}>
          <input
            id="level"
            name="level"
            type="text"
            defaultValue={course?.level ?? ''}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Estimated hours"
        htmlFor="estimatedHours"
        error={state.fieldErrors?.estimatedHours?.[0]}
      >
        <input
          id="estimatedHours"
          name="estimatedHours"
          type="number"
          min={0}
          defaultValue={course?.estimatedHours ?? ''}
          className={inputClass}
        />
      </Field>

      <CheckField
        id="isPublished"
        name="isPublished"
        label="Published"
        defaultChecked={course?.isPublished ?? false}
      />

      <button type="submit" disabled={isPending} className={btnSolid}>
        {isPending ? 'Saving…' : course ? 'Update course' : 'Create course'}
      </button>
    </form>
  )
}
