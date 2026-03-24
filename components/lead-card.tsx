"use client"

import { Clock, MapPin, Briefcase, Mail, Phone, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Lead, LeadStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeadCardProps {
  lead: Lead
  onClick: () => void
  isSelected: boolean
}

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  pending: { label: "Pending Review", className: "bg-chart-3/20 text-chart-3 border-chart-3/30" },
  approved: { label: "Approved", className: "bg-primary/20 text-primary border-primary/30" },
  declined: { label: "Declined", className: "bg-destructive/20 text-destructive border-destructive/30" },
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

function getRatingColor(rating: number): string {
  if (rating >= 4) return "text-primary"
  if (rating >= 3) return "text-chart-3"
  return "text-destructive"
}

export function LeadCard({ lead, onClick, isSelected }: LeadCardProps) {
  const status = statusConfig[lead.status]

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border bg-card p-5 text-left transition-all hover:border-primary/50",
        isSelected ? "border-primary ring-1 ring-primary" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
            {lead.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-card-foreground">{lead.name}</h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="truncate">{lead.workType}</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className={cn("shrink-0 text-xs", status.className)}>
          {status.label}
        </Badge>
      </div>

      {/* Rating Section */}
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3.5 w-3.5",
                i < lead.rating ? getRatingColor(lead.rating) : "text-muted-foreground/30"
              )}
              fill={i < lead.rating ? "currentColor" : "none"}
            />
          ))}
        </div>
        <span className={cn("text-xs font-medium", getRatingColor(lead.rating))}>
          {lead.rating}/5
        </span>
        <span className="text-xs text-muted-foreground truncate">
          - {lead.ratingReason}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {lead.conversationSummary}
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5" />
          <span>{lead.phone}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" />
          <span className="truncate max-w-[150px]">{lead.email}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {lead.location}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {formatTimeAgo(lead.createdAt)}
        </div>
      </div>
    </button>
  )
}
