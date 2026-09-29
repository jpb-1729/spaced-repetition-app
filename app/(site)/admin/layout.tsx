import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1280px] px-[clamp(16px,3.2vw,40px)] py-10">
      <nav className="border-rule mb-10 flex gap-6 border-b pb-3">
        <Link
          href="/admin"
          className="text-ink-soft hover:text-ink text-[14px] font-semibold transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/courses"
          className="text-ink-soft hover:text-ink text-[14px] font-semibold transition-colors"
        >
          Courses
        </Link>
      </nav>
      {children}
    </div>
  )
}
