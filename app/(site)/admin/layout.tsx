import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1680px] px-5 py-10 sm:px-8 lg:px-10">
      <nav className="border-ink/12 mb-9 flex gap-7 border-b pb-3">
        <Link href="/admin" className="label text-ink hover:text-vermillion transition-colors">
          Dashboard
        </Link>
        <Link
          href="/admin/courses"
          className="label text-ink hover:text-vermillion transition-colors"
        >
          Courses
        </Link>
      </nav>
      {children}
    </div>
  )
}
