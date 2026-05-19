"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ChevronDown, Check } from "lucide-react"
import { COUNTRY_CODES, splitPhoneNumber } from "@/lib/country-codes"
import { cn } from "@/lib/utils"

interface PhoneInputProps {
  id?: string
  name?: string
  defaultValue?: string
  placeholder?: string
  className?: string
  required?: boolean
}

export function PhoneInput({
  id = "phone",
  name = "phone",
  defaultValue = "",
  placeholder = "98765 43210",
  className,
  required = false,
}: PhoneInputProps) {
  const { countryCode: initialCode, localNumber: initialLocal } = splitPhoneNumber(defaultValue)

  const [selectedCode, setSelectedCode] = useState(initialCode)
  const [localNumber, setLocalNumber] = useState(initialLocal)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const containerRef = useRef<HTMLDivElement>(null)

  // Find the currently selected country metadata
  const selectedCountry = COUNTRY_CODES.find((c) => c.code === selectedCode) || COUNTRY_CODES[0]

  // Filter countries by name or dial code
  const filteredCountries = COUNTRY_CODES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.includes(searchQuery)
  )

  // Close the popup dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden input to transmit the selected country code to form actions */}
      <input type="hidden" name="phoneCountryCode" value={selectedCode} />

      {/* Premium Unified Input Container */}
      <div
        className={cn(
          "flex h-8 w-full rounded-lg border border-input bg-background text-sm transition-all focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 overflow-hidden",
          className
        )}
      >
        {/* Country Selector Trigger (inside the input) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-full items-center gap-1.5 border-r border-input bg-muted/30 px-2.5 text-foreground hover:bg-muted/50 transition-colors focus:outline-none shrink-0 cursor-pointer text-xs"
        >
          <span className="text-[14px] leading-none select-none">{selectedCountry.flag}</span>
          <span className="font-semibold text-muted-foreground">{selectedCountry.code}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground/80 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
        </button>

        {/* Local Phone Number Input Field */}
        <input
          id={id}
          name={name}
          type="tel"
          value={localNumber}
          onChange={(e) => setLocalNumber(e.target.value)}
          required={required}
          className="h-full w-full bg-transparent px-2.5 py-1 text-[#111827] placeholder:text-muted-foreground focus:outline-none text-base md:text-sm"
          placeholder={placeholder}
        />
      </div>

      {/* Floating Popover Country Selector List */}
      {isOpen && (
        <div
          className="absolute left-0 z-50 mt-1.5 w-[300px] rounded-2xl border border-[#E5E7EB] bg-white p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] animate-in fade-in-50 slide-in-from-top-1.5 duration-150"
        >
          {/* Search bar inside the popover */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by country or code..."
              className="h-9 w-full rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-3.5 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] transition-all"
              autoFocus
            />
          </div>

          {/* List of Countries */}
          <div className="max-h-[220px] overflow-y-auto pr-1 space-y-0.5 custom-scrollbar">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCode
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setSelectedCode(c.code)
                      setIsOpen(false)
                      setSearchQuery("")
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-[#E9F8EF]/60 hover:text-[#128C7E] cursor-pointer",
                      isSelected ? "bg-[#E9F8EF] font-bold text-[#128C7E]" : "text-[#374151]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] select-none">{c.flag}</span>
                      <span className="truncate max-w-[140px]">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#6B7280] font-mono text-[11px]">{c.code}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#128C7E] stroke-[3]" />}
                    </div>
                  </button>
                )
              })
            ) : (
              <p className="py-6 text-center text-xs text-[#9CA3AF]">No matching countries</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
