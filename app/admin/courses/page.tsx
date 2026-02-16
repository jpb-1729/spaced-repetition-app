import { getCourses } from '@/actions/course'
import { CourseList } from '@/components/admin/CourseList'
import Link from 'next/link'

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Link
          href="/admin/courses/new"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          New Course
        </Link>
      </div>
      <div className="mt-6">
        <CourseList courses={courses} />
      </div>
    </div>
  )
}
