import { redirect } from 'next/navigation'

// The study dashboard now includes the deck index; this route survives for
// old links and bookmarks only.
export default function ViewDecksPage() {
  redirect('/study')
}
