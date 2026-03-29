"use client"

import { Star, MessageSquare, Mail } from "lucide-react"
import type { Lead } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeadSquareCardProps {
  lead: Lead
  onClick: () => void
  isSelected: boolean
}

function getCollectedDataFirst(collectedData: Record<string, unknown> | Record<string, unknown>[] | null | undefined): Record<string, unknown> {
  if (!collectedData) return {}
  if (Array.isArray(collectedData)) return collectedData[0] || {}
  return collectedData
}

function getLeadSource(lead: Lead): string {
  const collectedData = getCollectedDataFirst(lead.session?.collectedData)
  if (collectedData?.source) return collectedData.source as string
  if (lead.phone) return "whatsapp"
  return "email"
}

export function LeadSquareCard({ lead, onClick, isSelected }: LeadSquareCardProps) {
  const session = lead.session
  const sessionStatus = session?.status || "active"
  const collectedData = session?.collectedData || {}
  const workType = collectedData.workType || "Not specified"
  const rating = session?.rating ?? undefined
  const source = getLeadSource(lead)

  const initials = lead.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative rounded-lg border bg-card p-3 text-left transition-all cursor-pointer hover:border-foreground/30",
        isSelected ? "border-foreground ring-1 ring-foreground" : "border-border"
      )}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold",
          sessionStatus === "completed" && "bg-foreground/10 text-foreground",
          sessionStatus === "active" && "bg-muted text-muted-foreground",
          sessionStatus === "manual" && "bg-foreground/20 text-foreground"
        )}>
          {initials}
        </div>

        <div className="text-center w-full">
          <p className="truncate text-sm font-medium">{lead.name}</p>
          <p className="truncate text-xs text-muted-foreground">{workType}</p>
        </div>

        {rating !== undefined && (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-2.5 w-2.5",
                  i < rating ? "text-foreground fill-foreground" : "text-muted"
                )}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 text-muted-foreground" title={source === "whatsapp" ? "WhatsApp" : "Email"}>
          {source === "whatsapp" ? (
            <MessageSquare className="h-3 w-3" />
          ) : (
            <Mail className="h-3 w-3" />
          )}
        </div>
      </div>

      <div className={cn(
        "absolute top-2 right-2 h-1.5 w-1.5 rounded-full",
        sessionStatus === "completed" && "bg-foreground",
        sessionStatus === "active" && "bg-muted-foreground",
        sessionStatus === "manual" && "bg-foreground/70"
      )} />
    </button>
  )
}
