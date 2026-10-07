# Olivero Recall

> Burn knowledge into your brain with minimal effort.

Olivero Recall is a spaced repetition flashcard app powered by the **FSRS-6 algorithm**. Study smarter, forget less, spend less time reviewing stuff you already know.

> **Early Development** — actively being built. Things will break. Improvements incoming.

---

## What it does

- **Spaced repetition that actually works** — FSRS-6 schedules each card based on your personal memory curve, not a one-size-fits-all interval
- **Course-based deck organization** — decks live inside courses, so related material stays together
- **4-button rating system** — AGAIN / HARD / GOOD / EASY after each card, same as Anki
- **Keyboard-first study** — Space reveals, 1–4 grades, S suspends; the whole session runs without a mouse
- **Suspend and restore** — shelve a card you don't want to see again, bring it back later; per user, never touches the deck
- **Study dashboard** — due counts per deck, 14-day forecast, 126-day consistency heatmap, streak, review log
- **Inline markdown in cards** — `` `code` ``, `**bold**` and `*italic*` render in card text
- **Admin content tools** — create courses and decks, add or edit cards one at a time, or paste a JSON batch
- **Role-based access** — admins create content, students study it
- **Light and dark** — one palette of `light-dark()` pairs, contrast-checked against WCAG 2.1

---

## Tech Stack

| Layer        | Tech                                             |
| ------------ | ------------------------------------------------ |
| Framework    | Next.js 16 (App Router + Turbopack)              |
| Database ORM | Prisma + PostgreSQL                              |
| Auth         | Auth.js v5 (Google OAuth, plus a dev login)      |
| Styling      | Tailwind CSS v4, editorial theme, light/dark     |
| Type         | Schibsted Grotesk, Source Serif 4, IBM Plex Mono |
| Algorithm    | FSRS-6 via `ts-fsrs`                             |
| Validation   | Zod                                              |
| Testing      | Vitest + Testing Library                         |
| Language     | TypeScript                                       |

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
needed. That is the fastest path — no OAuth client required. Signing in with
the `ADMIN_EMAIL` address grants the admin role.

The provider is registered only in development (see `auth.ts`), so it does
not exist in a production build.

To test real Google sign-in instead, create an OAuth client with:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### Database

```bash
pnpm prisma migrate dev
pnpm db:seed          # optional: seed with sample data
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

## Studying

Enroll in a deck from **Decks**, then open **Study**. The session shows one
card at a time from the selected deck; the left column switches decks and
sets queue order and session length, the right column tracks the session.

| Key     | Action                                                  |
| ------- | ------------------------------------------------------- |
| `Space` | Reveal the answer                                       |
| `1`–`4` | Grade AGAIN / HARD / GOOD / EASY (after reveal)         |
| `S`     | Suspend the current card (works before or after reveal) |

A card graded AGAIN comes back at the end of the same session. A suspended
card leaves the queue and is listed under the deck index with a **Restore**
link; it rejoins the queue the next time the session is rebuilt. Suspension
is per user and the card stays in the deck for everyone else.

Reviews are posted in order behind one another, so grading quickly never
races the scheduler. A review that fails to save is shown in the footer with
a retry.

---

## Authoring content

Sign in as an admin and open **Admin** in the navbar.

1. **Course** → **New course**, then open its **Decks**.
2. **Deck** → **New deck**. Click the deck name to open its card list.
3. **Cards** → **Add card** for one at a time, or **Import** for a batch.

The single-card form takes a front, back, optional notes, and
comma-separated tags. The import form takes JSON in this shape:

```json
{
  "test": [
    { "Question": "What is 2+2?", "Answer": "4" },
    { "Question": "Capital of France?", "Answer": "Paris" }
  ]
}
```

`Question` becomes the front and `Answer` the back. Notes and tags are only
available on the single-card form.

Card text supports inline markdown: `` `code` ``, `**bold**` and
`*italic*`. Emphasis markers must hug the text, so `a * b` stays literal, and
underscores are never treated as emphasis, so `snake_case` is safe. Block
syntax is not rendered.

---

## Project Structure

```
app/
  (site)/               # Pages that share the site navbar
    page.tsx            #   Landing page
    sign-in/            #   Google sign-in, plus dev login in development
    decks/              #   Browse and enroll in decks
    view_decks/         #   Enrolled decks
    stats/              #   Review stats
    admin/              #   Courses → decks → cards (list, add, edit, import)
  study/                # Study session: dashboard, surface, deck index, metrics
actions/
  review-card.ts        # FSRS review: optimistic locking, idempotent inserts
  suspend-card.ts       # Suspend / restore a card for the current user
  enrollment.ts         # Enroll in a deck and initialize card progress
  course.ts / deck.ts   # Content CRUD (admin only)
  card.ts               # Single-card CRUD and bulk import (admin only)
components/
  Inline.tsx            # Inline markdown for card text
  Navbar.tsx
  admin/                # CourseForm, DeckForm, CardForm, CardList, BulkCardForm, ui
lib/
  fsrs.ts               # Scheduler instance, state/rating maps, interval helpers
  study.ts              # Study page data shapes and row mappers
  prisma.ts             # Prisma client singleton
  admin.ts              # requireAdmin() auth guard
  schemas/              # Zod schemas for course, deck, card forms
prisma/
  schema.prisma         # Users, courses, decks, cards, per-user progress, reviews
  seed.ts               # Sample data (destructive, see above)
scripts/
  check-contrast.mjs    # Verifies the palette against WCAG 2.1
```

---

## Development

```bash
pnpm test:run        # run all tests once
pnpm test            # watch mode
pnpm test:coverage   # coverage report
pnpm lint            # eslint
pnpm check:format    # prettier --check
pnpm format          # prettier --write
pnpm check:contrast  # palette contrast check
pnpm build           # prisma generate + next build
```

`next dev` regenerates `AGENTS.md`, which points coding agents at the
bundled Next.js docs in `node_modules/next/dist/docs/`. It is committed on
purpose so the tree stays clean.
