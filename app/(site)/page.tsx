import { signIn, auth } from '@/auth'

export default async function Home() {
  const session = await auth()
  const isLoggedIn = !!session?.user

  return (
    <div className="mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-10">
      <header className="border-b border-ink pt-14 pb-10 sm:pt-20">
        <p className="label text-vermillion">Spaced repetition</p>
        <h1 className="mt-4 font-serif text-[52px] leading-[0.98] font-medium tracking-tight text-balance sm:text-[76px]">
          Olivero Recall<span className="text-vermillion">.</span>
        </h1>
        <p className="mt-5 font-serif text-2xl text-ink-soft italic sm:text-[28px]">
          Learn smarter, not harder.
        </p>
      </header>

      <div className="max-w-[52ch] border-b border-ink/12 py-8">
        <p className="text-[15px] leading-relaxed text-ink-soft">
          This app uses spaced repetition to burn knowledge into your memory with minimal effort.
        </p>
      </div>

      {!isLoggedIn && (
        <div className="flex flex-col gap-3 py-10 sm:flex-row">
          <form
            action={async () => {
              'use server'
              await signIn('google')
            }}
          >
            <button className="label cursor-pointer border border-ink bg-ink px-8 py-4 text-paper transition-colors hover:bg-vermillion hover:border-vermillion">
              Log In
            </button>
          </form>
          <form
            action={async () => {
              'use server'
              await signIn('google')
            }}
          >
            <button className="label cursor-pointer border border-ink px-8 py-4 text-ink transition-colors hover:bg-ink hover:text-paper">
              Sign Up
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
