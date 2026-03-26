"use client"

import { Clock, MapPin, Briefcase, Mail, Phone, Star, MessageCircle, Hand, Sparkles } from "lucide-react"
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
    dotColor: "bg-blue-500",
    textColor: "text-blue-600"
  },
  approved: { 
    label: "Approved", 
    dotColor: "bg-emerald-500",
    textColor: "text-emerald-600"
  },
  declined: { 
    label: "Declined", 
    dotColor: "bg-slate-400",
    textColor: "text-slate-400"
  },
  manual: { 
    label: "Review", 
    dotColor: "bg-violet-500",
    textColor: "text-violet-600"
  },
}

const sourceConfig: Record<LeadSource, { icon: any; label: string; iconColor: string }> = {
  whatsapp: { 
    icon: MessageCircle, 
    label: "WhatsApp",
    iconColor: "text-slate-400" 
  },
  email: { 
    icon: Mail, 
    label: "Email",
    iconColor: "text-slate-400" 
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

function getAiRecommendation(lead: Lead): { text: string; cta: string; style: string } {
  if (lead.rating >= 4) {
    return { 
      text: "High priority", 
      cta: "Contact today",
      style: "border-indigo-200 bg-indigo-50 text-indigo-600"
    }
  }
  if (lead.status === "manual") {
    return { 
      text: "Needs review", 
      cta: "Review now",
      style: "border-violet-200 bg-violet-50 text-violet-600"
    }
  }
  if (lead.rating >= 3) {
    return { 
      text: "Medium priority", 
      cta: "Schedule follow-up",
      style: "border-blue-200 bg-blue-50 text-blue-600"
    }
  }
  return { 
    text: "Nurture", 
    cta: "Send newsletter",
    style: "border-slate-200 bg-slate-50 text-slate-500"
  }
}

export function LeadCard({ lead, onClick, isSelected }: LeadCardProps) {
  const status = statusConfig[lead.status]
  const source = sourceConfig[lead.source]
  const SourceIcon = source.icon
  const aiRec = getAiRecommendation(lead)

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border bg-white p-5 text-left transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5",
        isSelected 
          ? "border-slate-400 shadow-lg ring-2 ring-slate-100" 
          : "border-slate-200"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
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
                i < lead.rating ? "text-slate-500 fill-slate-500" : "text-slate-200"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-slate-400">{lead.rating}/5</span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-500 leading-relaxed">
        {lead.conversationSummary}
      </p>

      {/* AI Recommendation */}
      <div className={cn(
        "mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs",
        aiRec.style
      )}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">{aiRec.text}</span>
        </div>
        <span className="font-medium">{aiRec.cta}</span>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-slate-400" />
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
