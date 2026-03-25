"use client"

import { Star, MessageCircle, AtSign, Users, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Lead } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeadSquareCardProps {
  lead: Lead
  onClick: () => void
  isSelected: boolean
}

function getRatingColor(rating: boolean | undefined): string {
  if (rating === true) return "text-primary"
  if (rating === false) return "text-destructive"
  return "text-chart-3"
}

export function LeadSquareCard({ lead, onClick, isSelected }: LeadSquareCardProps) {
  const session = lead.session
  const sessionStatus = session?.status || "active"
  const collectedData = session?.collectedData || {}
  const workType = collectedData.workType || "Not specified"
  const contactPlatform = collectedData.contactPlatform || "email"
  const rating = session?.rating

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
        "group relative aspect-square rounded-xl border bg-card p-3 text-left transition-all cursor-pointer hover:border-primary/50 hover:shadow-md overflow-hidden",
        isSelected ? "border-primary ring-2 ring-primary" : "border-border"
      )}
    >
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold transition-colors",
          sessionStatus === "completed" && "bg-primary/20 text-primary",
          sessionStatus === "active" && "bg-chart-3/20 text-chart-3",
          sessionStatus === "forwarded" && "bg-purple-500/20 text-purple-600"
        )}>
          {initials}
        </div>
        
        <div className="text-center w-full">
          <p className="truncate font-medium text-sm text-card-foreground w-full">
            {lead.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {workType}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-2.5 w-2.5",
                  i === 0 && rating !== undefined ? getRatingColor(rating) : "text-muted-foreground/30"
                )}
                fill={i === 0 && rating !== undefined ? (rating ? "currentColor" : "none") : "none"}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {contactPlatform === "whatsapp" ? (
            <MessageCircle className="h-3 w-3 text-green-500" />
          ) : (
            <AtSign className="h-3 w-3 text-blue-500" />
          )}
          {lead.leadCount > 1 && (
            lead.leadCount >= 3 ? (
              <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            ) : (
              <Users className="h-3 w-3 text-primary" />
            )
          )}
        </div>
      </div>

      <div className={cn(
        "absolute top-2 right-2 h-2 w-2 rounded-full",
        sessionStatus === "completed" && "bg-primary",
        sessionStatus === "active" && "bg-chart-3",
        sessionStatus === "forwarded" && "bg-purple-500"
      )} />
    </button>
  )
}
