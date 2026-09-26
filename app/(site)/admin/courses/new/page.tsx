import { CourseForm } from '@/components/admin/CourseForm'
import { PageHead } from '@/components/admin/ui'

export default function NewCoursePage() {
  return (
    <div>
      <PageHead eyebrow="Courses" title="New course" />
      <div className="mt-8">
        <CourseForm />
      </div>
    </div>
  )
}
