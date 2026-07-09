import SignIn from '@/components/SignIn' // Adjust path to your component
import { Card } from '@/components/ui/card'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-black uppercase">Welcome</h1>
          <p className="text-muted-foreground mt-2 font-bold">Sign in to continue</p>
        </div>

        <SignIn />
      </Card>
    </div>
  )
}
