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
  manual: { label: "Review", className: "bg-violet-500/20 text-violet-600 border-violet-500/30" },
  active: { label: "Active", className: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
  completed: { label: "Completed", className: "bg-green-500/20 text-green-600 border-green-500/30" },
  cancelled: { label: "Cancelled", className: "bg-slate-400/20 text-slate-500 border-slate-400/30" },
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

function getRatingColor(rating: number | undefined): string {
  if (rating !== undefined && rating >= 3) return "text-primary"
  if (rating !== undefined && rating < 3) return "text-destructive"
  return "text-chart-3"
}

export function LeadListItem({ lead, onClick, isSelected }: LeadListItemProps) {
  const session = lead.session
  const sessionStatus = session?.status || "active"
  const status = statusConfig[sessionStatus as LeadStatus] || { label: "Unknown", className: "" }
  const collectedData = session?.collectedData || {}
  const workType = collectedData.workType || "Not specified"
  const location = collectedData.location || "Not specified"
  const contactPlatform = collectedData.contactPlatform || "email"
  const rating = session?.rating

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
          sessionStatus === "completed" && "bg-primary/20 text-primary",
          sessionStatus === "active" && "bg-chart-3/20 text-chart-3",
          sessionStatus === "manual" && "bg-purple-500/20 text-purple-600"
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
          <p className="text-sm text-muted-foreground truncate">{workType}</p>
        </div>

        {/* Rating */}
        <div className="hidden sm:flex items-center justify-center w-24 shrink-0">
          <Star
            className={cn("h-3.5 w-3.5", getRatingColor(rating))}
            fill={rating ? "currentColor" : "none"}
          />
        </div>

        {/* Badges */}
        <div className="hidden md:flex items-center gap-1.5">
          <Badge variant="secondary" className={cn(
            "text-xs",
            contactPlatform === "whatsapp" ? "bg-green-500/10 text-green-600" : "bg-blue-500/10 text-blue-600"
          )}>
            {contactPlatform === "whatsapp" ? (
              <MessageCircle className="h-3 w-3" />
            ) : (
              <AtSign className="h-3 w-3" />
            )}
          </Badge>
          {(lead.leadCount ?? 0) >= 3 && (
            <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-600">
              <Heart className="h-3 w-3 fill-red-500" />
            </Badge>
          )}
          {(lead.leadCount ?? 0) > 1 && (lead.leadCount ?? 0) < 3 && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              <Users className="h-3 w-3" />
            </Badge>
          )}
        </div>

        {/* Location */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground min-w-[120px]">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{location}</span>
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
