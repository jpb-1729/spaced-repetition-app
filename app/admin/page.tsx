import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [courseCount, deckCount, enrollmentCount] = await Promise.all([
    prisma.course.count(),
    prisma.deck.count(),
    prisma.courseEnrollment.count(),
  ])

  return (
    <div>
      <h1 className="text-foreground text-3xl font-bold uppercase">Admin Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="brutal-border brutal-shadow bg-accent p-6">
          <p className="text-accent-foreground text-sm font-bold uppercase tracking-wider">Courses</p>
          <p className="text-accent-foreground font-mono text-4xl font-bold">{courseCount}</p>
        </div>
        <div className="brutal-border brutal-shadow bg-info p-6">
          <p className="text-info-foreground text-sm font-bold uppercase tracking-wider">Decks</p>
          <p className="text-info-foreground font-mono text-4xl font-bold">{deckCount}</p>
        </div>
        <div className="brutal-border brutal-shadow bg-success p-6">
          <p className="text-success-foreground text-sm font-bold uppercase tracking-wider">Enrollments</p>
          <p className="text-success-foreground font-mono text-4xl font-bold">{enrollmentCount}</p>
        </div>
      </div>
      <div className="mt-6">
        <Link
          href="/admin/courses"
          className="text-foreground font-bold uppercase underline decoration-3 underline-offset-4 hover:text-primary"
        >
          Manage Courses &rarr;
        </Link>
      </div>
    </div>
  )
}
