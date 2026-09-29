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

      <div className="border-t-ink border-b-rule mt-10 grid grid-cols-1 border-t-2 border-b sm:grid-cols-3">
        {figures.map((f, i) => (
          <div
            key={f.label}
            className={
              i > 0 ? 'border-rule border-t py-5 sm:border-t-0 sm:border-l sm:pl-6' : 'py-5 sm:pr-6'
            }
          >
            <p className="text-ink text-[52px] leading-none font-extrabold tracking-[-0.04em] tabular-nums">
              {f.value}
            </p>
            <span className="text-ink-soft mt-2.5 block text-[13px] font-semibold">{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
