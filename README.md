# Olivero Recall

> Burn knowledge into your brain with minimal effort.

Olivero Recall is a spaced repetition flashcard app built on the FSRS-6
algorithm. Study smarter, forget less, spend less time reviewing what you
already know.

## What it does

- **Personal scheduling.** FSRS-6 schedules each card from your own memory
  curve rather than a fixed interval ladder.
- **Session briefing.** Opening Study shows what is due, how long it should
  take, and when the next card falls due before you see a single card.
- **Course-based decks.** Decks live inside courses, so related material
  stays together.
- **Four-button grading.** AGAIN, HARD, GOOD or EASY after each card, the
  same scale as Anki, all from the keyboard.
- **Suspend and restore.** Shelve a card you don't want to see and bring it
  back later. Suspension is per user and never touches the deck.
- **Study dashboard.** Due counts per deck, a 14-day forecast, a 126-day
  consistency heatmap, your streak, and the review log.
- **Inline markdown in cards.** `` `code` ``, `**bold**` and `*italic*`
  render in card text.
- **Admin content tools.** Create courses and decks, add or edit cards one at
  a time, or paste a JSON batch.
- **Role-based access.** Admins create content, students study it.
- **Light and dark.** One palette of `light-dark()` pairs, contrast-checked
  against WCAG 2.1.

## Tech stack

| Layer      | Tech                                             |
| ---------- | ------------------------------------------------ |
| Framework  | Next.js 16 (App Router + Turbopack)              |
| Database   | PostgreSQL via Prisma                            |
| Auth       | Auth.js v5 (Google OAuth, plus a dev login)      |
| Styling    | Tailwind CSS v4, light/dark                      |
| Type       | Schibsted Grotesk, Source Serif 4, IBM Plex Mono |
| Algorithm  | FSRS-6 via `ts-fsrs`                             |
| Validation | Zod                                              |
| Testing    | Vitest + Testing Library                         |
| Language   | TypeScript                                       |

## Getting started

### Prerequisites

- Node.js 20.9 or later
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
DIRECT_DATABASE_URL=postgresql://user:password@localhost:5432/olivero
AUTH_SECRET=your-secret-here          # openssl rand -base64 32
AUTH_URL=http://localhost:3000
ADMIN_EMAIL=you@example.com           # this address gets the admin role

# Only needed to exercise the real Google sign-in path (see below).
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

`DIRECT_DATABASE_URL` is the connection Prisma uses for migrations and the
seed script. Against a local Postgres it is the same as `DATABASE_URL`.
Against a pooled host such as Neon, it is the non-pooler endpoint.

`AUTH_SECRET` is not optional. Without it every request throws
`MissingSecret`, and in dev that surfaces as a page that reloads forever
rather than as a readable error.

### Signing in locally

When `NODE_ENV === 'development'`, the sign-in page shows a **Dev login**
form that signs you in as any email with no password, creating the user if
needed. No OAuth client is required. Signing in with the `ADMIN_EMAIL`
address grants the admin role.

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

**`db:seed` is destructive.** `prisma/seed.ts` begins by deleting every row
in every table: users, reviews, progress, decks, courses. Only run it against
a database you are willing to empty. If you develop against a Neon branch of
production, do not seed it.

Switching `DATABASE_URL` between databases invalidates any session you are
already holding: the JWT stays valid (same `AUTH_SECRET`) but its user id
belongs to the old database, which renders as an empty study index rather
than a logged-out state. Sign out and back in after switching.

### Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Studying

Enroll in a deck from **Decks**, then open **Study**. The page opens on a
briefing for the selected deck: how many cards are due, roughly how long the
session will take, and when the next card falls due if nothing is. The left
column switches decks and sets queue order and session length; the right
column holds the forecast, heatmap and review log.

Press Enter to begin. Cards then appear one at a time.

| Key     | Action                                                  |
| ------- | ------------------------------------------------------- |
| `Enter` | Begin the session from the briefing                     |
| `Space` | Reveal the answer                                       |
| `1`–`4` | Grade AGAIN / HARD / GOOD / EASY (after reveal)         |
| `S`     | Suspend the current card (works before or after reveal) |

When nothing in the deck is due, the briefing offers **Study ahead**, which
pulls the six soonest cards forward so the deck can still be practised.

A card graded AGAIN comes back at the end of the same session. A suspended
card leaves the queue and is listed under the deck index with a **Restore**
link; it rejoins the queue the next time the session is rebuilt.

Reviews are posted in order behind one another, so grading quickly never
races the scheduler. A review that fails to save is shown in the footer with
a retry.

Linking to `/study?deckId=<id>` (or `?courseId=<id>` for a course's first
deck) skips the briefing and opens on the first card.

## Authoring content

Sign in as an admin and open **Admin** in the navbar.

1. **Course** → **New course**, then open its **Decks**.
2. **Deck** → **New deck**. Click the deck name to open its card list.
3. **Cards** → **Add card** for one at a time, or **Import** for a batch.

The single-card form takes a front, back, optional notes, and
comma-separated tags. The import form takes JSON with a top-level key named
`test` (the schema currently requires that exact name) holding an array of
cards:

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

## Project structure

```
app/
  (site)/           # Pages that share the site navbar
    page.tsx        #   Landing page
    sign-in/        #   Google sign-in, plus dev login in development
    decks/          #   Browse and enroll in decks
    admin/          #   Courses → decks → cards (list, add, edit, import)
    stats/          #   Redirects to /study (kept for old links)
    view_decks/     #   Redirects to /study (kept for old links)
  study/            # Study session: briefing, card surface, deck index, metrics
  api/auth/         # Auth.js route handler
actions/            # Server actions: reviews, suspension, enrollment, content CRUD
components/         # Shared UI, plus admin/ forms
lib/                # FSRS scheduler, study data shapes, Prisma client, Zod schemas
prisma/             # Schema, migrations, and the (destructive) seed
scripts/            # check-contrast.mjs: palette against WCAG 2.1
```

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

### Notes for coding agents

`next dev` regenerates `AGENTS.md`, which points coding agents at the
bundled Next.js docs in `node_modules/next/dist/docs/`. It is committed on
purpose so the tree stays clean.
