"use client"

import { useState } from "react"
import {
  regenerateClientKey,
  updateClientStatus,
  updateClientNotes,
} from "@/server/actions/admin-clients"
import type {
  RegenerateKeyResult,
  UpdateClientStatusResult,
} from "@/server/actions/admin-clients"
import { Copy, Check, RefreshCw, Ban, UserCheck, Save } from "lucide-react"

// ── Regenerate Key ────────────────────────────────────────────────────────────
export function RegenerateKeyButton({ clientId }: { clientId: string }) {
  const [result, setResult] = useState<RegenerateKeyResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleRegenerate() {
    if (!confirmed) {
      setConfirmed(true)
      return
    }
    setLoading(true)
    const res = await regenerateClientKey(clientId)
    setResult(res)
    setLoading(false)
    setConfirmed(false)
  }

  async function copyKey(key: string) {
    await navigator.clipboard.writeText(key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (result?.success) {
    return (
      <div className="mt-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-4 w-full">
        <p className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-2 uppercase tracking-wide">
          New Token — Copy Immediately
        </p>
        <div className="flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-lg p-2.5 shadow-inner">
          <code className="flex-1 text-sm font-mono font-bold text-[#111827] tracking-wider select-all">
            {result.accessKey}
          </code>
          <button
            type="button"
            id="copy-regen-key-btn"
            onClick={() => copyKey(result.accessKey)}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-100 text-[#6B7280] hover:text-[#111827] border border-transparent hover:border-[#E5E7EB] transition-all"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-amber-700 bg-amber-50/50 border border-amber-200/60 rounded-xl px-3.5 py-2 mt-3">
          ⚠️ All previous active keys for this client have been revoked. This token will only expire in 7 days.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {confirmed && (
        <p className="text-xs text-amber-800 bg-amber-50/80 border border-amber-200/60 rounded-xl px-3 py-2 animate-in fade-in duration-200">
          This immediately revokes all current credentials. Click again to confirm.
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          id="regen-key-btn"
          onClick={handleRegenerate}
          disabled={loading}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${
            confirmed
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "border border-[#E5E7EB] bg-white text-[#374151] hover:text-[#111827] hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Generating…" : confirmed ? "Confirm Revocation" : "Regenerate key"}
        </button>
        {confirmed && (
          <button
            type="button"
            onClick={() => setConfirmed(false)}
            className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

// ── Suspend / Reactivate ──────────────────────────────────────────────────────
export function StatusToggleButton({
  clientId,
  currentStatus,
}: {
  clientId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const isSuspended = currentStatus === "SUSPENDED"

  async function handle() {
    if (!confirmed) {
      setConfirmed(true)
      return
    }
    setLoading(true)
    const res = await updateClientStatus(
      clientId,
      isSuspended ? "ACTIVE" : "SUSPENDED"
    )
    setLoading(false)
    setConfirmed(false)
    if (res.success) {
      window.location.reload()
    }
  }

  return (
    <div className="space-y-3">
      {confirmed && (
        <p className="text-[12px] text-red-800 bg-red-50/70 border border-red-200/60 rounded-xl p-3 animate-in fade-in duration-200 leading-normal">
          {isSuspended
            ? "This will restore service and dashboard access immediately for this client account."
            : "This will suspend this client. They will be immediately blocked from dashboard login and Meta webhook handlers."}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          id="status-toggle-btn"
          onClick={handle}
          disabled={loading}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${
            isSuspended
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : confirmed
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "border border-red-200 bg-red-50/20 text-red-600 hover:bg-red-50 hover:text-red-700"
          }`}
        >
          {isSuspended ? (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              {loading ? "Reactivating…" : "Reactivate account"}
            </>
          ) : (
            <>
              <Ban className="w-3.5 h-3.5" />
              {loading
                ? "Suspending…"
                : confirmed
                ? "Confirm suspension"
                : "Suspend client"}
            </>
          )}
        </button>
        {confirmed && (
          <button
            type="button"
            onClick={() => setConfirmed(false)}
            className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] px-2 py-1 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

// ── Notes editor ──────────────────────────────────────────────────────────────
export function NotesEditor({
  clientId,
  initialNotes,
}: {
  clientId: string
  initialNotes: string | null
}) {
  const [notes, setNotes] = useState(initialNotes ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await updateClientNotes(clientId, notes)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3">
      <textarea
        id="admin-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-slate-50/50 resize-none shadow-inner"
        placeholder="Internal notes about billing, custom Meta scope settings, contact timeline..."
      />
      <button
        type="button"
        id="save-notes-btn"
        onClick={handleSave}
        disabled={saving}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-[#111827] hover:bg-[#1E293B] text-white rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
      >
        {saved ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" /> Notes saved!
          </>
        ) : (
          <>
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving memo..." : "Save internal memo"}
          </>
        )}
      </button>
    </div>
  )
}
