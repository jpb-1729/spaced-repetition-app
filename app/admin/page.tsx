// app/admin/page.tsx
import { auth } from '@/auth'

export default async function AdminPage() {
  const session = await auth()

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <pre className="mt-4 rounded bg-gray-100 p-4">{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}
