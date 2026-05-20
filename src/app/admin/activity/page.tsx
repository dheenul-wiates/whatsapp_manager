import type { Metadata } from "next"
import { requireAdmin } from "@/lib/auth/admin"
import { listAuditLogs } from "@/server/actions/admin-clients"
import { Activity } from "lucide-react"

export const metadata: Metadata = { title: "Activity" }

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

export default async function AdminActivityPage() {
  await requireAdmin()
  const logs = await listAuditLogs(100)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Activity</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">
              {logs.length} audit log entr{logs.length === 1 ? "y" : "ies"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#6B7280] text-sm">No activity yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {logs.map((log) => (
              <div key={log.id} className="px-5 py-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-[#16A34A]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111827]">
                    {formatAction(log.action)}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    {log.actorType.toLowerCase()} · {timeAgo(log.createdAt)}
                  </p>
                  <div className="mt-2 text-xs text-[#6B7280] space-y-1">
                    <p>
                      <span className="font-medium text-[#111827]">Target:</span> {log.targetType?.toLowerCase() ?? "n/a"}
                    </p>
                    {log.targetId && (
                      <p>
                        <span className="font-medium text-[#111827]">ID:</span> {log.targetId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
