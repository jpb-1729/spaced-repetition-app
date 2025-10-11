// app/my-cards/page.tsx (simpler version)
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function MyCardsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const cardProgresses = await prisma.cardProgress.findMany({
    where: {
      userId: session.user.id,
      suspended: false,
    },
    include: {
      card: {
        include: {
          deck: {
            include: {
              course: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
    orderBy: { due: 'asc' },
  })

  const now = new Date()

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Active Cards</h1>

      <div className="mb-6 grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold">{cardProgresses.length}</div>
          <div className="text-sm text-gray-600">Total Cards</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {cardProgresses.filter(p => p.due <= now).length}
          </div>
          <div className="text-sm text-gray-600">Due Now</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {cardProgresses.filter(p => p.state === 'REVIEW').length}
          </div>
          <div className="text-sm text-gray-600">In Review</div>
        </div>
      </div>

      {cardProgresses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">
            No active cards. Enroll in a deck to get started!
          </p>
          <a 
            href="/decks"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Decks
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {cardProgresses.map((progress) => {
            const isDue = progress.due <= now
            const daysUntilDue = Math.ceil(
              (progress.due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            )
            
            return (
              <div
                key={progress.id}
                className={`border rounded-lg p-4 ${
                  isDue ? 'bg-yellow-50 border-yellow-300' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">
                      {progress.card.deck.course.name} → {progress.card.deck.name}
                    </div>
                    <div className="font-medium text-lg mb-1">
                      {progress.card.front}
                    </div>
                    <div className="text-gray-600">
                      {progress.card.back}
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      progress.state === 'NEW' ? 'bg-blue-100 text-blue-800' :
                      progress.state === 'LEARNING' ? 'bg-purple-100 text-purple-800' :
                      progress.state === 'REVIEW' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {progress.state}
                    </span>
                    
                    <div className="mt-2 text-sm">
                      {isDue ? (
                        <span className="text-red-600 font-semibold">Due now!</span>
                      ) : daysUntilDue <= 0 ? (
                        <span className="text-red-600">Overdue</span>
                      ) : (
                        <span className="text-gray-600">Due in {daysUntilDue}d</span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      {progress.reps} reps · {progress.lapses} lapses
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}