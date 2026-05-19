import Link from "next/link"
import { KeyRound, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { completeClientSignup, verifyClientInvite } from "@/server/actions/client-auth"
import { PhoneInput } from "@/components/ui/phone-input"

function getErrorMessage(error?: string) {
  if (error === "invite") return "The email or access key is invalid, expired, or already used."
  if (error === "expired") return "Your signup session expired. Verify your email and access key again."
  if (error === "account") return "Enter your name and matching passwords with at least 8 characters."
  return null
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; error?: string }>
}) {
  const resolved = await searchParams
  const accountStep = resolved?.step === "account"
  const errorMessage = getErrorMessage(resolved?.error)

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-[460px] rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_30px_rgba(17,24,39,0.06)]">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#25D366]">
            {accountStep ? <MessageSquare className="h-5 w-5 text-white" /> : <KeyRound className="h-5 w-5 text-white" />}
          </div>
          <div>
            <h1 className="text-[20px] font-semibold leading-tight">
              {accountStep ? "Create your account" : "Complete signup"}
            </h1>
            <p className="text-[13px] text-muted-foreground">
              {accountStep ? "Set your password to start onboarding." : "Use the email and access key shared by the admin."}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {errorMessage}
          </div>
        )}

        {accountStep ? (
          <form action={completeClientSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" autoComplete="name" required className="h-10 bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <PhoneInput id="phone" name="phone" placeholder="98765 43210" className="h-10 bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className="h-10 bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} className="h-10 bg-white" />
            </div>
            <Button type="submit" className="h-10 w-full bg-[#25D366] text-white hover:bg-[#128C7E]">
              Create account
            </Button>
          </form>
        ) : (
          <form action={verifyClientInvite} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required className="h-10 bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accessKey">Access key</Label>
              <Input id="accessKey" name="accessKey" placeholder="WBM-XXXX-XXXX-XXXX" required className="h-10 bg-white font-mono uppercase tracking-wide" />
            </div>
            <Button type="submit" className="h-10 w-full bg-[#25D366] text-white hover:bg-[#128C7E]">
              Verify invite
            </Button>
          </form>
        )}

        <p className="mt-5 border-t border-[#E5E7EB] pt-4 text-center text-[13px] text-muted-foreground">
          Already completed signup?{" "}
          <Link href="/login" className="font-medium text-[#128C7E] hover:text-[#075E54]">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
