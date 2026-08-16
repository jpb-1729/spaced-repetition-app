import { redirect } from 'next/navigation'

// Metrics live in the study dashboard's right column now; this route survives
// for old links and bookmarks only.
export default function StatsPage() {
  redirect('/study')
}
