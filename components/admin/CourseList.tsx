'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { deleteCourse } from '@/actions/course'
import { EmptyState, StatusChip, Td, TdNum, Th, btnDanger, btnQuiet } from '@/components/admin/ui'

type Course = {
  id: string
  name: string
  subject: string | null
  level: string | null
  isPublished: boolean
  _count: { decks: number; enrollments: number }
}

export function CourseList({ courses }: { courses: Course[] }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete course "${name}" and all its decks? This cannot be undone.`)) {
      return
    }
    startTransition(() => deleteCourse(id))
  }

  if (courses.length === 0) {
    return <EmptyState>No courses yet. Create one to get started.</EmptyState>
  }

  return (
    <table className="w-full">
      <thead>
        <tr>
          <Th>Name</Th>
          <Th>Subject</Th>
          <Th>Level</Th>
          <Th className="text-right">Decks</Th>
          <Th className="text-right">Enrolled</Th>
          <Th>Status</Th>
          <Th className="text-right">Actions</Th>
        </tr>
      </thead>
      <tbody>
        {courses.map((course) => (
          <tr key={course.id} className="border-rule border-b">
            <Td>
              <Link
                href={`/admin/courses/${course.id}`}
                className="hover:text-accent font-serif text-[17px] font-semibold transition-colors"
              >
                {course.name}
              </Link>
            </Td>
            <Td className="text-ink-soft">{course.subject || '—'}</Td>
            <Td className="text-ink-soft">{course.level || '—'}</Td>
            <TdNum>{course._count.decks}</TdNum>
            <TdNum>{course._count.enrollments}</TdNum>
            <Td>
              <StatusChip published={course.isPublished} />
            </Td>
            <Td>
              <div className="flex justify-end gap-4">
                <Link href={`/admin/courses/${course.id}`} className={btnQuiet}>
                  Decks
                </Link>
                <Link href={`/admin/courses/${course.id}/edit`} className={btnQuiet}>
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(course.id, course.name)}
                  disabled={isPending}
                  className={btnDanger}
                >
                  Delete
                </button>
              </div>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
