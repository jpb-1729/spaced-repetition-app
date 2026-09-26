import { getCourse } from '@/actions/course'
import { DeckList } from '@/components/admin/DeckList'
import { PageHead, StatusChip, btnOutline, btnSolid } from '@/components/admin/ui'
import { SectionHead } from '@/app/study/ui'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = await getCourse(id)

  if (!course) {
    notFound()
  }

  const facts = [
    course.subject && `Subject: ${course.subject}`,
    course.level && `Level: ${course.level}`,
    course.estimatedHours != null && `${course.estimatedHours}h estimated`,
    `${course._count.enrollments} enrolled`,
  ].filter(Boolean) as string[]

  return (
    <div>
      <PageHead
        eyebrow="Course"
        title={course.name}
        actions={
          <>
            <Link href={`/admin/courses/${course.id}/edit`} className={btnOutline}>
              Edit course
            </Link>
            <Link href={`/admin/courses/${course.id}/decks/new`} className={btnSolid}>
              New deck
            </Link>
          </>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <StatusChip published={course.isPublished} />
        {facts.map((f) => (
          <span key={f} className="text-ink-soft text-[13.5px]">
            {f}
          </span>
        ))}
      </div>

      {course.description && (
        <p className="text-ink-soft mt-5 max-w-[64ch] font-serif text-[19px] leading-normal">
          {course.description}
        </p>
      )}

      <section className="mt-12">
        <SectionHead
          n="01"
          title="Decks"
          meta={`${course.decks.length} ${course.decks.length === 1 ? 'deck' : 'decks'}`}
        />
        <div className="mt-2">
          <DeckList decks={course.decks} courseId={course.id} />
        </div>
      </section>
    </div>
  )
}
