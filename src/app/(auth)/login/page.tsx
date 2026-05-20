import Image from "next/image"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginClient } from "@/server/actions/client-auth"

function getErrorMessage(error?: string) {
  if (error === "suspended") return "This client account is suspended. Contact support to continue."
  if (error === "exists") return "This email already has an account. Log in to continue."
  if (error === "credentials") return "The email or password is incorrect."
  return null
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolved = await searchParams
  const errorMessage = getErrorMessage(resolved?.error)

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_30px_rgba(17,24,39,0.06)]">
        <div className="mb-7 flex flex-col items-center text-center">
          <Image src="/images/full-icon.png" alt="Convora" width={180} height={60} className="object-contain mb-4" priority />
          <h1 className="text-[20px] font-semibold leading-tight">Sign in to your account</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Access the Convora dashboard.</p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {errorMessage}
          </div>
        )}

        <form action={loginClient} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required className="h-10 bg-white" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-10 bg-white" />
          </div>
          <Button type="submit" className="h-10 w-full bg-[#25D366] text-white hover:bg-[#128C7E]">
            Log in
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between border-t border-[#E5E7EB] pt-4 text-[13px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Invited clients only
          </span>
          <Link href="/signup" className="font-medium text-[#128C7E] hover:text-[#075E54]">
            Complete signup
          </Link>
        </div>
      </div>
    </div>
  )
}
