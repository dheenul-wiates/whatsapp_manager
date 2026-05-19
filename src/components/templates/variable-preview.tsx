"use client"

import { useEffect, useMemo, useState } from "react"
import { MessageCircle, Link2, Phone, CornerDownLeft, Wifi, BatteryFull, Signal } from "lucide-react"
import type { TemplateButton } from "@/lib/validations/template"

interface VariablePreviewProps {
  body: string
  samples?: string[]
  buttons?: TemplateButton[]
}

function formatPreviewTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

export function VariablePreview({ body, samples = [], buttons = [] }: VariablePreviewProps) {
  const [currentTime, setCurrentTime] = useState(() => formatPreviewTime(new Date()))

  useEffect(() => {
    const updateTime = () => setCurrentTime(formatPreviewTime(new Date()))
    updateTime()

    const interval = window.setInterval(updateTime, 30_000)
    return () => window.clearInterval(interval)
  }, [])

  const previewBody = useMemo(() => {
    let result = body || ""
    const matches = result.match(/\{\{(\d+)\}\}/g) || []
    for (const match of Array.from(new Set(matches))) {
      const num = parseInt(match.replace(/[{}]/g, ""))
      const sample = samples[num - 1]
      result = result.replace(
        new RegExp(match.replace(/([{}])/g, "\\$1"), "g"),
        sample ? `__SAMPLE_START__${sample}__SAMPLE_END__` : match
      )
    }
    return result
  }, [body, samples])

  const isEmpty = !body.trim()
  const hasButtons = buttons.length > 0

  return (
    <div className="rounded-2xl bg-white ring-1 ring-zinc-900/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden">

      {/* Panel header */}
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
        </div>
        <span className="text-[13px] font-semibold text-foreground">Live Preview</span>
        <span className="ml-auto text-[11px] text-muted-foreground bg-zinc-100 px-2 py-0.5 rounded-full">
          WhatsApp
        </span>
      </div>

      {/* Phone frame */}
      <div className="bg-zinc-100 px-3 pt-3 pb-4">
        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.10)] ring-1 ring-zinc-200">

          {/* Status bar */}
            <div className="bg-[#075E54] px-3 pt-2.5 pb-1.5">
              <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-white/80 font-medium">{currentTime}</span>
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3 text-white/80" />
                <Wifi className="w-3 h-3 text-white/80" />
                <BatteryFull className="w-3.5 h-3 text-white/80" />
              </div>
            </div>
            {/* Chat header */}
            <div className="flex items-center gap-2 pb-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-white text-[10px] font-bold">B</span>
              </div>
              <div>
                <p className="text-white text-[11px] font-semibold leading-none">Business</p>
                <p className="text-white/60 text-[9px] mt-0.5">online</p>
              </div>
            </div>
          </div>

          {/* Chat area */}
          <div
            className="px-3 py-3 min-h-[180px] flex flex-col justify-end"
            style={{
              background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\"), #e5ddd5",
            }}
          >
            {isEmpty ? (
              <p className="text-center text-[11px] text-zinc-400 py-4">
                Start typing to see preview…
              </p>
            ) : (
              <div className="max-w-[90%] self-start">
                {/* Message bubble */}
                <div className="bg-white rounded-xl rounded-tl-sm shadow-[0_1px_2px_rgba(0,0,0,0.13)] overflow-hidden">
                  <div className="px-3 pt-2.5 pb-1.5">
                    <PreviewText text={previewBody} />
                    <div className="flex justify-end mt-1">
                      <span className="text-[10px] text-zinc-400">{currentTime}</span>
                    </div>
                  </div>

                  {/* Buttons inside bubble */}
                  {hasButtons && (
                    <div className="border-t border-zinc-100 divide-y divide-zinc-100">
                      {buttons.map((btn, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium text-[#0088cc]"
                        >
                          {btn.type === "URL" && <Link2 className="w-3 h-3" />}
                          {btn.type === "PHONE_NUMBER" && <Phone className="w-3 h-3" />}
                          {btn.type === "QUICK_REPLY" && <CornerDownLeft className="w-3 h-3" />}
                          <span>
                            {btn.text || (
                              <span className="text-zinc-400 italic text-[11px]">Button text</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="bg-zinc-50 border-t border-zinc-100 px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-white rounded-full h-7 border border-zinc-200 px-3 flex items-center">
              <span className="text-[10px] text-zinc-400">Message</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
              <span className="text-white text-[10px]">↑</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sample values legend */}
      {samples.some(Boolean) && (
        <div className="px-4 py-3 border-t border-zinc-100 space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Sample values
          </p>
          <div className="flex flex-wrap gap-1.5">
            {samples.map((s, i) =>
              s ? (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md"
                >
                  <span className="font-mono opacity-60">{`{{${i + 1}}}`}</span>
                  <span className="font-medium">{s}</span>
                </span>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PreviewText({ text }: { text: string }) {
  const parts = text.split(/(\_\_SAMPLE_START\_\_.*?\_\_SAMPLE_END\_\_)/g)
  return (
    <p className="text-[13px] whitespace-pre-wrap leading-relaxed text-zinc-800">
      {parts.map((part, i) => {
        if (part.startsWith("__SAMPLE_START__")) {
          const value = part.replace(/__SAMPLE_START__|__SAMPLE_END__/g, "")
          return (
            <mark key={i} className="bg-amber-100 text-amber-800 rounded px-0.5 not-italic">
              {value}
            </mark>
          )
        }
        return part
      })}
    </p>
  )
}
