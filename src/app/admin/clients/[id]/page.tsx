import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { requireAdmin } from "@/lib/auth/admin"
import { getClientById } from "@/server/actions/admin-clients"
import { RegenerateKeyButton, StatusToggleButton, NotesEditor } from "./ClientActions"
import { ArrowLeft, Building2, Calendar, Mail, Phone, Award, Shield, Key, History, Users, User, Activity, ExternalLink, HardDrive } from "lucide-react"

export const metadata: Metadata = { title: "Client Details — WBM Admin" }

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    INVITED: { label: "Invited", cls: "bg-blue-50/80 text-blue-700 border-blue-200/60" },
    ONBOARDING: { label: "Onboarding", cls: "bg-amber-50/80 text-amber-700 border-amber-200/60" },
    ACTIVE: { label: "Active", cls: "bg-emerald-50/80 text-emerald-700 border-emerald-200/60" },
    SUSPENDED: { label: "Suspended", cls: "bg-red-50/80 text-red-700 border-red-200/60" },
    NOT_STARTED: { label: "Not started", cls: "bg-slate-50 text-slate-600 border-slate-200/60" },
    PENDING: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200/60" },
    VERIFIED: { label: "Verified", cls: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
    REJECTED: { label: "Rejected", cls: "bg-red-50 text-red-700 border-red-200/60" },
    CONNECTED: { label: "Connected", cls: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
    FAILED: { label: "Failed", cls: "bg-red-50 text-red-700 border-red-200/60" },
  }
  const config = map[status] ?? { label: status, cls: "bg-slate-50 text-slate-700 border-slate-200/60" }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.cls}`}>
      {config.label}
    </span>
  )
}

function KeyStatusBadge({ status, expiresAt }: { status: string; expiresAt: Date }) {
  const isExpired = new Date(expiresAt) < new Date()
  if (status === "ACTIVE" && isExpired) {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-orange-50 text-orange-700 border-orange-200">Expired</span>
  }
  const map: Record<string, { label: string; cls: string }> = {
    ACTIVE: { label: "Active", cls: "bg-emerald-50/80 text-emerald-700 border-emerald-200/60" },
    USED: { label: "Used", cls: "bg-blue-50/80 text-blue-700 border-blue-200/60" },
    REVOKED: { label: "Revoked", cls: "bg-slate-50 text-slate-600 border-slate-200/60" },
    EXPIRED: { label: "Expired", cls: "bg-orange-50/80 text-orange-700 border-orange-200/60" },
  }
  const config = map[status] ?? { label: status, cls: "bg-slate-50 text-slate-700 border-slate-200/60" }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.cls}`}>
      {config.label}
    </span>
  )
}

function DetailItem({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: any }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F3F4F6] last:border-0">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-[#9CA3AF]" />}
        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-semibold text-[#111827]">
        {value ?? <span className="text-[#9CA3AF] font-normal">—</span>}
      </span>
    </div>
  )
}

function formatDate(d: Date | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const client = await getClientById(id)
  if (!client) notFound()

  const activeKey = client.accessKeys.find((k) => k.status === "ACTIVE")

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Breadcrumb Back */}
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to clients
      </Link>

      {/* Hero Header */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#111827] tracking-tight">{client.businessName}</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">{client.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Account Status</span>
          <StatusBadge status={client.status} />
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns - Detailed Metrics & Keys (2/3 Span) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Onboarding & Integration Status */}
          <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-2 mb-6 border-b border-[#F3F4F6] pb-3.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h2 className="text-[15px] font-bold text-[#111827]">Meta Onboarding Progress</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-4 flex justify-between items-center">
                <div>
                  <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">Business Verification</p>
                  <span className="text-[13px] font-semibold text-[#111827]">Meta Platform</span>
                </div>
                <StatusBadge status={client.businessVerificationStatus} />
              </div>

              <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-4 flex justify-between items-center">
                <div>
                  <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">WhatsApp Cloud Setup</p>
                  <span className="text-[13px] font-semibold text-[#111827]">API Connections</span>
                </div>
                <StatusBadge status={client.whatsappSetupStatus} />
              </div>
            </div>

            {/* Meta secrets display */}
            {client.metaBusinessId ? (
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-5 space-y-3">
                <p className="text-xs font-bold text-[#374151] uppercase tracking-wider border-b border-[#E5E7EB] pb-2 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  Active API Handshake Identifiers
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
                  <div>
                    <span className="block text-[#6B7280] mb-0.5">Meta Business ID</span>
                    <code className="font-mono text-[#111827] bg-white px-2 py-1 border border-[#E5E7EB] rounded block truncate select-all">{client.metaBusinessId}</code>
                  </div>
                  <div>
                    <span className="block text-[#6B7280] mb-0.5">WABA ID</span>
                    <code className="font-mono text-[#111827] bg-white px-2 py-1 border border-[#E5E7EB] rounded block truncate select-all">{client.whatsappBusinessAccountId}</code>
                  </div>
                  <div>
                    <span className="block text-[#6B7280] mb-0.5">Phone ID</span>
                    <code className="font-mono text-[#111827] bg-white px-2 py-1 border border-[#E5E7EB] rounded block truncate select-all">{client.phoneNumberId}</code>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  🔒 No Meta Business credentials submitted yet. API identifiers will populate automatically when the client links their WhatsApp account.
                </p>
              </div>
            )}
          </section>

          {/* Access Key Section */}
          <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-2 mb-6 border-b border-[#F3F4F6] pb-3.5">
              <Key className="w-4 h-4 text-emerald-600" />
              <h2 className="text-[15px] font-bold text-[#111827]">Secure Access Tokens</h2>
            </div>

            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-5 mb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Active Token State</p>
                {activeKey ? (
                  <div className="flex items-center gap-2.5">
                    <KeyStatusBadge status={activeKey.status} expiresAt={activeKey.expiresAt} />
                    <span className="text-xs text-[#6B7280]">
                      Expires: {formatDate(activeKey.expiresAt)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-[#DC2626] font-medium">No active invitation keys.</span>
                )}
              </div>
              <RegenerateKeyButton clientId={client.id} />
            </div>

            {/* Key History */}
            {client.accessKeys.length > 0 && (
              <div className="space-y-3.5">
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Key Handshake History</p>
                </div>
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#E5E7EB] text-[#6B7280] font-semibold">
                        <th className="px-4 py-2.5">Key Status</th>
                        <th className="px-4 py-2.5">Expiry Threshold</th>
                        <th className="px-4 py-2.5">Consumption Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {client.accessKeys.map((k) => (
                        <tr key={k.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5">
                            <KeyStatusBadge status={k.status} expiresAt={k.expiresAt} />
                          </td>
                          <td className="px-4 py-2.5 text-[#6B7280] font-mono">
                            {formatDate(k.expiresAt)}
                          </td>
                          <td className="px-4 py-2.5 text-[#6B7280]">
                            {k.usedAt ? (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-medium">
                                Used: {formatDate(k.usedAt)}
                              </span>
                            ) : (
                              <span className="text-[#9CA3AF]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* Client Users / Associated accounts */}
          <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-2 mb-5 border-b border-[#F3F4F6] pb-3.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <h2 className="text-[15px] font-bold text-[#111827]">Associated Accounts ({client.users.length})</h2>
            </div>
            
            {client.users.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-xs text-[#6B7280]">No user accounts registered yet. The client user profile is created when they sign up with the invitation key.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {client.users.map((user) => (
                  <div key={user.id} className="border border-[#E5E7EB] p-4 rounded-xl shadow-sm flex items-center gap-3 bg-white">
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-700 uppercase">
                      {user.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#111827] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#6B7280] truncate">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column - Profile Info, Actions, Notes (1/3 Span) */}
        <div className="space-y-6">
          {/* Plan Profile Metadata */}
          <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <h3 className="text-xs font-bold text-[#374151] uppercase tracking-wider border-b border-[#F3F4F6] pb-3 mb-1">Contract Parameters</h3>
            <DetailItem label="Contract Owner" value={client.name} icon={User} />
            <DetailItem label="Contact Email" value={client.email} icon={Mail} />
            <DetailItem label="Contact Phone" value={client.phone} icon={Phone} />
            <DetailItem label="Service Tier Plan" value={client.plan ? client.plan : "Starter Package"} icon={Award} />
            <DetailItem label="Contract Created" value={formatDate(client.createdAt)} icon={Calendar} />
          </section>

          {/* Administrative Control Unit */}
          <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <h3 className="text-xs font-bold text-[#374151] uppercase tracking-wider border-b border-[#F3F4F6] pb-3 mb-4 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Administrative Security Actions
            </h3>
            <StatusToggleButton clientId={client.id} currentStatus={client.status} />
          </section>

          {/* Internal Memo Notes */}
          <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <h3 className="text-xs font-bold text-[#374151] uppercase tracking-wider border-b border-[#F3F4F6] pb-3 mb-4">Internal Admin Memo</h3>
            <NotesEditor clientId={client.id} initialNotes={client.notes} />
          </section>
        </div>
      </div>
    </div>
  )
}
