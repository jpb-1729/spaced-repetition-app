import { getCourse } from '@/actions/course'
import { DeckList } from '@/components/admin/DeckList'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = await getCourse(id)

  if (!course) {
    notFound()
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-3xl font-black uppercase">{course.name}</h1>
          {course.description && <p className="text-muted-foreground mt-1">{course.description}</p>}
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-sm">
            {course.subject && <span>Subject: {course.subject}</span>}
            {course.level && <span>Level: {course.level}</span>}
            {course.estimatedHours != null && <span>{course.estimatedHours}h estimated</span>}
            <span>{course._count.enrollments} enrollments</span>
            <Badge variant={course.isPublished ? 'success' : 'outline'}>
              {course.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/courses/${course.id}/edit`}>Edit Course</Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/courses/${course.id}/decks/new`}>New Deck</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-foreground text-xl font-bold uppercase">Decks</h2>
        <div className="mt-4">
          <DeckList decks={course.decks} courseId={course.id} />
        </div>
      </div>
    </div>
  )
}
