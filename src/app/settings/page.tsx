import { requireClientUser } from "@/lib/auth/client"
import { Building2, Mail, Phone, Briefcase, Hash, ShieldCheck, Edit3, MessageSquare } from "lucide-react"
import Link from "next/link"

export default async function SettingsPage() {
  const user = await requireClientUser()
  const client = user.client

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Business Settings</h1>
          <p className="text-muted-foreground text-[15px] mt-1.5 max-w-2xl">
            Manage your business profile, Meta connection, and workspace preferences in one place.
          </p>
        </div>
        <Link 
          href="/onboarding?step=1"
          className="inline-flex items-center gap-2 bg-[#128C7E] text-white hover:bg-[#075E54] px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* General Business Info Card */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300">
            <div className="p-6 sm:p-8 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50/80 text-blue-600 border border-blue-100/50">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground tracking-tight">General Information</h2>
                  <p className="text-[13px] text-muted-foreground mt-0.5">Your core business identity details.</p>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Display Name</p>
                <p className="text-[15px] font-semibold text-foreground">{client.businessName || "Not configured"}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Legal Name</p>
                <p className="text-[15px] font-semibold text-foreground">{client.businessLegalName || "Not configured"}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Business Category</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100/80 text-zinc-700 text-sm font-semibold border border-zinc-200/50">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                  {client.businessCategory || "Uncategorized"}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300">
            <div className="p-6 sm:p-8 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50/80 text-emerald-600 border border-emerald-100/50">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground tracking-tight">Contact Details</h2>
                  <p className="text-[13px] text-muted-foreground mt-0.5">Where your customers can reach you.</p>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-zinc-400"><Mail className="w-4 h-4" /></div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Business Email</p>
                  <p className="text-[15px] font-medium text-foreground mt-1">{client.businessEmail || "Not configured"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-zinc-400"><Phone className="w-4 h-4" /></div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number</p>
                  <p className="text-[15px] font-medium text-foreground mt-1">{client.phone || "Not configured"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2">
                <div className="mt-0.5 text-zinc-400"><Building2 className="w-4 h-4" /></div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Address</p>
                  <p className="text-[15px] font-medium text-foreground mt-1 max-w-lg leading-relaxed">
                    {client.businessAddress || "No address provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Meta Integration Card */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300">
            <div className="p-6 border-b border-zinc-100 bg-[#F4F6FB]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-sm">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground tracking-tight">Meta Connection</h2>
                  <p className="text-[12px] font-medium text-blue-600 mt-0.5">API Integration Status</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Meta Business ID</p>
                <div className="bg-zinc-50 border border-zinc-200/80 rounded-lg px-3 py-2.5 text-[13px] font-mono text-zinc-700 break-all select-all shadow-inner">
                  {client.metaBusinessId || "Not connected"}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Verification Status</p>
                <div className="flex items-center gap-2">
                  {client.businessVerificationStatus === "VERIFIED" ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[13px] font-bold border border-emerald-200/60 shadow-sm">
                      <ShieldCheck className="w-4 h-4" />
                      Verified Business
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[13px] font-bold border border-amber-200/60 shadow-sm">
                      <ShieldCheck className="w-4 h-4 opacity-50" />
                      Pending Verification
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">WhatsApp API</p>
                <div className="flex items-center gap-2">
                  {client.whatsappSetupStatus === "CONNECTED" ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[13px] font-bold border border-blue-200/60 shadow-sm">
                      <MessageSquare className="w-4 h-4" />
                      Connected
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-600 text-[13px] font-bold border border-zinc-200/60 shadow-sm">
                      <MessageSquare className="w-4 h-4 opacity-50" />
                      Disconnected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Profile Summary */}
          <div className="bg-zinc-900 rounded-2xl shadow-xl overflow-hidden text-zinc-100 relative group transition-transform duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
               <ShieldCheck className="w-32 h-32" />
            </div>
            <div className="p-6 relative z-10">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">Account Owner</h3>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 text-zinc-900 flex items-center justify-center font-black text-xl shadow-inner border-2 border-zinc-800 shrink-0">
                  {user.email[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[15px] truncate">{user.email}</p>
                  <p className="text-zinc-400 text-[11px] font-semibold mt-0.5 uppercase tracking-wider">Primary Administrator</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
