import { getCourses } from '@/actions/course'
import { CourseList } from '@/components/admin/CourseList'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-3xl font-black uppercase">Courses</h1>
        <Button asChild>
          <Link href="/admin/courses/new">New Course</Link>
        </Button>
      </div>
      <div className="mt-6">
        <CourseList courses={courses} />
      </div>
    </div>
  )
}
