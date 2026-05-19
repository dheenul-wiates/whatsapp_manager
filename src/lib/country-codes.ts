export interface CountryCode {
  code: string
  name: string
  flag: string
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+971", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", name: "Qatar", flag: "🇶🇦" },
  { code: "+968", name: "Oman", flag: "🇴🇲" },
  { code: "+973", name: "Bahrain", flag: "🇧🇭" },
  { code: "+965", name: "Kuwait", flag: "🇰🇼" },
  { code: "+94", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "+84", name: "Vietnam", flag: "🇻🇳" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "+41", name: "Switzerland", flag: "🇨🇭" },
  { code: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "+254", name: "Kenya", flag: "🇰🇪" },
  { code: "+353", name: "Ireland", flag: "🇮🇪" },
  { code: "+64", name: "New Zealand", flag: "🇳🇿" },
  { code: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "+90", name: "Turkey", flag: "🇹🇷" },
  { code: "+30", name: "Greece", flag: "🇬🇷" },
  { code: "+351", name: "Portugal", flag: "🇵🇹" },
  { code: "+32", name: "Belgium", flag: "🇧🇪" },
  { code: "+43", name: "Austria", flag: "🇦🇹" },
  { code: "+45", name: "Denmark", flag: "🇩🇰" },
  { code: "+47", name: "Norway", flag: "🇳🇴" },
  { code: "+358", name: "Finland", flag: "🇫🇮" },
  { code: "+380", name: "Ukraine", flag: "🇺🇦" },
  { code: "+48", name: "Poland", flag: "🇵🇱" },
  { code: "+40", name: "Romania", flag: "🇷🇴" },
  { code: "+385", name: "Croatia", flag: "🇭🇷" },
  { code: "+354", name: "Iceland", flag: "🇮🇸" },
  { code: "+962", name: "Jordan", flag: "🇯🇴" },
  { code: "+961", name: "Lebanon", flag: "🇱🇧" },
  { code: "+963", name: "Syria", flag: "🇸🇾" },
  { code: "+964", name: "Iraq", flag: "🇮🇶" },
  { code: "+967", name: "Yemen", flag: "🇾🇪" },
  { code: "+972", name: "Israel", flag: "🇮🇱" },
  { code: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "+56", name: "Chile", flag: "🇨🇱" },
  { code: "+57", name: "Colombia", flag: "🇨🇴" },
  { code: "+51", name: "Peru", flag: "🇵🇪" },
  { code: "+58", name: "Venezuela", flag: "🇻🇪" },
  { code: "+593", name: "Ecuador", flag: "🇪🇨" },
  { code: "+591", name: "Bolivia", flag: "🇧🇴" },
  { code: "+595", name: "Paraguay", flag: "🇵🇾" },
  { code: "+598", name: "Uruguay", flag: "🇺🇾" },
  { code: "+506", name: "Costa Rica", flag: "🇨🇷" },
  { code: "+507", name: "Panama", flag: "🇵🇦" },
  { code: "+212", name: "Morocco", flag: "🇲🇦" },
  { code: "+213", name: "Algeria", flag: "🇩🇿" },
  { code: "+216", name: "Tunisia", flag: "🇹🇳" },
  { code: "+218", name: "Libya", flag: "🇱🇾" },
  { code: "+249", name: "Sudan", flag: "🇸🇩" },
  { code: "+251", name: "Ethiopia", flag: "🇪🇹" },
  { code: "+255", name: "Tanzania", flag: "🇹🇿" },
  { code: "+256", name: "Uganda", flag: "🇺🇬" },
  { code: "+263", name: "Zimbabwe", flag: "🇿🇼" },
  { code: "+233", name: "Ghana", flag: "🇬🇭" },
  { code: "+225", name: "Ivory Coast", flag: "🇨🇮" },
  { code: "+221", name: "Senegal", flag: "🇸🇳" },
  { code: "+244", name: "Angola", flag: "🇦🇴" },
]

/**
 * Splits a full E.164 phone number into its country code prefix and the local number.
 * Defaults to the first matching long-prefix to avoid short prefix collisions (e.g. +971 matching +9).
 */
export function splitPhoneNumber(fullNumber?: string | null): { countryCode: string; localNumber: string } {
  if (!fullNumber) {
    return { countryCode: "+91", localNumber: "" } // default to +91 (India)
  }

  const trimmed = fullNumber.trim()
  if (!trimmed.startsWith("+")) {
    return { countryCode: "+91", localNumber: trimmed }
  }

  // Sort country codes by length descending to match longest code first (e.g., +971 before +9)
  const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length)

  for (const c of sortedCodes) {
    if (trimmed.startsWith(c.code)) {
      return {
        countryCode: c.code,
        localNumber: trimmed.slice(c.code.length),
      }
    }
  }

  // Fallback if no matching code found but starts with "+"
  const matches = trimmed.match(/^(\+\d{1,4})(.*)$/)
  if (matches) {
    return { countryCode: matches[1], localNumber: matches[2] }
  }

  return { countryCode: "+91", localNumber: trimmed }
}

/**
 * Combines country code and local phone number into a clean E.164 format.
 */
export function combinePhoneNumber(countryCode: string, localNumber: string): string {
  const cleanLocal = localNumber.trim().replace(/^0+/, "") // strip leading zeroes
  if (!cleanLocal) return ""
  
  if (cleanLocal.startsWith("+")) return cleanLocal // already full format
  
  const cleanCode = countryCode.trim().startsWith("+") ? countryCode.trim() : `+${countryCode.trim()}`
  return `${cleanCode}${cleanLocal}`
}
