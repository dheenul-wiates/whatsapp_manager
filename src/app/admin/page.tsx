import type { Metadata } from "next"
import Link from "next/link"
import { requireAdmin } from "@/lib/auth/admin"
import { getAdminDashboardStats } from "@/server/actions/admin-clients"
import {
  Users,
  UserCheck,
  UserX,
  Mail,
  Key,
  Plus,
  ChevronRight,
  Activity,
} from "lucide-react"

export const metadata: Metadata = { title: "Dashboard" }

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  icon: React.ElementType
  accent: string
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[#6B7280] font-medium">{label}</p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: accent + "1A" }}
        >
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#111827]">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    INVITED: {
      label: "Invited",
      cls: "bg-blue-50 text-blue-700 border-blue-200",
    },
    ONBOARDING: {
      label: "Onboarding",
      cls: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    ACTIVE: {
      label: "Active",
      cls: "bg-green-50 text-green-700 border-green-200",
    },
    SUSPENDED: {
      label: "Suspended",
      cls: "bg-red-50 text-red-700 border-red-200",
    },
  }
  const config = map[status] ?? {
    label: status,
    cls: "bg-gray-50 text-gray-700 border-gray-200",
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.cls}`}
    >
      {config.label}
    </span>
  )
}

function formatAction(action: string) {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default async function AdminDashboardPage() {
  await requireAdmin()
  const stats = await getAdminDashboardStats()
  const recentClients = stats.recentClients.slice(0, 5)
  const recentAudit = stats.recentAudit.slice(0, 5)
  const hasMoreClients = stats.recentClients.length > 5
  const hasMoreActivity = stats.recentAudit.length > 5

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Dashboard</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Platform overview and recent activity
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          id="create-client-btn"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] hover:bg-[#1E293B] text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create client
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Total clients"
          value={stats.total}
          icon={Users}
          accent="#2563EB"
        />
        <StatCard
          label="Invited"
          value={stats.invited}
          icon={Mail}
          accent="#F59E0B"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={UserCheck}
          accent="#16A34A"
        />
        <StatCard
          label="Suspended"
          value={stats.suspended}
          icon={UserX}
          accent="#DC2626"
        />
        <StatCard
          label="Expired keys"
          value={stats.expiredKeys}
          icon={Key}
          accent="#6B7280"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Recent clients */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#111827]">
              Recent clients
            </h2>
            {hasMoreClients && (
              <Link
                href="/admin/clients"
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                View all
              </Link>
            )}
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {stats.recentClients.length === 0 && (
              <p className="px-5 py-8 text-sm text-[#6B7280] text-center">
                No clients yet
              </p>
            )}
            {recentClients.map((client) => (
              <Link
                key={client.id}
                href={`/admin/clients/${client.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-[#F7F8FA] transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#111827] truncate">
                    {client.businessName}
                  </p>
                  <p className="text-xs text-[#6B7280] truncate">{client.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <StatusBadge status={client.status} />
                  <ChevronRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#6B7280] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Audit log */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#6B7280]" />
              <h2 className="text-sm font-semibold text-[#111827]">
                Recent activity
              </h2>
            </div>
            {hasMoreActivity && (
              <Link
                href="/admin/activity"
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                View all
              </Link>
            )}
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {stats.recentAudit.length === 0 && (
              <p className="px-5 py-8 text-sm text-[#6B7280] text-center">
                No activity yet
              </p>
            )}
            {recentAudit.map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E9F8EF] flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Activity className="w-3 h-3 text-[#16A34A]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#111827]">
                    {formatAction(log.action)}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {log.actorType.toLowerCase()} ·{" "}
                    {timeAgo(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
