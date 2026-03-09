import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="border-b-3 border-border mb-8 flex gap-6 pb-4">
        <Link
          href="/admin"
          className="text-foreground text-sm font-bold uppercase tracking-wider hover:underline decoration-3 underline-offset-4"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/courses"
          className="text-foreground text-sm font-bold uppercase tracking-wider hover:underline decoration-3 underline-offset-4"
        >
          Courses
        </Link>
      </nav>
      {children}
    </div>
  )
}
