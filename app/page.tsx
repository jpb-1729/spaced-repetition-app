import { signIn, auth } from '@/auth'

export default async function Home() {
  const session = await auth()
  const isLoggedIn = !!session?.user
  return (
    <div className="flex flex-col">
      <header className="p-8">
        <p className="text-foreground text-4xl font-bold">Welcome to Olivero Recall</p>
        <p className="text-muted-foreground text-xl"> Learn smarter, not harder. </p>
      </header>
      <div className="max-w-2xl p-8">
        <p className="text-foreground leading-relaxed">
          This app uses spaced repetition to burn knowledge into your memory with minimal effort.
        </p>
      </div>
      <form
        className="p-8"
        action={async () => {
          'use server'
          await signIn('google')
        }}
      >
        {!isLoggedIn && (
          <button className="rounded-lg bg-blue-500 p-8 py-3 text-white transition-colors hover:bg-red-600 disabled:bg-gray-400">
            Log In
          </button>
        )}
      </form>
    </div>
  )
}
