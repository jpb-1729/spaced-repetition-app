import { getCourse } from '@/actions/course'
import { CourseForm } from '@/components/admin/CourseForm'
import { notFound } from 'next/navigation'

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = await getCourse(id)

  if (!course) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-foreground text-3xl font-black uppercase">Edit Course</h1>
      <div className="mt-6">
        <CourseForm course={course} />
      </div>
    </div>
  )
}
