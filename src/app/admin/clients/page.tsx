import type { Metadata } from "next"
import Link from "next/link"
import { requireAdmin } from "@/lib/auth/admin"
import { listClients } from "@/server/actions/admin-clients"
import { Plus, Search, ChevronRight, RefreshCw, Ban } from "lucide-react"

export const metadata: Metadata = { title: "Clients" }

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    INVITED: { label: "Invited", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    ONBOARDING: { label: "Onboarding", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    ACTIVE: { label: "Active", cls: "bg-green-50 text-green-700 border-green-200" },
    SUSPENDED: { label: "Suspended", cls: "bg-red-50 text-red-700 border-red-200" },
    NOT_STARTED: { label: "Not started", cls: "bg-gray-50 text-gray-600 border-gray-200" },
    PENDING: { label: "Pending", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    VERIFIED: { label: "Verified", cls: "bg-green-50 text-green-700 border-green-200" },
    REJECTED: { label: "Rejected", cls: "bg-red-50 text-red-700 border-red-200" },
    CONNECTED: { label: "Connected", cls: "bg-green-50 text-green-700 border-green-200" },
    FAILED: { label: "Failed", cls: "bg-red-50 text-red-700 border-red-200" },
    ACTIVE_KEY: { label: "Active", cls: "bg-green-50 text-green-700 border-green-200" },
    EXPIRED_KEY: { label: "Expired", cls: "bg-orange-50 text-orange-700 border-orange-200" },
    NO_KEY: { label: "None", cls: "bg-gray-50 text-gray-500 border-gray-200" },
  }
  const config = map[status] ?? { label: status, cls: "bg-gray-50 text-gray-700 border-gray-200" }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.cls}`}>
      {config.label}
    </span>
  )
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getKeyStatus(
  keys: { status: string; expiresAt: Date }[]
): string {
  const active = keys.find((k) => k.status === "ACTIVE")
  if (!active) return "NO_KEY"
  if (new Date(active.expiresAt) < new Date()) return "EXPIRED_KEY"
  return "ACTIVE_KEY"
}

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    status?: string
    verification?: string
    setup?: string
  }>
}) {
  await requireAdmin()
  const params = await searchParams
  const clients = await listClients({
    search: params.search,
    status: params.status,
    verificationStatus: params.verification,
    setupStatus: params.setup,
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Clients</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {clients.length} client{clients.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          id="new-client-btn"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] hover:bg-[#1E293B] text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          New client
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-5 flex flex-wrap gap-3">
        <form className="flex flex-wrap gap-3 w-full">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              id="client-search"
              name="search"
              defaultValue={params.search}
              placeholder="Search by email or business name…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            id="status-filter"
            name="status"
            defaultValue={params.status}
            className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-[#111827]"
          >
            <option value="">All statuses</option>
            <option value="INVITED">Invited</option>
            <option value="ONBOARDING">Onboarding</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <select
            id="verification-filter"
            name="verification"
            defaultValue={params.verification}
            className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-[#111827]"
          >
            <option value="">All verifications</option>
            <option value="NOT_STARTED">Not started</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button
            type="submit"
            id="apply-filters-btn"
            className="px-4 py-2 text-sm font-medium bg-[#111827] text-white rounded-lg hover:bg-[#1F2937] transition-colors"
          >
            Apply
          </button>
          {(params.search || params.status || params.verification) && (
            <a
              href="/admin/clients"
              className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] border border-[#E5E7EB] rounded-lg transition-colors"
            >
              Clear
            </a>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {clients.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#6B7280] text-sm">No clients found.</p>
            <Link
              href="/admin/clients/new"
              className="inline-flex items-center gap-1.5 mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Create your first client
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Business</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Verification</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">WhatsApp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Key</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {clients.map((client) => {
                const keyStatus = getKeyStatus(client.accessKeys)
                return (
                  <tr key={client.id} className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#111827]">{client.businessName}</p>
                      <p className="text-xs text-[#6B7280]">{client.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={client.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={client.businessVerificationStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={client.whatsappSetupStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={keyStatus} />
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">
                      {formatDate(client.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          id={`view-client-${client.id}`}
                          className="p-1.5 rounded-lg hover:bg-[#E9F8EF] text-[#6B7280] hover:text-[#16A34A] transition-colors"
                          title="View details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
