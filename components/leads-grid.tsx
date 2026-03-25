"use client"

import { LeadCard } from "./lead-card"
import { LeadListItem } from "./lead-list-item"
import { LeadSquareCard } from "./lead-square-card"
import type { Lead, LeadStatus, ContactPlatform, ViewMode, CustomerType, RatingFilter, GroupByOption } from "@/lib/types"
import { format, isToday, isYesterday, isThisWeek } from "date-fns"

interface LeadsGridProps {
  leads: Lead[]
  searchQuery: string
  statusFilter: LeadStatus | null
  platformFilter: ContactPlatform | "all"
  customerTypeFilter: CustomerType
  ratingFilter: RatingFilter
  groupBy: GroupByOption
  viewMode: ViewMode
  selectedLeadId: string | null
  onSelectLead: (lead: Lead) => void
}

function normalizeSearchQuery(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(term => term.length > 0)
}

function fuzzyMatch(text: string, searchTerms: string[]): boolean {
  if (searchTerms.length === 0) return true
  
  const lowerText = text.toLowerCase()
  
  return searchTerms.every(term => {
    const termLower = term.toLowerCase()
    return lowerText.includes(termLower)
  })
}

export function LeadsGrid({
  leads,
  searchQuery,
  statusFilter,
  platformFilter,
  customerTypeFilter,
  ratingFilter,
  groupBy,
  viewMode,
  selectedLeadId,
  onSelectLead,
}: LeadsGridProps) {
  const searchTerms = normalizeSearchQuery(searchQuery)
  
  const filteredLeads = leads.filter((lead) => {
    const session = lead.session
    const collectedData = session?.collectedData || {}

    if (searchTerms.length > 0) {
      const searchableFields = [
        lead.name,
        lead.phone,
        lead.email,
        collectedData.location || "",
        collectedData.workType || "",
        collectedData.message || "",
        session?.ratingReason || "",
      ].join(' ').toLowerCase()
      
      if (!fuzzyMatch(searchableFields, searchTerms)) {
        return false
      }
    }

    const matchesStatus = !statusFilter || (session?.status as LeadStatus) === statusFilter
    const matchesPlatform = platformFilter === "all" || collectedData.contactPlatform === platformFilter
    
    const matchesCustomerType = 
      customerTypeFilter === "all" ||
      (customerTypeFilter === "first-time" && lead.leadCount === 1) ||
      (customerTypeFilter === "returning" && lead.leadCount > 1) ||
      (customerTypeFilter === "loyal" && lead.leadCount >= 3)

    const ratingMatch = ratingFilter === "all" || 
      (ratingFilter === 5 && session?.rating === true) ||
      (ratingFilter === 1 && session?.rating === false)

    return matchesStatus && matchesPlatform && matchesCustomerType && ratingMatch
  })

  function getDateGroup(dateString: string): string {
    const date = new Date(dateString)
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday"
    if (isThisWeek(date)) return "This Week"
    return format(date, "MMMM yyyy")
  }

  function getGroupKey(lead: Lead): string {
    const session = lead.session
    const collectedData = session?.collectedData || {}

    switch (groupBy) {
      case "rating":
        return session?.rating === true ? "Qualified" : session?.rating === false ? "Not Qualified" : "Pending Review"
      case "status":
        return (session?.status || "active").charAt(0).toUpperCase() + (session?.status || "active").slice(1)
      case "platform":
        return collectedData.contactPlatform === "whatsapp" ? "WhatsApp" : "Email"
      case "customerType":
        if (lead.leadCount >= 3) return "Loyal Customers"
        if (lead.leadCount > 1) return "Returning Customers"
        return "First-time Customers"
      case "date":
        return getDateGroup(lead.createdAt)
      default:
        return ""
    }
  }

  const groupedLeads = groupBy !== "none"
    ? filteredLeads.reduce((groups, lead) => {
        const key = getGroupKey(lead)
        if (!groups[key]) groups[key] = []
        groups[key].push(lead)
        return groups
      }, {} as Record<string, Lead[]>)
    : { "": filteredLeads }

  const sortLeads = (leadsToSort: Lead[]): Lead[] => {
    return [...leadsToSort].sort((a, b) => {
      const aStatus = a.session?.status || "active"
      const bStatus = b.session?.status || "active"
      if (aStatus === "active" && bStatus !== "active") return -1
      if (aStatus !== "active" && bStatus === "active") return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  if (filteredLeads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 cursor-default">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <svg
            className="h-8 w-8 text-muted-foreground"
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
        <h3 className="mt-4 text-lg font-medium text-foreground">No leads found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {searchQuery || statusFilter || platformFilter !== "all" || customerTypeFilter !== "all" || ratingFilter !== "all"
            ? "Try adjusting your search or filters"
            : "New leads will appear here"}
        </p>
      </div>
    )
  }

  const renderLeadItem = (lead: Lead) => {
    if (viewMode === "squares") {
      return (
        <LeadSquareCard
          key={lead.id}
          lead={lead}
          onClick={() => onSelectLead(lead)}
          isSelected={selectedLeadId === lead.id}
        />
      )
    }
    if (viewMode === "list") {
      return (
        <LeadListItem
          key={lead.id}
          lead={lead}
          onClick={() => onSelectLead(lead)}
          isSelected={selectedLeadId === lead.id}
        />
      )
    }
    return (
      <LeadCard
        key={lead.id}
        lead={lead}
        onClick={() => onSelectLead(lead)}
        isSelected={selectedLeadId === lead.id}
      />
    )
  }

  if (groupBy !== "none") {
    return (
      <div className="space-y-6">
        {Object.entries(groupedLeads)
          .sort(([a], [b]) => {
            if (a === "Today") return -1
            if (a === "Yesterday") return b === "Today" ? 1 : -1
            if (a === "This Week") return (b === "Today" || b === "Yesterday") ? 1 : -1
            return a.localeCompare(b)
          })
          .map(([groupName, groupLeads]) => (
            <div key={groupName} className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {groupName}
                </h3>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">{groupLeads.length}</span>
              </div>
              <div className={
                viewMode === "squares" 
                  ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3"
                  : viewMode === "list"
                  ? "flex flex-col gap-2"
                  : "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              }>
                {sortLeads(groupLeads).map(renderLeadItem)}
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className={
      viewMode === "squares" 
        ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3"
        : viewMode === "list"
        ? "flex flex-col gap-2"
        : "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    }>
      {sortLeads(filteredLeads).map(renderLeadItem)}
    </div>
  )
}
