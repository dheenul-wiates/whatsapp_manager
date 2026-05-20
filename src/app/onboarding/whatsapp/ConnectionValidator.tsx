"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ShieldCheck, ShieldAlert, KeyRound, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react"
import { validateMetaConnection } from "@/server/actions/meta-validation"
import { Button } from "@/components/ui/button"

export function ConnectionValidator({
  initialStatus,
  hasToken,
}: Readonly<{
  initialStatus: string
  hasToken: boolean
}>) {
  const [status, setStatus] = useState(initialStatus)
  const [isValidating, setIsValidating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [autoValidationAttempted, setAutoValidationAttempted] = useState(false)

  async function handleValidate() {
    if (!hasToken) {
      toast.error("Please enter and save a Meta Permanent Access Token first.")
      return
    }

    setIsValidating(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await validateMetaConnection()
      if (res.success) {
        setStatus("CONNECTED")
        setSuccessMsg(res.message)
        toast.success("Meta API Connection Verified!")
      } else {
        setStatus("FAILED")
        setErrorMsg(res.error)
        toast.error("Connection validation failed.")
      }
    } catch (err) {
      setStatus("FAILED")
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.")
      toast.error("System error occurred during validation.")
    } finally {
      setIsValidating(false)
    }
  }

  useEffect(() => {
    if (!hasToken || status === "CONNECTED" || autoValidationAttempted) {
      return
    }

    setAutoValidationAttempted(true)
    void handleValidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken, status, autoValidationAttempted])

  return (
    <div className="mt-5 space-y-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 border border-zinc-200">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-[#111827]">Meta Connection Verification</h3>
            <p className="text-[12px] text-[#6B7280]">
              Test connectivity to Meta's Cloud API using your decrypted access token.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-[#6B7280]">Status:</span>
          {status === "CONNECTED" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Connected
            </span>
          )}
          {status === "PENDING" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
              <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
              Pending Verification
            </span>
          )}
          {status === "FAILED" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              <ShieldAlert className="h-3.5 w-3.5" />
              Failed
            </span>
          )}
          {status === "NOT_STARTED" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">
              Not Started
            </span>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="flex items-start gap-2.5 rounded-lg border border-green-200 bg-green-50/50 p-3 text-[13px] text-green-800">
          <ShieldCheck className="h-4 w-4 shrink-0 text-green-600 mt-0.5" />
          <p>{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/50 p-3 text-[13px] text-red-800">
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Verification Failed</p>
            <p className="font-mono text-xs">{errorMsg}</p>
            <p className="text-xs text-red-700 mt-1 leading-normal">
              💡 Common solutions:
              <br />
              • Check if the Access Token has active "whatsapp_business_messaging" and "whatsapp_business_management" permissions.
              <br />
              • Verify that the Phone Number ID belongs specifically to this WABA ID.
              <br />
              • Ensure the Meta Business Suite is not restricted or suspended.
            </p>
          </div>
        </div>
      )}

      {!hasToken && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <p>
            You must enter and save your <strong>Permanent Access Token</strong> above first before running a connection test.
          </p>
        </div>
      )}

      {status === "FAILED" && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleValidate}
            disabled={!hasToken || isValidating}
            className="h-9 gap-2 bg-[#111827] text-white hover:bg-[#1F2937] transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
            {isValidating ? "Verifying with Meta..." : "Test & Validate Connection"}
          </Button>
        </div>
      )}
    </div>
  )
}
