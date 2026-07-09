import { signIn, auth } from '@/auth'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const session = await auth()
  const isLoggedIn = !!session?.user
  return (
    <div className="bg-dots flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center p-8">
        <h1 className="text-foreground text-5xl font-black uppercase tracking-tight sm:text-6xl">
          Olivero Recall
        </h1>
        <p className="text-foreground mt-2 text-2xl font-bold">Learn smarter, not harder.</p>
        <div className="mt-6 max-w-2xl">
          <p className="text-foreground text-lg leading-relaxed">
            This app uses spaced repetition to burn knowledge into your memory with minimal effort.
          </p>
        </div>
        {!isLoggedIn && (
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <form
              action={async () => {
                'use server'
                await signIn('google')
              }}
            >
              <Button type="submit" size="xl">
                Log In
              </Button>
            </form>
            <form
              action={async () => {
                'use server'
                await signIn('google')
              }}
            >
              <Button type="submit" size="xl" variant="success">
                Sign Up
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
