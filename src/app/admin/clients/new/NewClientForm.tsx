"use client"

import { useActionState, useState } from "react"
import { createClient } from "@/server/actions/admin-clients"
import type { CreateClientResult } from "@/server/actions/admin-clients"
import { Copy, Check, ArrowLeft, Shield, Key, CheckCircle, Mail, Building, User, Phone, Award, FileText } from "lucide-react"
import Link from "next/link"
import { PhoneInput } from "@/components/ui/phone-input"

type State = CreateClientResult | null

async function createClientAction(
  _prev: State,
  formData: FormData
): Promise<State> {
  return createClient(formData)
}

export default function NewClientForm() {
  const [state, formAction, pending] = useActionState(createClientAction, null)
  const [copied, setCopied] = useState(false)

  async function copyKey(key: string) {
    await navigator.clipboard.writeText(key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (state?.success) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to clients
        </Link>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_15px_40px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Header Accent */}
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />
          
          <div className="p-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 mx-auto mb-5 shadow-sm">
              <CheckCircle className="w-7 h-7 text-emerald-600 animate-in zoom-in-50 duration-300" />
            </div>
            
            <h2 className="text-[22px] font-semibold text-[#111827] text-center mb-1.5">
              Client invitation created!
            </h2>
            <p className="text-[13px] text-[#6B7280] text-center mb-6 max-w-md mx-auto">
              A secure activation workspace is ready. Deliver the credentials key below to the client to begin onboarding.
            </p>

            {/* Key display card */}
            <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-5 mb-5 relative group">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  One-Time Access Token
                </span>
                <span className="text-[11px] text-muted-foreground">Expires in 7 days</span>
              </div>
              
              <div className="flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-sm">
                <code className="flex-1 text-[16px] font-mono font-bold text-[#111827] tracking-wider select-all">
                  {state.accessKey}
                </code>
                <button
                  type="button"
                  id="copy-key-btn"
                  onClick={() => copyKey(state.accessKey)}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827] transition-all border border-transparent hover:border-[#E5E7EB]"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 mb-8 flex gap-3">
              <span className="text-lg">⚠️</span>
              <p className="text-[12px] text-amber-800 leading-normal">
                This token is salted and hashed before database storage. It will <strong className="text-amber-900 font-semibold">never</strong> be displayed again. Make sure to copy it now.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/admin/clients/${state.clientId}`}
                id="view-created-client-btn"
                className="flex-1 text-center py-2.5 text-sm font-semibold border border-[#E5E7EB] rounded-xl hover:bg-[#F9FAFB] text-[#374151] hover:text-[#111827] transition-colors"
              >
                Go to client profile
              </Link>
              <Link
                href="/admin/clients/new"
                id="create-another-btn"
                className="flex-1 text-center py-2.5 text-sm font-semibold bg-[#111827] hover:bg-[#1E293B] text-white rounded-xl shadow-sm transition-all"
              >
                Create another client
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to clients
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Create client invite</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Add a client to the platform to generate a secure activation bridge.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Info panel - 2 columns wide on large screens */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#111827] text-white rounded-2xl p-6 shadow-md border border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 mb-4 border border-slate-700">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-[16px] font-semibold mb-1">Administrative security</h2>
            <p className="text-[12.5px] text-slate-400 leading-relaxed mb-4">
              Meta access tokens and credentials remain strictly isolated. Clients submit their secrets privately during their step-by-step onboarding flow.
            </p>

            <div className="border-t border-slate-800 pt-4 space-y-3.5">
              <div className="flex gap-3 items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold mt-0.5">
                  1
                </span>
                <div>
                  <p className="text-[12px] font-medium text-slate-200">Register business details</p>
                  <p className="text-[11px] text-slate-400">Initialize the client database record</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold mt-0.5">
                  2
                </span>
                <div>
                  <p className="text-[12px] font-medium text-slate-200">Generate activation key</p>
                  <p className="text-[11px] text-slate-400">A high-entropy token is auto-created</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold mt-0.5">
                  3
                </span>
                <div>
                  <p className="text-[12px] font-medium text-slate-200">Private setup</p>
                  <p className="text-[11px] text-slate-400">Client sets up their password & APIs</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-5">
            <div className="flex items-center gap-2 text-emerald-800 font-medium text-[13px] mb-1">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>Invite code mechanics</span>
            </div>
            <p className="text-[12px] text-[#6B7280] leading-relaxed">
              Upon submission, a unique code prefix matching <code className="bg-[#E5E7EB] px-1 py-0.5 rounded font-mono text-[11px] text-[#111827]">WBM-XXXX-...</code> is returned. Send this code to the client along with their sign-up email.
            </p>
          </div>
        </div>

        {/* Form panel - 3 columns wide on large screens */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-6">
            {state && !state.success && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Address */}
                <div className="md:col-span-1 space-y-1.5">
                  <label
                    htmlFor="email"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#374151] uppercase tracking-wider"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    Client Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition bg-white shadow-inner"
                    placeholder="client@example.com"
                  />
                </div>

                {/* Business Name */}
                <div className="md:col-span-1 space-y-1.5">
                  <label
                    htmlFor="businessName"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#374151] uppercase tracking-wider"
                  >
                    <Building className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition bg-white shadow-inner"
                    placeholder="Acme Corporation"
                  />
                </div>

                {/* Contact Name */}
                <div className="md:col-span-1 space-y-1.5">
                  <label
                    htmlFor="name"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#374151] uppercase tracking-wider"
                  >
                    <User className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    Contact Person <span className="text-[#9CA3AF] text-[10px] font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition bg-white"
                    placeholder="John Doe"
                  />
                </div>

                {/* Phone Number */}
                <div className="md:col-span-1 space-y-1.5">
                  <label
                    htmlFor="phone"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#374151] uppercase tracking-wider"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    Phone Number <span className="text-[#9CA3AF] text-[10px] font-normal normal-case">(optional)</span>
                  </label>
                  <PhoneInput id="phone" name="phone" placeholder="98765 43210" className="h-[42px] rounded-xl border-[#E5E7EB]" />
                </div>

                {/* Plan / Package */}
                <div className="md:col-span-2 space-y-1.5">
                  <label
                    htmlFor="plan"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#374151] uppercase tracking-wider"
                  >
                    <Award className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    Tier / Pricing Plan <span className="text-[#9CA3AF] text-[10px] font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    id="plan"
                    name="plan"
                    type="text"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition bg-white"
                    placeholder="E.g., Starter, Professional, Enterprise"
                  />
                </div>

                {/* Internal Notes */}
                <div className="md:col-span-2 space-y-1.5">
                  <label
                    htmlFor="notes"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#374151] uppercase tracking-wider"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    Internal Admin Notes <span className="text-[#9CA3AF] text-[10px] font-normal normal-case">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition bg-white resize-none"
                    placeholder="Record notes about contract limits, specific requirements..."
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  id="create-client-submit"
                  disabled={pending}
                  className="w-full md:w-auto px-6 py-2.5 bg-[#111827] hover:bg-[#1E293B] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {pending ? "Generating keys..." : "Create client & invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
