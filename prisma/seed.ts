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
  {
    front: 'What is the main difference between Chianti DOCG and Chianti Classico DOCG',
    back: 'Chianti is a broader region with easier-drinking wines; Chianti Classico is a smaller historic zone between Florence and Siena with higher quality and stricter standards.',
  },
  {
    front: 'What symbol identifies Chianti Classico wines?',
    back: 'The Black Rooster (Gallo Nero)',
  },
  {
    front: 'What is the minimum Sangiovese requirement for Chianti vs. Chianti Classico?',
    back: 'Chianti = minimum 70% Sangiovese; Chianti Classico = minimum 80% Sangiovese',
  },
  {
    front: 'Can white grapes be used in Chianti Classico?',
    back: 'No, Chianti Classico uses 100% red varieties only. (Regular Chianti can include up to 10% white grapes)',
  },
  {
    front: 'What are the three aging categories for Chianti Classico?',
    back: 'Regular (12 months), Riserva (24 months), Gran Selezione (30 months)',
  },
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
      name: 'John',
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
    console.log('Sign in with Google to complete the linking.')
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
      name: 'Olivero - Drinks',
      description: 'Beverages',
      createdById: admin.id,
      subject: '',
      level: 'Beginner',
      estimatedHours: 10,
      isPublished: true,
    },
  })

  // Decks
  const deck1 = await prisma.deck.create({
    data: {
      courseId: course.id,
      name: 'Chianti',
      description: 'Essential greetings and courtesies',
      ordinal: 1,
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

  // Enrollment
  const totalDecks = 1
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
