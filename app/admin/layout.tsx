import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-8 flex gap-4 border-b pb-4">
        <Link href="/admin" className="font-medium text-blue-600 hover:underline">
          Dashboard
        </Link>
        <Link href="/admin/courses" className="font-medium text-blue-600 hover:underline">
          Courses
        </Link>
      </nav>
      {children}
    </div>
  )
}
