import Link from 'next/link'
import { signIn, auth, devLoginEnabled } from '@/auth'

export default async function Home() {
  const session = await auth()
  const isLoggedIn = !!session?.user

  return (
    <div className="mx-auto max-w-[1280px] px-[clamp(16px,3.2vw,40px)]">
      <header className="border-rule border-b pt-12 pb-10 sm:pt-16">
        <p className="label text-accent">Spaced repetition</p>
        <h1 className="mt-4 text-[clamp(44px,6.4vw,78px)] leading-[0.98] font-extrabold tracking-[-0.045em] text-balance">
          Olivero Recall<span className="text-accent">.</span>
        </h1>
        <p className="text-ink-soft mt-5 max-w-[58ch] font-serif text-[20px] leading-normal sm:text-[22px]">
          Learn smarter, not harder.
        </p>
        <p className="text-ink-soft mt-3 max-w-[58ch] font-serif text-[18px] leading-normal">
          This app uses spaced repetition to burn knowledge into your memory with minimal effort.
        </p>
      </header>

      {!isLoggedIn &&
        (devLoginEnabled ? (
          // Locally there is usually no Google client configured, so send both
          // buttons to /sign-in, which also offers the passwordless dev login.
          <div className="flex flex-wrap gap-2.5 py-8">
            <Link href="/sign-in" className="btn">
              Log In
            </Link>
            <Link href="/sign-in" className="btn-ghost">
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5 py-8">
            <form
              action={async () => {
                'use server'
                await signIn('google')
              }}
            >
              <button className="btn">Log In</button>
            </form>
            <form
              action={async () => {
                'use server'
                await signIn('google')
              }}
            >
              <button className="btn-ghost">Sign Up</button>
            </form>
          </div>
        ))}
    </div>
  )
}
