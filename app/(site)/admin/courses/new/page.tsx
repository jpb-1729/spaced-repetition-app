import { CourseForm } from '@/components/admin/CourseForm'

export default function NewCoursePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">New Course</h1>
      <div className="mt-6">
        <CourseForm />
      </div>
    </div>
  )
}
