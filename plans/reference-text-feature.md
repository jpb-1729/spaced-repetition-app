# Reference Text for Bulk Insert

## Problem
When creating flashcards from a textbook chapter, article, or lecture notes, the source material is lost. Students can't go back to the original text when a card feels unclear or they want deeper context.

## Proposed Approach

### Where to store it: Deck level

Store the reference text on the **Deck** model. Rationale:
- A deck typically maps to one chapter/topic/source
- Simpler than a separate model or card-group concept
- The bulk insert form already operates on a single deck
- If a deck draws from multiple sources over time, the admin can append to the text field

### Schema Change

Add an optional `referenceText` field to the `Deck` model:

```prisma
model Deck {
  ...
  referenceText  String?  // Source material the cards are derived from
  ...
}
```

This is a single nullable text column — no new tables, no new relations.

### Files to Change

**1. Prisma schema** — `prisma/schema.prisma`
- Add `referenceText String?` to `Deck`
- Run migration

**2. Bulk insert form** — `components/admin/BulkCardForm.tsx`
- Add an optional "Reference Text" `<textarea>` above or below the JSON input
- Pass it as a new form field (`referenceText`)

**3. Bulk insert action** — `actions/card.ts`
- Read the `referenceText` field from `formData`
- After inserting cards, update the deck's `referenceText` (append if one already exists, or overwrite — TBD based on preference)

**4. Study session** — `app/study/StudySession.tsx`
- Fetch `deck.referenceText` in the study page query (`app/study/page.tsx`)
- Display a collapsible "Reference Text" section below the card during review
- Only show the toggle when `referenceText` is non-null

**5. Deck edit form** (if one exists)
- Allow editing the reference text outside of bulk insert as well

### What NOT to change
- No new database tables or relations
- No changes to the FSRS algorithm or card progress
- No changes to the JSON format for cards

### Open Questions
1. **Append vs overwrite** — If a deck already has reference text and you do another bulk import, should the new text append or replace? Leaning toward replace with a warning.
2. **Formatting** — Should reference text support markdown rendering, or just plain text with whitespace preserved? Start with plain text (rendered in a `<pre>` or `whitespace-pre-wrap` div), add markdown later if needed.
3. **Size limit** — PostgreSQL `TEXT` has no practical limit, but should we cap it in validation (e.g., 50K characters) to keep the UI responsive?
