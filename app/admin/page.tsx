import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { StatCard } from '@/components/ui/stat-card'
import { BookOpen, Layers, Users } from 'lucide-react'

export default async function AdminDashboard() {
  const [courseCount, deckCount, enrollmentCount] = await Promise.all([
    prisma.course.count(),
    prisma.deck.count(),
    prisma.courseEnrollment.count(),
  ])

  return (
    <div>
      <h1 className="text-foreground text-3xl font-black uppercase">Admin Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Courses" value={courseCount} icon={<BookOpen />} colorScheme="accent" />
        <StatCard title="Decks" value={deckCount} icon={<Layers />} colorScheme="info" />
        <StatCard
          title="Enrollments"
          value={enrollmentCount}
          icon={<Users />}
          colorScheme="success"
        />
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
