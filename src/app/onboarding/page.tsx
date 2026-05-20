import Link from "next/link"
import { Building2, CheckCircle2, KeyRound, MessageSquare, ShieldCheck, ArrowRight, HelpCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { requireClientUser } from "@/lib/auth/client"
import { saveBusinessDetails, saveWhatsappDetails, verifyMetaBusiness, finishOnboarding, clearBusinessDetails, clearWhatsappDetails, clearValidationStep, clearAllOnboarding } from "@/server/actions/client-onboarding"
import { PhoneInput } from "@/components/ui/phone-input"
import { COUNTRY_CODES } from "@/lib/country-codes"
import { ConnectionValidator } from "./whatsapp/ConnectionValidator"
import { cn } from "@/lib/utils"

function complete(value?: string | null) {
  return Boolean(value && value.trim().length > 0)
}

const META_BUSINESS_CATEGORIES = [
  { value: "RETAIL", label: "Retail & E-Commerce" },
  { value: "APPAREL", label: "Clothing & Apparel" },
  { value: "BEAUTY", label: "Beauty, Spa & Salon" },
  { value: "EDU", label: "Education" },
  { value: "FINANCE", label: "Finance & Banking" },
  { value: "HEALTH", label: "Healthcare & Wellness" },
  { value: "PROF_SERVICES", label: "Professional Services" },
  { value: "RESTAURANT", label: "Restaurant / Food Service" },
  { value: "TRAVEL", label: "Travel & Tourism" },
  { value: "HOTEL", label: "Hotel & Lodging" },
  { value: "AUTO", label: "Automotive" },
  { value: "GROCERY", label: "Grocery" },
  { value: "EVENT_PLAN", label: "Event Planning & Service" },
  { value: "ENTERTAIN", label: "Entertainment" },
  { value: "GOVT", label: "Government" },
  { value: "NONPROFIT", label: "Nonprofit / NGO" },
  { value: "ALCOHOL", label: "Alcohol / Beverage" },
  { value: "ONLINE_GAMBLING", label: "Online Gambling" },
  { value: "PHYSICAL_GAMBLING", label: "Physical Gambling" },
  { value: "OTC_DRUGS", label: "OTC Drugs" },
  { value: "MATRIMONY_SERVICE", label: "Matrimony Services" },
  { value: "OTHER", label: "Other" },
]

function getCategoryDefaultValue(val?: string | null) {
  if (!val) return "OTHER"
  const upper = val.toUpperCase().trim()
  
  const found = META_BUSINESS_CATEGORIES.find(c => c.value === upper)
  if (found) return found.value

  if (upper.includes("RETAIL") || upper.includes("COMMERCE")) return "RETAIL"
  if (upper.includes("CLOTH") || upper.includes("APPAREL")) return "APPAREL"
  if (upper.includes("BEAUTY") || upper.includes("SALON") || upper.includes("SPA")) return "BEAUTY"
  if (upper.includes("EDU") || upper.includes("SCHOOL") || upper.includes("COACH")) return "EDU"
  if (upper.includes("FIN") || upper.includes("BANK")) return "FINANCE"
  if (upper.includes("HEALTH") || upper.includes("MED") || upper.includes("CLINIC")) return "HEALTH"
  if (upper.includes("PROF") || upper.includes("CONSULT")) return "PROF_SERVICES"
  if (upper.includes("REST") || upper.includes("FOOD")) return "RESTAURANT"
  if (upper.includes("TRAV") || upper.includes("TOUR")) return "TRAVEL"
  if (upper.includes("HOTEL") || upper.includes("STAY")) return "HOTEL"
  if (upper.includes("AUTO")) return "AUTO"
  if (upper.includes("GROC")) return "GROCERY"
  
  return "OTHER"
}

function getCountryDefaultValue(val?: string | null) {
  if (!val) return "India"
  const trimmed = val.trim().toLowerCase()
  const found = COUNTRY_CODES.find(c => c.name.toLowerCase() === trimmed)
  if (found) return found.name
  return val
}

interface ChecklistItemProps {
  done: boolean
  title: string
  detail: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  stepLabel: string
}

function ChecklistItem({
  done,
  title,
  detail,
  href,
  icon: Icon,
  stepLabel,
}: ChecklistItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-4 rounded-xl border p-3.5 transition-all duration-200 select-none",
        done
          ? "border-emerald-100/80 bg-[#E9F8EF]/20 hover:bg-[#E9F8EF]/40 opacity-90"
          : "border-zinc-200 bg-white hover:border-[#25D366]/40 hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      <div className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg transition-colors shrink-0",
        done ? "bg-emerald-100/60 text-[#128C7E]" : "bg-zinc-100 text-zinc-500 group-hover:bg-emerald-50 group-hover:text-[#128C7E]"
      )}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/60">{stepLabel}</span>
          {done && (
            <span className="inline-flex items-center text-[9px] font-bold text-[#128C7E] bg-emerald-100/50 px-1.5 py-0.5 rounded-full">
              Completed
            </span>
          )}
        </div>
        <h3 className="text-xs font-bold text-foreground mt-0.5">{title}</h3>
        <p className="text-[11px] text-muted-foreground leading-normal mt-0.5 group-hover:text-foreground/80 transition-colors">{detail}</p>
      </div>

      <div className="shrink-0 pl-2">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-[#25D366] stroke-[2.5]" />
        ) : (
          <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-zinc-300 text-transparent transition-all group-hover:border-[#25D366] group-hover:text-[#25D366]">
            <ArrowRight className="h-3 w-3 stroke-[2.5]" />
          </div>
        )}
      </div>
    </Link>
  )
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; step?: string }>
}) {
  const user = await requireClientUser()
  const resolved = await searchParams
  const client = user.client
  const activeStep = resolved.step ? Number(resolved.step) : null
  const hasToken = Boolean(client.whatsappAccessTokenSecret)

  const businessDone = complete(client.businessLegalName) && complete(client.businessEmail) && complete(client.metaBusinessId)
  const verificationDone = client.businessVerificationStatus === "VERIFIED"
  const whatsappDone = complete(client.whatsappBusinessAccountId) && complete(client.phoneNumberId) && complete(client.webhookVerifyToken)
  const validationDone = client.whatsappSetupStatus === "CONNECTED"
  
  const canFinish = businessDone && whatsappDone

  // Calculate live progress counts
  const completedStepsCount = 
    (businessDone ? 1 : 0) + 
    (verificationDone ? 1 : 0) + 
    (whatsappDone ? 1 : 0) + 
    (validationDone ? 1 : 0)

  // Render Wizard Step UI if step parameter is present
  if (activeStep !== null) {
    const progressWidth = 
      activeStep === 1 ? "10%" : 
      activeStep === 2 ? "45%" : 
      activeStep === 3 ? "75%" : "100%"

    return (
      <div className="w-full max-w-[680px] mx-auto px-6 py-10 flex-1 flex flex-col justify-center animate-in fade-in duration-300">
        
        {/* Visual Stepper Progress Bar */}
        <div className="w-full mb-8 select-none max-w-[480px] mx-auto relative px-2">
          <div className="absolute top-[18px] left-[28px] right-[28px] h-[3px] bg-zinc-100 -z-10 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-[#128C7E] to-[#25D366] transition-all duration-500 rounded-full" 
              style={{ width: progressWidth }}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <Link href="/onboarding?step=1" className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border shadow-sm",
                activeStep === 1 
                  ? "bg-[#128C7E] text-white border-[#128C7E] ring-4 ring-emerald-100" 
                  : businessDone 
                    ? "bg-[#128C7E] text-white border-[#128C7E] group-hover:scale-105" 
                    : "bg-white text-zinc-400 border-zinc-200 group-hover:border-zinc-300"
              )}>
                {businessDone ? "✓" : "1"}
              </div>
              <span className={cn(
                "text-[9px] font-extrabold uppercase tracking-widest transition-colors",
                activeStep === 1 ? "text-[#128C7E]" : "text-zinc-400 group-hover:text-zinc-500"
              )}>Profile</span>
            </Link>

            {/* Step 2 */}
            <Link href="/onboarding?step=2" className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border shadow-sm",
                activeStep === 2 
                  ? "bg-[#128C7E] text-white border-[#128C7E] ring-4 ring-emerald-100" 
                  : whatsappDone 
                    ? "bg-[#128C7E] text-white border-[#128C7E] group-hover:scale-105" 
                    : "bg-white text-zinc-400 border-zinc-200 group-hover:border-zinc-300"
              )}>
                {whatsappDone ? "✓" : "2"}
              </div>
              <span className={cn(
                "text-[9px] font-extrabold uppercase tracking-widest transition-colors",
                activeStep === 2 ? "text-[#128C7E]" : "text-zinc-400 group-hover:text-zinc-500"
              )}>WhatsApp API</span>
            </Link>

            {/* Step 3 */}
            <Link href="/onboarding?step=3" className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border shadow-sm",
                activeStep === 3 
                  ? "bg-[#128C7E] text-white border-[#128C7E] ring-4 ring-emerald-100" 
                  : validationDone 
                    ? "bg-[#128C7E] text-white border-[#128C7E] group-hover:scale-105" 
                    : "bg-white text-zinc-400 border-zinc-200 group-hover:border-zinc-300"
              )}>
                {validationDone ? "✓" : "3"}
              </div>
              <span className={cn(
                "text-[9px] font-extrabold uppercase tracking-widest transition-colors",
                activeStep === 3 ? "text-[#128C7E]" : "text-zinc-400 group-hover:text-zinc-500"
              )}>Validation</span>
            </Link>

            {/* Step 4 */}
            <Link href="/onboarding?step=4" className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border shadow-sm",
                activeStep === 4 
                  ? "bg-[#128C7E] text-white border-[#128C7E] ring-4 ring-emerald-100" 
                  : verificationDone 
                    ? "bg-[#128C7E] text-white border-[#128C7E] group-hover:scale-105" 
                    : "bg-white text-zinc-400 border-zinc-200 group-hover:border-zinc-300"
              )}>
                {verificationDone ? "✓" : "4"}
              </div>
              <span className={cn(
                "text-[9px] font-extrabold uppercase tracking-widest transition-colors",
                activeStep === 4 ? "text-[#128C7E]" : "text-zinc-400 group-hover:text-zinc-500"
              )}>Verification</span>
            </Link>
          </div>
        </div>

        {/* Compact Back navigation floating above form */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/onboarding" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors max-w-fit select-none">
            <ArrowLeft className="h-3.5 w-3.5 animate-in slide-in-from-right-1" />
            <span>Back to checklist</span>
          </Link>
          <form action={clearAllOnboarding} className="inline">
            <button type="submit" className="text-xs text-red-600 hover:text-red-700 font-semibold transition-colors">Clear all data</button>
          </form>
        </div>

        {/* Modern Compact Single-Card Wizard */}
        <div className="w-full bg-white rounded-2xl border border-zinc-200/80 shadow-[0_12px_30px_rgba(0,0,0,0.03)]">
          
          {activeStep === 1 && (
            <>
              {/* Step 1 Header */}
              <div className="border-b border-zinc-100 bg-zinc-50/50 p-6 flex items-start gap-4 rounded-t-2xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9F8EF] text-[#128C7E] shrink-0 shadow-sm border border-emerald-100/50">
                  <Building2 className="h-5 w-5 text-[#128C7E]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#128C7E] bg-emerald-100/50 px-2 py-0.5 rounded-full select-none">
                      Step 1 of 4
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider select-none">
                      Onboarding Wizard
                    </span>
                  </div>
                  <h1 className="text-[15px] font-bold text-foreground mt-1 tracking-tight">Configure Business Profile</h1>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">
                    Enter your legal business credentials. These must exactly match the records you submit to Meta for Business Manager verification.
                  </p>
                </div>
              </div>

              {/* Form Body */}
              <form action={saveBusinessDetails} className="p-6 space-y-6">
                {resolved?.error === "required" && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 leading-normal animate-in fade-in-50 duration-150">
                    ⚠️ <strong>Validation Error:</strong> All marked required fields (*) must be completed before saving.
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="businessLegalName" className="text-xs font-semibold text-[#374151]">
                      Legal business name <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Input id="businessLegalName" name="businessLegalName" defaultValue={client.businessLegalName || ""} required />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="businessName" className="text-xs font-semibold text-[#374151]">
                      Display business name <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Input id="businessName" name="businessName" defaultValue={client.businessName || ""} required />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="businessEmail" className="text-xs font-semibold text-[#374151]">
                      Business email <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Input id="businessEmail" name="businessEmail" type="email" pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$" defaultValue={client.businessEmail || client.email} required />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs font-semibold text-[#374151]">Business phone</Label>
                    <PhoneInput id="phone" name="phone" defaultValue={client.phone || ""} placeholder="98765 43210" />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="businessWebsite" className="text-xs font-semibold text-[#374151]">Website</Label>
                    <Input id="businessWebsite" name="businessWebsite" type="url" defaultValue={client.businessWebsite || ""} placeholder="https://example.com" />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="businessCategory" className="text-xs font-semibold text-[#374151]">Business category</Label>
                    <select
                      id="businessCategory"
                      name="businessCategory"
                      defaultValue={getCategoryDefaultValue(client.businessCategory)}
                      className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent pl-2.5 pr-8 py-1 text-base md:text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer dark:bg-input/30"
                    >
                      {META_BUSINESS_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="country" className="text-xs font-semibold text-[#374151]">Country</Label>
                    <select
                      id="country"
                      name="country"
                      defaultValue={getCountryDefaultValue(client.country)}
                      className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent pl-2.5 pr-8 py-1 text-base md:text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer dark:bg-input/30"
                    >
                      <option value="">Select country...</option>
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="metaBusinessId" className="text-xs font-semibold text-[#374151]">
                        Meta Business ID <span className="text-red-500 font-bold">*</span>
                      </Label>
                      <div className="group relative inline-block cursor-help">
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-foreground transition-colors" />
                        <div className="invisible group-hover:visible absolute right-0 bottom-full mb-2 w-72 bg-[#0B141A] text-white text-[11px] rounded-lg p-2.5 shadow-lg leading-relaxed z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <div className="font-semibold text-[#25D366] mb-1">Where to find this:</div>
                          1. Go to <strong className="text-white">business.facebook.com/settings</strong>.<br />
                          2. Choose your business account.<br />
                          3. Under <strong className="text-white">Business Info</strong>, see your <strong className="text-white">Meta Business Suite ID</strong> at the top.
                          <div className="absolute top-full right-4 border-4 border-transparent border-t-[#0B141A]" />
                        </div>
                      </div>
                    </div>
                    <Input id="metaBusinessId" name="metaBusinessId" defaultValue={client.metaBusinessId || ""} placeholder="Paste Meta Business ID" required />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="businessAddress" className="text-xs font-semibold text-[#374151]">Business address</Label>
                    <Textarea id="businessAddress" name="businessAddress" defaultValue={client.businessAddress || ""} className="min-h-[72px]" />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-200/80">
                    <div className="flex items-center gap-3">
                      <button formAction={clearBusinessDetails} className="h-8 px-3 text-sm text-red-600 border border-red-100 rounded-lg hover:bg-red-50">Clear step</button>
                      <Button 
                        type="submit" 
                        className="h-8 px-4 text-white font-bold text-xs rounded-lg bg-gradient-to-r from-[#128C7E] to-[#075E54] hover:shadow-lg hover:shadow-emerald-950/10 active:scale-95 border-0 transition-all cursor-pointer shadow-sm"
                      >
                        Save & Continue
                      </Button>
                    </div>
                </div>
              </form>
            </>
          )}

          {activeStep === 2 && (
            <>
              {/* Step 2 Header */}
              <div className="border-b border-zinc-100 bg-zinc-50/50 p-6 flex items-start gap-4 rounded-t-2xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9F8EF] text-[#128C7E] shrink-0 shadow-sm border border-emerald-100/50">
                  <MessageSquare className="h-5 w-5 text-[#128C7E]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#128C7E] bg-emerald-100/50 px-2 py-0.5 rounded-full select-none">
                      Step 2 of 4
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider select-none">
                      Onboarding Wizard
                    </span>
                  </div>
                  <h1 className="text-[15px] font-bold text-foreground mt-1 tracking-tight">Configure WhatsApp API Credentials</h1>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">
                    Configure your Meta WhatsApp Cloud API credentials. These enable secure message exchanges and template sync actions.
                  </p>
                </div>
              </div>

              {/* Form Body */}
              <form action={saveWhatsappDetails} className="p-6 space-y-6 animate-in fade-in duration-200">
                {resolved?.error === "required" && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 leading-normal animate-in fade-in-50 duration-150">
                    ⚠️ <strong>Validation Error:</strong> All marked required fields (*) must be completed before saving.
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  
                  {/* WABA ID */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="whatsappBusinessAccountId" className="text-xs font-semibold text-[#374151]">
                        WhatsApp Account ID <span className="text-red-500 font-bold">*</span>
                      </Label>
                      <div className="group relative inline-block cursor-help">
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-foreground transition-colors" />
                        <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 bg-[#0B141A] text-white text-[11px] rounded-lg p-2.5 shadow-lg leading-relaxed z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <div className="font-semibold text-[#25D366] mb-1">Where to find this:</div>
                          1. Go to <strong className="text-white">developers.facebook.com/apps</strong>.<br />
                          2. Select your WhatsApp App.<br />
                          3. Navigate to <strong className="text-white">WhatsApp</strong> &rarr; <strong className="text-white">API Setup</strong> in the sidebar.<br />
                          4. Copy the <strong className="text-white">WhatsApp Business Account ID</strong>.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0B141A]" />
                        </div>
                      </div>
                    </div>
                    <Input 
                      id="whatsappBusinessAccountId" 
                      name="whatsappBusinessAccountId" 
                      defaultValue={client.whatsappBusinessAccountId || ""} 
                      placeholder="Enter Account ID" 
                      required 
                    />
                  </div>

                  {/* Phone Number ID */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="phoneNumberId" className="text-xs font-semibold text-[#374151]">
                        Phone Number ID <span className="text-red-500 font-bold">*</span>
                      </Label>
                      <div className="group relative inline-block cursor-help">
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-foreground transition-colors" />
                        <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 bg-[#0B141A] text-white text-[11px] rounded-lg p-2.5 shadow-lg leading-relaxed z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <div className="font-semibold text-[#25D366] mb-1">Where to find this:</div>
                          1. Go to <strong className="text-white">developers.facebook.com/apps</strong>.<br />
                          2. Select your WhatsApp App.<br />
                          3. Navigate to <strong className="text-white">WhatsApp</strong> &rarr; <strong className="text-white">API Setup</strong>.<br />
                          4. Under Step 1, copy the <strong className="text-white">Phone number ID</strong>.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0B141A]" />
                        </div>
                      </div>
                    </div>
                    <Input 
                      id="phoneNumberId" 
                      name="phoneNumberId" 
                      defaultValue={client.phoneNumberId || ""} 
                      placeholder="Enter Phone Number ID" 
                      required 
                    />
                  </div>

                  {/* Webhook Token */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="webhookVerifyToken" className="text-xs font-semibold text-[#374151]">
                        Webhook verify token <span className="text-red-500 font-bold">*</span>
                      </Label>
                      <div className="group relative inline-block cursor-help">
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-foreground transition-colors" />
                        <div className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-72 bg-[#0B141A] text-white text-[11px] rounded-lg p-2.5 shadow-lg leading-relaxed z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <div className="font-semibold text-[#25D366] mb-1">Purpose & Setup:</div>
                          Create a custom password/phrase here (e.g. <code className="bg-white/10 px-1 rounded text-white font-mono">my_secure_token</code>). You will configure the same token in your Facebook App Dashboard to verify webhook security.
                          <div className="absolute top-full left-4 border-4 border-transparent border-t-[#0B141A]" />
                        </div>
                      </div>
                    </div>
                    <Input 
                      id="webhookVerifyToken" 
                      name="webhookVerifyToken" 
                      defaultValue={client.webhookVerifyToken || ""} 
                      placeholder="Create a verification token" 
                      required 
                    />
                  </div>

                  {/* Permanent Token */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="accessToken" className="text-xs font-semibold text-[#374151]">Permanent access token</Label>
                      <div className="group relative inline-block cursor-help">
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-foreground transition-colors" />
                        <div className="invisible group-hover:visible absolute right-0 bottom-full mb-2 w-72 bg-[#0B141A] text-white text-[11px] rounded-lg p-2.5 shadow-lg leading-relaxed z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <div className="font-semibold text-[#25D366] mb-1">How to generate this:</div>
                          1. Go to <strong className="text-white">Meta Business Settings</strong> &rarr; <strong className="text-white">Users</strong> &rarr; <strong className="text-white">System Users</strong>.<br />
                          2. Generate a token for your system user.<br />
                          3. Select <strong className="text-white">whatsapp_business_messaging</strong> &amp; <strong className="text-white">whatsapp_business_management</strong> permissions.
                          <div className="absolute top-full right-4 border-4 border-transparent border-t-[#0B141A]" />
                        </div>
                      </div>
                    </div>
                    <Input
                      id="accessToken"
                      name="accessToken"
                      type="password"
                      placeholder={hasToken ? "••••••••••••••••" : "Paste system user token"}
                      autoComplete="off"
                    />
                  </div>

                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-200/80">
                  <div className="flex items-center gap-3">
                    <button formAction={clearWhatsappDetails} className="h-8 px-3 text-sm text-red-600 border border-red-100 rounded-lg hover:bg-red-50">Clear step</button>
                    <Button
                      type="submit"
                      className="h-8 px-4 text-white font-bold text-xs rounded-lg bg-gradient-to-r from-[#128C7E] to-[#075E54] hover:shadow-lg active:scale-95 border-0 transition-colors shadow-sm"
                    >
                      Save & Continue
                    </Button>
                  </div>
                </div>
              </form>
            </>
          )}

          {activeStep === 3 && (
            <>
              {/* Step 3 Header */}
              <div className="border-b border-zinc-100 bg-zinc-50/50 p-6 flex items-start gap-4 rounded-t-2xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9F8EF] text-[#128C7E] shrink-0 shadow-sm border border-emerald-100/50">
                  <KeyRound className="h-5 w-5 text-[#128C7E]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#128C7E] bg-emerald-100/50 px-2 py-0.5 rounded-full select-none">
                      Step 3 of 4
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider select-none">
                      Onboarding Wizard
                    </span>
                  </div>
                  <h1 className="text-[15px] font-bold text-foreground mt-1 tracking-tight">Test & Validate Meta Connection</h1>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">
                    Verify your setup is functional before completing the process. Running this test confirms key authenticity.
                  </p>
                </div>
              </div>

              {/* Step 3 Content */}
              <div className="p-6 space-y-6 animate-in fade-in duration-200">
                <ConnectionValidator
                  initialStatus={client.whatsappSetupStatus}
                  hasToken={hasToken}
                />

                <div className="flex justify-between items-center pt-4 border-t border-zinc-200/80">
                  <p className="text-[11.5px] text-muted-foreground max-w-[340px]">
                    {validationDone 
                      ? (verificationDone 
                        ? "Excellent! Your WABA is verified & connected. Finish setup to open the dashboard." 
                        : "Meta connection successful! Proceed to track or simulate business verification.") 
                      : "Run and pass the Meta Connection test above to proceed."}
                  </p>
                  
                  {validationDone ? (
                    verificationDone ? (
                      <form action={finishOnboarding}>
                        <Button
                          type="submit"
                          disabled={!canFinish}
                          className="h-8 px-4 text-white font-bold text-xs rounded-lg transition-all shrink-0 cursor-pointer shadow-sm bg-[#25D366] hover:bg-[#128C7E] active:scale-95"
                        >
                          Finish setup
                        </Button>
                      </form>
                    ) : (
                      <Link href="/onboarding?step=4">
                        <Button className="h-8 px-4 text-white font-bold text-xs rounded-lg bg-gradient-to-r from-[#128C7E] to-[#075E54] hover:shadow-lg active:scale-95 border-0 transition-all cursor-pointer shadow-sm">
                          Continue to Verification
                        </Button>
                      </Link>
                    )
                  ) : (
                    <div className="flex items-center gap-3">
                      <form action={clearValidationStep}>
                        <button type="submit" className="h-8 px-3 text-sm text-red-600 border border-red-100 rounded-lg hover:bg-red-50">Clear step</button>
                      </form>
                      <Button
                        disabled
                        className="h-8 px-4 text-zinc-400 bg-zinc-200 font-bold text-xs rounded-lg cursor-not-allowed"
                      >
                        Finish setup
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeStep === 4 && (
            <>
              {/* Step 4 Header */}
              <div className="border-b border-zinc-100 bg-zinc-50/50 p-6 flex items-start gap-4 rounded-t-2xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9F8EF] text-[#128C7E] shrink-0 shadow-sm border border-emerald-100/50">
                  <ShieldCheck className="h-5 w-5 text-[#128C7E]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#128C7E] bg-emerald-100/50 px-2 py-0.5 rounded-full select-none">
                      Step 4 of 4
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider select-none">
                      Onboarding Wizard
                    </span>
                  </div>
                  <h1 className="text-[15px] font-bold text-foreground mt-1 tracking-tight">Meta Business Verification</h1>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">
                    Meta verifies your business information to ensure identity and enable elevated WhatsApp API messaging limits.
                  </p>
                </div>
              </div>

              {/* Step 4 Content */}
              <div className="p-6 space-y-6 animate-in fade-in duration-200">
                <div className="rounded-xl border border-zinc-150 bg-zinc-50/30 p-5 space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground">Meta Business Suite ID</span>
                      <p className="text-sm font-bold font-mono text-foreground mt-0.5">{client.metaBusinessId || "Not Configured"}</p>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-muted-foreground block text-right">Verification Status</span>
                      <div className="mt-1">
                        {verificationDone ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                            ✓ Verified
                          </span>
                        ) : client.businessVerificationStatus === "PENDING" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200 animate-pulse">
                            ⏳ Pending / Under Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                            Not Started
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!verificationDone && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50/55 p-3.5 text-xs text-yellow-800 leading-normal">
                      ⚠️ <strong>Verification in progress:</strong> Your business verification is currently being processed by Meta. Once verified, elevated API messaging quotas will automatically be unlocked.
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground leading-relaxed border-t border-zinc-100 pt-4 space-y-2">
                    <p className="font-semibold text-foreground">Next steps to verify on Meta:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Log in to the <a href="https://business.facebook.com/settings" target="_blank" rel="noopener noreferrer" className="text-[#128C7E] font-semibold hover:underline">Meta Business Suite Settings</a>.</li>
                      <li>Go to <strong>Security Center</strong> and locate the <strong>Business Verification</strong> card.</li>
                      <li>Click <strong>Start Verification</strong> and upload official legal business documents.</li>
                      <li>Once submitted, Meta will review and update your status (usually within 1-3 business days).</li>
                    </ol>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-zinc-200/80">
                  <div>
                    {!verificationDone && (
                      <form action={verifyMetaBusiness}>
                        <Button 
                          type="submit"
                          className="h-8 px-4 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-all active:scale-95 cursor-pointer"
                        >
                          Simulate Verification Status (Demo)
                        </Button>
                      </form>
                    )}
                  </div>

                  <form action={finishOnboarding}>
                    <Button 
                      type="submit"
                      disabled={!canFinish}
                      className={cn(
                        "h-8 px-4 text-white font-bold text-xs rounded-lg transition-all shrink-0 cursor-pointer shadow-sm",
                        canFinish 
                          ? "bg-[#25D366] hover:bg-[#128C7E] active:scale-95" 
                          : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                      )}
                    >
                      Finish setup
                    </Button>
                  </form>
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    )
  }

  // DEFAULT RENDER: Beautiful Overview Setup Checklist
  return (
    <div className="w-full max-w-[1000px] mx-auto px-6 py-10 flex-1 flex flex-col justify-center items-center">
      
      {/* Centered Dual-Pane Workspace Card */}
      <div className="w-full max-w-[860px] bg-white rounded-3xl border border-zinc-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] overflow-hidden grid md:grid-cols-5 min-h-[560px]">
        
        {/* Left Pane - Immersive Progress & Visual Branding */}
        <div className="md:col-span-2 bg-gradient-to-b from-[#128C7E] to-[#075E54] text-white p-8 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Decorative Circle Pattern */}
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
          
          <div className="relative z-10">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#E9F8EF]/80 bg-white/10 px-2.5 py-1 rounded-full">
              Workspace Setup
            </span>
            <h1 className="text-xl font-bold text-white mt-5 tracking-tight leading-tight">
              Let's connect your business to Meta
            </h1>
            <p className="text-[11.5px] text-[#E9F8EF]/80 mt-2.5 leading-relaxed font-light">
              Follow our onboarding guide to configure profile details, verify business status, and configure the WhatsApp Cloud API webhook.
            </p>
          </div>

          {/* Progress Widget */}
          <div className="relative z-10 bg-[#064e45]/50 border border-white/10 rounded-2xl p-4.5 my-6 backdrop-blur-sm">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#E9F8EF]/60">Your Progress</p>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-3xl font-black text-white leading-none">{completedStepsCount}</span>
              <span className="text-xs text-[#E9F8EF]/70 font-medium">/ 4 steps completed</span>
            </div>
            
            {/* Loading/Progress Bar */}
            <div className="w-full h-1.5 bg-[#064e45]/80 rounded-full mt-3.5 overflow-hidden">
              <div 
                className="h-full bg-[#25D366] rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${(completedStepsCount / 4) * 100}%` }} 
              />
            </div>
          </div>

          {/* Integration Help note */}
          <div className="relative z-10 text-[10.5px] text-[#E9F8EF]/60 font-light leading-relaxed border-t border-white/10 pt-4.5">
            Need guidance? Reference the integration requirements or reach out to support to assist with API keys.
          </div>

        </div>

        {/* Right Pane - Step Actions Checklist */}
        <div className="md:col-span-3 p-8 flex flex-col justify-between bg-zinc-50/40">
          
          <div>
            <div className="flex items-center justify-between gap-4 mb-4 select-none">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Setup Checklist</h2>
              <div className="text-right">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Status: <span className="font-extrabold text-[#128C7E]">{client.status}</span>
                </span>
              </div>
            </div>

            {resolved?.error === "incomplete" && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-800 leading-normal animate-in fade-in-50 duration-150">
                ⚠️ <strong>Details Required:</strong> Please complete the core profile details and WhatsApp API details below before submitting.
              </div>
            )}

            {/* Checklist Step Cards */}
            <div className="grid gap-2.5">
              <ChecklistItem
                done={businessDone}
                stepLabel="Step 1"
                title="Business profile"
                detail="Configure legal name, business email, website, and Meta Business ID."
                href="/onboarding?step=1"
                icon={Building2}
              />
              <ChecklistItem
                done={whatsappDone}
                stepLabel="Step 2"
                title="WhatsApp API credentials"
                detail="Configure WABA ID, phone number ID, system-user tokens, and verify keys."
                href="/onboarding?step=2"
                icon={MessageSquare}
              />
              <ChecklistItem
                done={validationDone}
                stepLabel="Step 3"
                title="Connection validation"
                detail="Confirm saved keys and API routes before initializing dashboards."
                href="/onboarding?step=3"
                icon={KeyRound}
              />
              <ChecklistItem
                done={verificationDone}
                stepLabel="Step 4"
                title="Meta Business verification"
                detail="Track verification status from Meta. Required for higher API quotas."
                href="/onboarding?step=4"
                icon={ShieldCheck}
              />
            </div>
          </div>

          {/* Step Actions footer */}
          <div className="mt-8 pt-5 border-t border-zinc-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-[10.5px] text-muted-foreground leading-normal max-w-[280px]">
              {canFinish 
                ? "Excellent! All core requirements are filled. You are ready to launch your workspace." 
                : "Fill in the required information for Step 1 and Step 2 to proceed."}
            </p>
            <form action={finishOnboarding} className="w-full sm:w-auto flex justify-end">
              <Button
                type="submit"
                disabled={!canFinish}
                className={cn(
                  "h-8 px-4 text-white font-bold text-xs rounded-lg transition-all shrink-0 cursor-pointer shadow-sm w-full sm:w-auto",
                  canFinish 
                    ? "bg-[#25D366] hover:bg-[#128C7E] active:scale-95" 
                    : "bg-zinc-200/80 text-zinc-400 cursor-not-allowed hover:bg-zinc-200/80"
                )}
              >
                Finish setup
              </Button>
            </form>
          </div>

        </div>

      </div>

    </div>
  )
}
