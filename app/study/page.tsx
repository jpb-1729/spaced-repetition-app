// app/study/page.tsx
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { StudySession } from './StudySession'

export default async function StudyPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  // Get all due cards for this user
  const dueCards = await prisma.cardProgress.findMany({
    where: {
      userId: session.user.id,
      due: {
        lte: new Date(),
      },
      suspended: false,
    },
    include: {
      card: {
        include: {
          deck: {
            include: {
              course: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      due: 'asc',
    },
    take: 20, // Limit session size
  })

  if (dueCards.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <div className="py-16 text-center">
          <h1 className="mb-4 text-3xl font-bold">No Cards Due!</h1>
          <p className="text-gray-600">{`You're all caught up. Check back later for more reviews.`}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <StudySession cards={dueCards} />
    </div>
  )
}
