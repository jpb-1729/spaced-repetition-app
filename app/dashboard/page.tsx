// app/courses/page.tsx  (Server Component)
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const runtime = 'nodejs'

export default async function CoursesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // Option A: query Courses by enrollment (cleanest)
  //   const courses = await prisma.course.findMany({
  //     where: {
  //       courseEnrollments: { some: { userId: session.user.id } },
  //     },
  //     select: { id: true, name: true, description: true },
  //     orderBy: { name: "asc" },
  //   })

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: session.user.id },
    select: { course: { select: { id: true, name: true, description: true } } },
    orderBy: { course: { name: 'asc' } },
  })
  const courses = enrollments.map((e) => e.course)
  console.log(enrollments)
  console.log(session)
  console.log(session.user.id)

  const dueCards = await prisma.cardProgress.findMany({
    where: {
      userId: "cmgi48jy600017sr7sztew7on",
      // card: {
      //   deckId: deckId,
      //   deck: {
      //     courseId: courseId
      //   }
      // },
      due: {
        lte: new Date() // Due now or earlier
      },
      suspended: false
    },
    include: {
      card: {
        include: {
          deck: {
            select: {
              name: true,
              cardsPerSession: true
            }
          }
        }
      }
    },
    orderBy: {
      due: 'asc' // Oldest due cards first
    }
  });

  console.log(dueCards)

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Your courses</h1>
      {courses.length === 0 ? (
        <p className="text-muted-foreground">You’re not enrolled in any courses yet.</p>
      ) : (
        <ul className="space-y-3">
          {courses.map((c) => (
            <li key={c.id} className="rounded-xl border p-4">
              <div className="text-lg font-medium">{c.name}</div>
              <p className="mt-1 text-sm opacity-80">{c.description}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
