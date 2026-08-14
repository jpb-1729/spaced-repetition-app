import { getCourse } from '@/actions/course'
import { DeckForm } from '@/components/admin/DeckForm'
import { PageHead } from '@/components/admin/ui'
import { notFound } from 'next/navigation'

export default async function NewDeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = await getCourse(id)

  if (!course) {
    notFound()
  }

  const nextOrdinal =
    course.decks.length > 0 ? Math.max(...course.decks.map((d) => d.ordinal)) + 1 : 1

  return (
    <div>
      <PageHead eyebrow={`Course · ${course.name}`} title="New deck" />
      <div className="mt-8">
        <DeckForm courseId={course.id} nextOrdinal={nextOrdinal} />
      </div>
    </div>
  )
}
