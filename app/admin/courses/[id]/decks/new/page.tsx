import { getCourse } from '@/actions/course'
import { DeckForm } from '@/components/admin/DeckForm'
import { notFound } from 'next/navigation'

export default async function NewDeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = await getCourse(id)

  if (!course) {
    notFound()
  }

  const nextOrdinal = course.decks.length > 0
    ? Math.max(...course.decks.map((d) => d.ordinal)) + 1
    : 1

  return (
    <div>
      <h1 className="text-3xl font-bold">New Deck</h1>
      <p className="mt-1 text-gray-600">Adding deck to: {course.name}</p>
      <div className="mt-6">
        <DeckForm courseId={course.id} nextOrdinal={nextOrdinal} />
      </div>
    </div>
  )
}
