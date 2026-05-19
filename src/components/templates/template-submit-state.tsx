"use client"

import { createContext, useContext, useMemo, useState } from "react"

type TemplateSubmitAction = "draft" | "review"

type TemplateSubmitState = {
  action: TemplateSubmitAction | null
  isSubmitting: boolean
  setAction: (action: TemplateSubmitAction | null) => void
}

const TemplateSubmitStateContext = createContext<TemplateSubmitState | null>(null)

export function TemplateSubmitStateProvider({ children }: { children: React.ReactNode }) {
  const [action, setAction] = useState<TemplateSubmitAction | null>(null)

  const value = useMemo(
    () => ({
      action,
      isSubmitting: action !== null,
      setAction,
    }),
    [action]
  )

  return (
    <TemplateSubmitStateContext.Provider value={value}>
      {children}
    </TemplateSubmitStateContext.Provider>
  )
}

export function useTemplateSubmitState() {
  const context = useContext(TemplateSubmitStateContext)

  if (!context) {
    throw new Error("useTemplateSubmitState must be used within TemplateSubmitStateProvider")
  }

  return context
}

export function useOptionalTemplateSubmitState() {
  return useContext(TemplateSubmitStateContext)
}
