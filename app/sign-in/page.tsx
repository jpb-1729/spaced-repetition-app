import SignIn from '@/components/SignIn' // Adjust path to your component

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="brutal-border brutal-shadow bg-card w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-bold uppercase">Welcome</h1>
          <p className="text-muted-foreground mt-2 font-bold">Sign in to continue</p>
        </div>

        <SignIn />
      </div>
    </div>
  )
}
