import SignIn from '@/components/SignIn'

export default function SignInPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5">
      <div className="border-ink bg-card w-full max-w-md border p-8">
        <p className="label text-vermillion">Sign in</p>
        <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight">Welcome</h1>
        <p className="text-ink-mute mt-2 text-sm">Sign in to continue</p>
        <div className="border-ink/12 mt-8 border-t pt-8">
          <SignIn />
        </div>
      </div>
    </div>
  )
}
