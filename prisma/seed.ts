// prisma/seed.ts
import { PrismaClient, UserRole, EnrollmentStatus, CardState, Rating } from '@prisma/client'

const prisma = new PrismaClient()

// --- helpers ---------------------------------------------------------------
const addDays = (d: Date, days: number) => {
  const nd = new Date(d)
  nd.setDate(nd.getDate() + days)
  return nd
}

type SeedCard = { front: string; back: string; notes?: string; tags?: string[] }

const deck1Cards: SeedCard[] = [
  // { front: 'hola', back: 'hello', tags: ['common-phrase'] },
  // { front: 'gracias', back: 'thank you', tags: ['common-phrase'] },
  // { front: '¿cómo estás?', back: 'how are you?', tags: ['common-phrase'] },
  {
    front: 'What are the ingredients in the Bucatini?',
    back: 'Chorizo, Charred Broccoli, Aged Provolone, Caramelized Onion',
  },
  {
    front: 'What two components are in the Agnolotti besides butter beans?',
    back: 'Parmesan Brodo, Mascarpone, Lemon',
  },
  {
    front: 'What accompanies the Grilled Chicken Thigh?',
    back: 'Charred Summer Squash, Manchego, Romesco Vinaigrette',
  },
  {
    front: 'What is served with the Twice Cooked Pork Shoulder?',
    back: 'Polenta, Roasted Red Pepper Sugo, Aged Provolone',
  },
  {
    front: 'What two sauces or condiments come with the Ribeye?',
    back: 'Espelette Aioli, Chimichurri',
  },
]

const deck2Cards: SeedCard[] = [
  { front: 'ser', back: 'to be (essential)', tags: ['irregular-verb'] },
  { front: 'estar', back: 'to be (state/location)', tags: ['irregular-verb'] },
  { front: 'tener', back: 'to have', tags: ['irregular-verb'] },
]

// Initial per-card FSRS-like defaults
const initialCardProgress = () => ({
  state: CardState.NEW,
  stability: 0,
  difficulty: 0.3, // 0-1 scale; lower means easier
  scheduledDays: 0,
  learningSteps: 0,
  reps: 0,
  lapses: 0,
  suspended: false,
  due: new Date(),
  lastReviewedAt: null as Date | null,
  version: 0,
})

// --- main seeding ----------------------------------------------------------
async function main() {
  // Delete in dependency order to be safe.
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.cardProgress.deleteMany(),
    prisma.deckProgress.deleteMany(),
    prisma.courseEnrollment.deleteMany(),
    prisma.card.deleteMany(),
    prisma.deck.deleteMany(),
    prisma.course.deleteMany(),
    prisma.user.deleteMany(),
  ])

  // Users
  const adminEmail = process.env.ADMIN_EMAIL
  const admin = await prisma.user.upsert({
    where: { email: adminEmail! },
    update: {},
    create: {
      email: adminEmail!,
      role: UserRole.ADMIN,
      name: 'Ada Admin',
      emailVerified: new Date(),
    },
  })

  // Check if Google account already linked
  const existingAccount = await prisma.account.findFirst({
    where: {
      userId: admin.id,
      provider: 'google',
    },
  })

  // If not linked, create a placeholder Account record
  if (!existingAccount) {
    console.log('⚠️  User exists but no Google account linked.')
    console.log('   Sign in with Google to complete the linking.')
    // We can't create the Account without providerAccountId from Google
    // User needs to sign in once with allowDangerousEmailAccountLinking: true
  }

  console.log(`✅ Admin user: ${adminEmail}`)

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      role: UserRole.STUDENT,
      name: 'Stu Student',
    },
  })

  // Course
  const course = await prisma.course.upsert({
    where: {
      // matches @@unique([createdById, name])
      createdById_name: { createdById: admin.id, name: 'Spanish I' },
    },
    update: {},
    create: {
      name: 'Spanish I',
      description: 'Introductory Spanish course with core phrases and verbs.',
      createdById: admin.id,
      subject: 'Spanish',
      level: 'Beginner',
      estimatedHours: 10,
      isPublished: true,
    },
  })

  // Decks
  const deck1 = await prisma.deck.create({
    data: {
      courseId: course.id,
      name: 'Phrases — Greetings',
      description: 'Essential greetings and courtesies',
      ordinal: 1,
      cardsPerSession: 10,
      passingScore: 80,
      isOptional: false,
    },
  })

  const deck2 = await prisma.deck.create({
    data: {
      courseId: course.id,
      name: 'Verbs — To Be & To Have',
      description: 'High-frequency irregular verbs',
      ordinal: 2,
      cardsPerSession: 10,
      passingScore: 80,
      isOptional: false,
    },
  })

  // Cards
  const createdDeck1Cards = await Promise.all(
    deck1Cards.map((c) =>
      prisma.card.create({
        data: {
          deckId: deck1.id,
          front: c.front,
          back: c.back,
          notes: c.notes,
          tags: c.tags ?? [],
        },
      })
    )
  )

  const createdDeck2Cards = await Promise.all(
    deck2Cards.map((c) =>
      prisma.card.create({
        data: {
          deckId: deck2.id,
          front: c.front,
          back: c.back,
          notes: c.notes,
          tags: c.tags ?? [],
        },
      })
    )
  )

  // Enrollment
  const totalDecks = 2
  const enrollment = await prisma.courseEnrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
      status: EnrollmentStatus.ACTIVE,
      completedDecks: 0,
      totalDecks,
      progressPercent: 0,
      targetCompletion: addDays(new Date(), 30),
    },
  })

  const adminEnrollment = await prisma.courseEnrollment.create({
    data: {
      userId: admin.id,
      courseId: course.id,
      status: EnrollmentStatus.ACTIVE,
      completedDecks: 0,
      totalDecks,
      progressPercent: 0,
      targetCompletion: addDays(new Date(), 30),
    },
  })
  // DeckProgress (one per deck for student)
  const deck1Progress = await prisma.deckProgress.create({
    data: {
      userId: student.id,
      deckId: deck1.id,
      totalCards: createdDeck1Cards.length,
      cardsStudied: 0,
      masteredCards: 0,
      isCompleted: false,
    },
  })

  const deck2Progress = await prisma.deckProgress.create({
    data: {
      userId: student.id,
      deckId: deck2.id,
      totalCards: createdDeck2Cards.length,
      cardsStudied: 0,
      masteredCards: 0,
      isCompleted: false,
    },
  })

  // CardProgress (one per card for student)
  const allCards = [...createdDeck1Cards, ...createdDeck2Cards]

  const cardProgresses = await Promise.all(
    allCards.map((card, idx) =>
      prisma.cardProgress.create({
        data: {
          userId: student.id,
          cardId: card.id,
          ...initialCardProgress(),
          // Spread the due dates a bit so the queue looks realistic
          due: addDays(new Date(), Math.floor(idx / 2)),
        },
      })
    )
  )

  // Simulate a short first study session on the first three cards
  const studied = cardProgresses.slice(0, 3)
  await Promise.all(
    studied.map((cp, i) =>
      prisma.review.create({
        data: {
          cardProgressId: cp.id,
          userId: student.id,
          reviewedAt: addDays(new Date(), -1),
          rating: i === 0 ? Rating.GOOD : i === 1 ? Rating.EASY : Rating.HARD,
          elapsedDays: 0,
          scheduledDays: 1,
          newDue: addDays(new Date(), i === 2 ? 0 : 1),
          clientReviewId: `seed-${cp.id}`,
        },
      })
    )
  )

  // Update the reviewed card progresses to reflect a pass
  await Promise.all(
    studied.map((cp, i) =>
      prisma.cardProgress.update({
        where: { id: cp.id },
        data: {
          state: CardState.REVIEW,
          reps: { increment: 1 },
          lastReviewedAt: addDays(new Date(), -1),
          scheduledDays: 1,
          stability: 1.5, // fake small stability
          difficulty: i === 2 ? 0.5 : 0.25,
          due: addDays(new Date(), i === 2 ? 0 : 1),
        },
      })
    )
  )

  // Recompute DeckProgress quick metrics
  const masteredCards = 0 // keep simple for seed
  await prisma.deckProgress.update({
    where: { id: deck1Progress.id },
    data: {
      cardsStudied: 3,
      masteredCards,
      lastStudiedAt: new Date(),
    },
  })

  // Course-level progress: % complete = completedDecks / totalDecks * 100
  // For seed data, none completed; show last studied now.
  await prisma.courseEnrollment.update({
    where: { id: enrollment.id },
    data: {
      progressPercent: (0 / totalDecks) * 100,
      lastStudiedAt: new Date(),
    },
  })

  console.log('Seed complete ✅')
}

main()
  .catch((e) => {
    console.error('Seed error ❌', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
