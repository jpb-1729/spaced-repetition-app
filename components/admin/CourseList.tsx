'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { deleteCourse } from '@/actions/course'

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
    return <p className="text-gray-500">No courses yet. Create one to get started.</p>
  }

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b text-sm text-gray-500">
          <th className="pb-2">Name</th>
          <th className="pb-2">Subject</th>
          <th className="pb-2">Level</th>
          <th className="pb-2">Decks</th>
          <th className="pb-2">Enrollments</th>
          <th className="pb-2">Published</th>
          <th className="pb-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {courses.map((course) => (
          <tr key={course.id} className="border-b">
            <td className="py-3">
              <Link href={`/admin/courses/${course.id}`} className="text-blue-600 hover:underline">
                {course.name}
              </Link>
            </td>
            <td className="py-3">{course.subject || '-'}</td>
            <td className="py-3">{course.level || '-'}</td>
            <td className="py-3">{course._count.decks}</td>
            <td className="py-3">{course._count.enrollments}</td>
            <td className="py-3">{course.isPublished ? 'Yes' : 'No'}</td>
            <td className="py-3">
              <div className="flex gap-2">
                <Link
                  href={`/admin/courses/${course.id}/edit`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(course.id, course.name)}
                  disabled={isPending}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
