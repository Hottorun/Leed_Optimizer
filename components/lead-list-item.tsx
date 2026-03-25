"use client"

import { Clock, MapPin, Phone, Star, MessageCircle, AtSign, Users, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Lead, LeadStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface LeadListItemProps {
  lead: Lead
  onClick: () => void
  isSelected: boolean
}

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-chart-3/20 text-chart-3 border-chart-3/30" },
  approved: { label: "Approved", className: "bg-primary/20 text-primary border-primary/30" },
  declined: { label: "Declined", className: "bg-destructive/20 text-destructive border-destructive/30" },
  unrelated: { label: "Unrelated", className: "bg-muted/50 text-muted-foreground border-muted" },
}

function formatDate(dateString: string): string {
  return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a")
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return format(date, "MMM d")
}

function getRatingColor(rating: number): string {
  if (rating >= 4) return "text-primary"
  if (rating >= 3) return "text-chart-3"
  return "text-destructive"
}

export function LeadListItem({ lead, onClick, isSelected }: LeadListItemProps) {
  const status = statusConfig[lead.status as LeadStatus] || { label: "Unknown", className: "" }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border bg-card p-4 text-left transition-all cursor-pointer hover:border-primary/50 hover:shadow-md",
        isSelected ? "border-primary ring-1 ring-primary" : "border-border"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          lead.status === "approved" && "bg-primary/20 text-primary",
          lead.status === "pending" && "bg-chart-3/20 text-chart-3",
          lead.status === "declined" && "bg-destructive/20 text-destructive",
          lead.status === "unrelated" && "bg-muted text-muted-foreground"
        )}>
          {lead.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-card-foreground truncate">{lead.name}</h3>
            <Badge variant="outline" className={cn("shrink-0 text-xs", status.className)}>
              {status.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{lead.workType}</p>
        </div>

        {/* Rating */}
        <div className="hidden sm:flex items-center justify-center w-24 shrink-0">
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

        {/* Badges */}
        <div className="hidden md:flex items-center gap-1.5">
          <Badge variant="secondary" className={cn(
            "text-xs",
            lead.contactPlatform === "whatsapp" ? "bg-green-500/10 text-green-600" : "bg-blue-500/10 text-blue-600"
          )}>
            {lead.contactPlatform === "whatsapp" ? (
              <MessageCircle className="h-3 w-3" />
            ) : (
              <AtSign className="h-3 w-3" />
            )}
          </Badge>
          {lead.leadCount >= 3 && (
            <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-600">
              <Heart className="h-3 w-3 fill-red-500" />
            </Badge>
          )}
          {lead.leadCount > 1 && lead.leadCount < 3 && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              <Users className="h-3 w-3" />
            </Badge>
          )}
        </div>

        {/* Location */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground min-w-[120px]">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{lead.location}</span>
        </div>

        {/* Phone */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-muted-foreground min-w-[130px]">
          <Phone className="h-3.5 w-3.5" />
          <span>{lead.phone}</span>
        </div>

        {/* Date - More Prominent */}
        <div className="flex flex-col items-end min-w-[140px]">
          <span className="text-sm font-semibold text-foreground">
            {formatRelativeDate(lead.createdAt)}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(lead.createdAt), "h:mm a")}
          </span>
        </div>
      </div>
    </button>
  )
}
