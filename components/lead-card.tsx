"use client"

import { Clock, MapPin, Briefcase, Mail, Phone, Star, MessageCircle, Hand } from "lucide-react"
import type { Lead, LeadStatus, LeadSource } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeadCardProps {
  lead: Lead
  onClick: () => void
  isSelected: boolean
}

const statusConfig: Record<LeadStatus, { label: string; dotColor: string; textColor: string }> = {
  pending: { 
    label: "Pending", 
    dotColor: "bg-amber-500",
    textColor: "text-amber-600"
  },
  approved: { 
    label: "Approved", 
    dotColor: "bg-blue-500",
    textColor: "text-blue-600"
  },
  declined: { 
    label: "Declined", 
    dotColor: "bg-slate-400",
    textColor: "text-slate-500"
  },
  manual: { 
    label: "Manual Review", 
    dotColor: "bg-purple-500",
    textColor: "text-purple-600"
  },
}

const sourceConfig: Record<LeadSource, { icon: any; label: string; iconColor: string }> = {
  whatsapp: { 
    icon: MessageCircle, 
    label: "WhatsApp",
    iconColor: "text-emerald-500" 
  },
  email: { 
    icon: Mail, 
    label: "Email",
    iconColor: "text-blue-400" 
  },
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

export function LeadCard({ lead, onClick, isSelected }: LeadCardProps) {
  const status = statusConfig[lead.status]
  const source = sourceConfig[lead.source]
  const SourceIcon = source.icon

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border bg-white p-5 text-left transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5",
        isSelected 
          ? "border-blue-400 shadow-lg ring-2 ring-blue-100" 
          : "border-slate-200"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-sm font-semibold text-blue-700">
            {lead.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-medium text-slate-800">{lead.name}</h3>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Briefcase className="h-3 w-3" />
              <span className="truncate">{lead.workType}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", status.dotColor)} />
            <span className="text-xs font-medium text-slate-600">{status.label}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <SourceIcon className={cn("h-3 w-3", source.iconColor)} />
            {source.label}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3.5 w-3.5",
                i < lead.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-slate-500">{lead.rating}/5</span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-500 leading-relaxed">
        {lead.conversationSummary}
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-blue-500" />
          <span>{lead.phone}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 text-blue-500" />
          <span className="truncate max-w-[140px]">{lead.email}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {lead.location}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {formatTimeAgo(lead.createdAt)}
        </div>
      </div>
    </button>
  )
}
