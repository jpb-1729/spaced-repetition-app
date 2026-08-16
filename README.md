# Olivero Recall

> Burn knowledge into your brain with minimal effort.

Olivero Recall is a spaced repetition flashcard app powered by the **FSRS-6 algorithm**. Study smarter, forget less, spend less time reviewing stuff you already know.

> **Early Development** — actively being built. Things will break. Improvements incoming.

---

## What it does

- **Spaced repetition that actually works** — FSRS-6 schedules each card based on your personal memory curve, not a one-size-fits-all interval
- **Course-based deck organization** — decks live inside courses, so related material stays together
- **4-button rating system** — AGAIN / HARD / GOOD / EASY after each card, same as Anki
- **Role-based access** — admins create content, students study it
- **Bulk card import** — paste JSON, get flashcards
- **Progress tracking** — see what's NEW, LEARNING, in REVIEW, or RELEARNING

---

## Tech Stack

| Layer        | Tech                                   |
| ------------ | -------------------------------------- |
| Framework    | Next.js 16 (App Router + Turbopack)    |
| Database ORM | Prisma + PostgreSQL                    |
| Auth         | Auth.js v5 (Google OAuth)              |
| Styling      | Tailwind CSS v4, neo-brutalist theme   |
| Algorithm    | FSRS-6 (open-source spaced repetition) |
| Testing      | Vitest + Testing Library               |
| Language     | TypeScript                             |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL

### Installation

```bash
git clone https://github.com/jpb-1729/spaced-repetition-app
cd spaced-repetition-app
pnpm install
```

### Environment

Create `.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/olivero
AUTH_SECRET=your-secret-here          # openssl rand -base64 32
AUTH_URL=http://localhost:3000
ADMIN_EMAIL=you@example.com           # seeded as ADMIN; dev login grants ADMIN

# Optional locally — only needed to exercise the real Google sign-in path.
# The dev login below works without them.
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

`AUTH_SECRET` is not optional. Without it every request throws
`MissingSecret`, and in dev that surfaces as a page that reloads forever
rather than as a readable error.

### Signing in locally

When `NODE_ENV === 'development'`, the sign-in page shows a **Dev login**
form that signs you in as any email with no password, creating the user if
needed. That is the fastest path — no OAuth client required.

The provider is registered only in development (see `auth.ts`), so it does
not exist in a production build.

To test real Google sign-in instead, create an OAuth client with:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### Database

```bash
pnpm prisma migrate dev
pnpm prisma db seed   # optional: seed with sample data
```

> **`db:seed` is destructive.** `prisma/seed.ts` begins by deleting every
> row in every table — users, reviews, progress, decks, courses. Only run it
> against a database you are willing to empty. If you develop against a Neon
> branch of production, do not seed it.

Switching `DATABASE_URL` between databases invalidates any session you are
already holding: the JWT stays valid (same `AUTH_SECRET`) but its user id
belongs to the old database, which renders as an empty study index rather
than a logged-out state. Sign out and back in after switching.

### Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  page.tsx              # Landing page
  study/                # Study session (the main event)
  view_decks/           # Browse enrolled decks
  decks/                # Enroll in decks
  stats/                # Review stats
  admin/                # Admin: manage courses, decks, cards
actions/
  review-card.ts        # FSRS review logic, optimistic locking
  enrollment.ts         # Enroll user in a deck + initialize card progress
  course.ts / deck.ts   # CRUD for content management
components/
  Navbar.tsx
  EnrollButton.tsx
  admin/                # CourseForm, DeckForm, BulkCardForm, etc.
lib/
  prisma.ts             # Prisma client singleton
  admin.ts              # requireAdmin() auth guard
  schemas/              # Zod validation schemas
```

---

## Testing

```bash
pnpm test:run      # run all tests
pnpm test          # watch mode
pnpm test:coverage # coverage report
```
