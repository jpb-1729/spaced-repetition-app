import { CourseForm } from '@/components/admin/CourseForm'

export default function NewCoursePage() {
  return (
    <div>
      <h1 className="text-foreground text-3xl font-black uppercase">New Course</h1>
      <div className="mt-6">
        <CourseForm />
      </div>
    </div>
  )
}
