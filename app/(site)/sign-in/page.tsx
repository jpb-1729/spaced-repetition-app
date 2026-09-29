import SignIn from '@/components/SignIn'

export default function SignInPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5">
      <div className="border-rule bg-paper before:bg-ink relative w-full max-w-md border p-8 before:absolute before:inset-x-[-1px] before:top-[-1px] before:h-[3px]">
        <p className="label text-accent">Sign in</p>
        <h1 className="mt-3 text-[34px] leading-none font-extrabold tracking-[-0.03em]">Welcome</h1>
        <p className="text-ink-soft mt-3 font-serif text-[17px]">Sign in to continue.</p>
        <div className="border-rule mt-7 border-t pt-7">
          <SignIn />
        </div>
      </div>
    </div>
  )
}
