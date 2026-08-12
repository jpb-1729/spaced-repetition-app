import { getCourse } from '@/actions/course'
import { DeckList } from '@/components/admin/DeckList'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = await getCourse(id)

  if (!course) {
    notFound()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course.name}</h1>
          {course.description && <p className="mt-1 text-gray-600">{course.description}</p>}
          <div className="mt-2 flex gap-4 text-sm text-gray-500">
            {course.subject && <span>Subject: {course.subject}</span>}
            {course.level && <span>Level: {course.level}</span>}
            {course.estimatedHours != null && <span>{course.estimatedHours}h estimated</span>}
            <span>{course._count.enrollments} enrollments</span>
            <span>{course.isPublished ? 'Published' : 'Draft'}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/courses/${course.id}/edit`}
            className="rounded border px-4 py-2 hover:bg-gray-50"
          >
            Edit Course
          </Link>
          <Link
            href={`/admin/courses/${course.id}/decks/new`}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            New Deck
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Decks</h2>
        <div className="mt-4">
          <DeckList decks={course.decks} courseId={course.id} />
        </div>
      </div>
    </div>
  )
}
