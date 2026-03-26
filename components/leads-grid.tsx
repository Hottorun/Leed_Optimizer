"use client"

import { LeadCard } from "./lead-card"
import { Mail } from "lucide-react"
import type { Lead, LeadStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeadsGridProps {
  leads: Lead[]
  searchQuery: string
  selectedLeadId: string | null
  onSelectLead: (lead: Lead) => void
  viewMode?: "grid" | "list"
}

export function LeadsGrid({
  leads,
  searchQuery,
  selectedLeadId,
  onSelectLead,
  viewMode = "grid",
}: LeadsGridProps) {
  const displayLeads = leads.filter((lead) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.phone.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.location.toLowerCase().includes(query) ||
      lead.workType.toLowerCase().includes(query) ||
      lead.conversationSummary.toLowerCase().includes(query)
    )
  })

  if (displayLeads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg
            className="h-8 w-8 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-slate-700">No leads found</h3>
        <p className="mt-1 text-sm text-slate-500">
          {searchQuery
            ? "Try adjusting your search"
            : "New leads will appear here"}
        </p>
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-2">
        {displayLeads.map((lead) => (
          <button
            key={lead.id}
            onClick={() => onSelectLead(lead)}
            className={cn(
              "w-full flex items-center gap-4 rounded-lg border bg-white p-4 text-left transition-all duration-200 cursor-pointer",
              selectedLeadId === lead.id
                ? "border-blue-400 shadow-md ring-2 ring-blue-100"
                : "border-slate-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30"
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-sm font-semibold text-blue-700">
              {lead.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-slate-800 truncate">{lead.name}</h3>
                <span className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  lead.status === "pending" ? "bg-amber-500" :
                  lead.status === "approved" ? "bg-blue-500" :
                  lead.status === "manual" ? "bg-purple-500" : "bg-slate-400"
                )} />
                <span className="text-xs text-slate-500">{lead.status === "manual" ? "Manual" : lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}</span>
              </div>
              <p className="text-sm text-slate-500 truncate">{lead.workType} • {lead.location}</p>
            </div>

            <div className="hidden md:flex items-center gap-4 text-sm text-slate-600">
              <span>{lead.phone}</span>
              <span className={cn(
                "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                lead.source === "whatsapp" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
              )}>
                {lead.source === "whatsapp" ? (
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                ) : (
                  <Mail className="h-3 w-3" />
                )}
                {lead.source === "whatsapp" ? "WhatsApp" : "Email"}
              </span>
            </div>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {displayLeads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onClick={() => onSelectLead(lead)}
          isSelected={selectedLeadId === lead.id}
        />
      ))}
    </div>
  )
}
