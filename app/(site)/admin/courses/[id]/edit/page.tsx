import { getCourse } from '@/actions/course'
import { CourseForm } from '@/components/admin/CourseForm'
import { PageHead } from '@/components/admin/ui'
import { notFound } from 'next/navigation'

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = await getCourse(id)

  if (!course) {
    notFound()
  }

  return (
    <div>
      <PageHead eyebrow={`Course · ${course.name}`} title="Edit course" />
      <div className="mt-8">
        <CourseForm course={course} />
      </div>
    </div>
  )
}
