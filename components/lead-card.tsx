"use client"

import { Clock, MapPin, Briefcase, Mail, Phone, Star, MessageCircle, AtSign, Users, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Lead, LeadStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface LeadCardProps {
  lead: Lead
  onClick: () => void
  isSelected: boolean
}

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  pending: { label: "Pending Review", className: "bg-chart-3/20 text-chart-3 border-chart-3/30" },
  approved: { label: "Approved", className: "bg-primary/20 text-primary border-primary/30" },
  declined: { label: "Declined", className: "bg-destructive/20 text-destructive border-destructive/30" },
  unrelated: { label: "Unrelated", className: "bg-muted/50 text-muted-foreground border-muted" },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return format(date, "MMM d, yyyy 'at' h:mm a")
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

export function LeadCard({ lead, onClick, isSelected }: LeadCardProps) {
  const status = statusConfig[lead.status as LeadStatus] || { label: "Unknown", className: "" }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border bg-card p-5 text-left transition-all cursor-pointer hover:border-primary/50 hover:shadow-md",
        isSelected ? "border-primary ring-1 ring-primary" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
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

      {/* Received Date - More Prominent */}
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-secondary/80 px-3 py-2 border border-border/50">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          {formatRelativeDate(lead.createdAt)}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDate(lead.createdAt)}
        </span>
      </div>

      {/* Contact Platform & Customer Type */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant="secondary" className={cn(
          "flex items-center gap-1 text-xs",
          lead.contactPlatform === "whatsapp" ? "bg-green-500/10 text-green-600" : "bg-blue-500/10 text-blue-600"
        )}>
          {lead.contactPlatform === "whatsapp" ? (
            <MessageCircle className="h-3 w-3" />
          ) : (
            <AtSign className="h-3 w-3" />
          )}
          {lead.contactPlatform === "whatsapp" ? "WhatsApp" : "Email"}
        </Badge>
        {lead.leadCount >= 3 && (
          <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-red-500/10 text-red-600">
            <Heart className="h-3 w-3 fill-red-500" />
            Loyal
          </Badge>
        )}
        {lead.leadCount > 1 && lead.leadCount < 3 && (
          <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-primary/10 text-primary">
            <Users className="h-3 w-3" />
            Returning
          </Badge>
        )}
        {lead.autoApproved && (
          <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-purple-500/10 text-purple-600">
            Auto-Approved
          </Badge>
        )}
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
      </div>
    </button>
  )
}
