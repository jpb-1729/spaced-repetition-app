'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { deleteCourse } from '@/actions/course'
import { EmptyState, Td, TdNum, Th, btnDanger, btnQuiet } from '@/components/admin/ui'

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
        <tr className="border-ink border-b">
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
          <tr key={course.id} className="border-ink/12 border-b">
            <Td>
              <Link
                href={`/admin/courses/${course.id}`}
                className="hover:text-vermillion font-serif text-[17px] transition-colors"
              >
                {course.name}
              </Link>
            </Td>
            <Td className="text-ink-soft">{course.subject || '—'}</Td>
            <Td className="text-ink-soft">{course.level || '—'}</Td>
            <TdNum>{course._count.decks}</TdNum>
            <TdNum>{course._count.enrollments}</TdNum>
            <Td>
              <span className={course.isPublished ? 'label text-moss' : 'label text-ink-mute'}>
                {course.isPublished ? 'Published' : 'Draft'}
              </span>
            </Td>
            <Td>
              <div className="flex justify-end gap-4">
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
