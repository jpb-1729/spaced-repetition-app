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
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-gray-500">Courses</p>
          <p className="text-3xl font-bold">{courseCount}</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-gray-500">Decks</p>
          <p className="text-3xl font-bold">{deckCount}</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-gray-500">Enrollments</p>
          <p className="text-3xl font-bold">{enrollmentCount}</p>
        </div>
      </div>
      <div className="mt-6">
        <Link href="/admin/courses" className="text-blue-600 hover:underline">
          Manage Courses &rarr;
        </Link>
      </div>
    </div>
  )
}
