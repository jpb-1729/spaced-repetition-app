import { signIn, auth } from '@/auth'

export default async function Home() {
  const session = await auth()
  const isLoggedIn = !!session?.user
  return (
    <div className="flex flex-col">
      <header className="p-8">
        <h1 className="text-foreground text-5xl font-bold uppercase tracking-tight sm:text-6xl">
          Olivero Recall
        </h1>
        <p className="text-foreground mt-2 text-2xl font-bold">
          Learn smarter, not harder.
        </p>
      </header>
      <div className="max-w-2xl p-8">
        <p className="text-foreground text-lg leading-relaxed">
          This app uses spaced repetition to burn knowledge into your memory with minimal effort.
        </p>
      </div>
      {!isLoggedIn && (
        <div className="flex flex-col gap-4 p-8 sm:flex-row">
          <form
            action={async () => {
              'use server'
              await signIn('google')
            }}
          >
            <button className="brutal-btn brutal-btn-hover bg-primary text-primary-foreground px-8 py-3">
              Log In
            </button>
          </form>
          <form
            action={async () => {
              'use server'
              await signIn('google')
            }}
          >
            <button className="brutal-btn brutal-btn-hover bg-success text-success-foreground px-8 py-3">
              Sign Up
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
