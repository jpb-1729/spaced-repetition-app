import SignIn from '@/components/SignIn'

export default function SignInPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5">
      <div className="w-full max-w-md border border-ink bg-card p-8">
        <p className="label text-vermillion">Sign in</p>
        <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight">Welcome</h1>
        <p className="mt-2 text-sm text-ink-mute">Sign in to continue</p>
        <div className="mt-8 border-t border-ink/12 pt-8">
          <SignIn />
        </div>
      </div>
    </div>
  )
}
