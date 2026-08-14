import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { PageHead, btnOutline } from '@/components/admin/ui'

export default async function AdminDashboard() {
  const [courseCount, deckCount, enrollmentCount] = await Promise.all([
    prisma.course.count(),
    prisma.deck.count(),
    prisma.courseEnrollment.count(),
  ])

  const figures = [
    { label: 'Courses', value: courseCount },
    { label: 'Decks', value: deckCount },
    { label: 'Enrollments', value: enrollmentCount },
  ]

  return (
    <div>
      <PageHead
        eyebrow="Admin"
        title="Dashboard"
        actions={
          <Link href="/admin/courses" className={btnOutline}>
            Manage courses →
          </Link>
        }
      />

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {figures.map((f) => (
          <div key={f.label} className="border-ink border-t pt-3">
            <span className="label text-ink-mute">{f.label}</span>
            <p className="text-ink mt-3 font-mono text-[44px] leading-none tabular-nums">
              {String(f.value).padStart(2, '0')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
