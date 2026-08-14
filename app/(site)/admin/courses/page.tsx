import { getCourses } from '@/actions/course'
import { CourseList } from '@/components/admin/CourseList'
import { PageHead, btnSolid } from '@/components/admin/ui'
import Link from 'next/link'

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <div>
      <PageHead
        eyebrow="Admin"
        title="Courses"
        meta={`${courses.length} ${courses.length === 1 ? 'course' : 'courses'}`}
        actions={
          <Link href="/admin/courses/new" className={btnSolid}>
            New course
          </Link>
        }
      />
      <div className="mt-8">
        <CourseList courses={courses} />
      </div>
    </div>
  )
}
