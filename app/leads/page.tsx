"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { AppHeader } from "@/components/app-header"
import { LeadDetailPanel } from "@/components/lead-detail-panel"
import { Search, Mail, MessageCircle, Plus, Heart, Clock, ChevronRight, ArrowUpDown, X, LayoutGrid, List } from "lucide-react"
import type { Lead, LeadStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { useUser } from "@/lib/use-user"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type SortOption = "newest" | "oldest" | "rating-high" | "rating-low" | "name-az" | "name-za"

export default function LeadsPage() {
  const { data: leads = [], mutate } = useSWR<Lead[]>("/api/leads", fetcher)
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [whatsappFilter, setWhatsappFilter] = useState(false)
  const [emailFilter, setEmailFilter] = useState(false)
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [showAllManual, setShowAllManual] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const getLeadRating = (lead: Lead): number => {
    return lead.session?.rating ?? lead.rating ?? 0
  }

  const getLeadStatus = (lead: Lead): string => {
    return lead.session?.status || lead.status || "pending"
  }

  const getLeadSource = (lead: Lead): string => {
    // If they have a phone number, they're from WhatsApp
    if (lead.phone) return "whatsapp"
    // If they have only email, they're from email
    if (lead.email) return "email"
    return ""
  }

  const sortLeads = (leadsToSort: Lead[]) => {
    return [...leadsToSort].sort((a, b) => {
      const ratingA = getLeadRating(a)
      const ratingB = getLeadRating(b)
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "rating-high":
          return ratingB - ratingA
        case "rating-low":
          return ratingA - ratingB
        case "name-az":
          return a.name.localeCompare(b.name)
        case "name-za":
          return b.name.localeCompare(a.name)
        default:
          return 0
      }
    })
  }

  const allLeads = useMemo(() => {
    return leads.filter(l => {
      const source = getLeadSource(l)
      const status = getLeadStatus(l)
      
      const hasWhatsappFilter = whatsappFilter
      const hasEmailFilter = emailFilter
      
      if (hasWhatsappFilter && hasEmailFilter) {
        // Both selected - show all leads
      } else if (hasWhatsappFilter) {
        if (source !== "whatsapp") return false
      } else if (hasEmailFilter) {
        if (source !== "email") return false
      }
      
      if (statusFilter !== "all" && status !== statusFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          l.name.toLowerCase().includes(query) ||
          l.phone.includes(query) ||
          l.email.toLowerCase().includes(query) ||
          (l.workType?.toLowerCase().includes(query) ?? false)
        )
      }
      return true
    })
  }, [leads, whatsappFilter, emailFilter, statusFilter, searchQuery])

  const displayedLeads = sortLeads(allLeads)

  const stats = useMemo(() => {
    return {
      all: leads.length,
      pending: leads.filter(l => getLeadStatus(l) === "pending").length,
      manual: leads.filter(l => getLeadStatus(l) === "manual").length,
      active: leads.filter(l => getLeadStatus(l) === "active").length,
      approved: leads.filter(l => getLeadStatus(l) === "approved").length,
      declined: leads.filter(l => getLeadStatus(l) === "declined").length,
      whatsapp: leads.filter(l => getLeadSource(l) === "whatsapp").length,
      email: leads.filter(l => getLeadSource(l) === "email").length,
    }
  }, [leads])

  const getAiRecommendation = (lead: Lead) => {
    const rating = getLeadRating(lead)
    if (rating >= 4) {
      return { text: "High priority", cta: "Contact today", style: "border-indigo-200 bg-indigo-50 text-indigo-600" }
    }
    if (rating >= 3) {
      return { text: "Medium priority", cta: "Schedule follow-up", style: "border-blue-200 bg-blue-50 text-blue-600" }
    }
    return { text: "Nurture", cta: "Send newsletter", style: "border-slate-200 bg-slate-50 text-slate-500" }
  }

  return (
    <ThemeBackground>
      <AppHeader onRefresh={mutate} isRefreshing={false} user={user ? { name: user.name, email: user.email } : undefined} />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Leads Management</h1>
            <p className="text-slate-500 mt-1">Review, approve, and manage your leads</p>
          </div>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Import Lead
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                statusFilter === "all" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              All ({stats.all})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                statusFilter === "pending" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                statusFilter === "active" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setStatusFilter("manual")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                statusFilter === "manual" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              Manual ({stats.manual})
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                statusFilter === "approved" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setStatusFilter("declined")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                statusFilter === "declined" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              Declined ({stats.declined})
            </button>
            <div className="h-6 w-px bg-slate-300 mx-2" />
            <button
              onClick={() => setWhatsappFilter(!whatsappFilter)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                whatsappFilter ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              <MessageCircle className="inline h-4 w-4 mr-1" />
              WhatsApp ({stats.whatsapp})
            </button>
            <button
              onClick={() => setEmailFilter(!emailFilter)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                emailFilter ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              <Mail className="inline h-4 w-4 mr-1" />
              Email ({stats.email})
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
            />
          </div>
          
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 appearance-none cursor-pointer focus:border-slate-400 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Rating: High to Low</option>
              <option value="rating-low">Rating: Low to High</option>
              <option value="name-az">Name: A-Z</option>
              <option value="name-za">Name: Z-A</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {(whatsappFilter || emailFilter || statusFilter !== "all" || searchQuery) && (
          <button
            onClick={() => {
              setWhatsappFilter(false)
              setEmailFilter(false)
              setStatusFilter("all")
              setSearchQuery("")
            }}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        )}

        {displayedLeads.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No leads found</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedLeads.map((lead) => {
              const aiRec = getAiRecommendation(lead)
              return (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                    {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-800 truncate">{lead.name}</h3>
                      {lead.isLoyal && <Heart className="h-4 w-4 text-slate-400 fill-slate-400 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={cn("h-3.5 w-3.5", i < getLeadRating(lead) ? "text-slate-500 fill-slate-500" : "text-slate-300")}
                            viewBox="0 0 24 24"
                            stroke={i < getLeadRating(lead) ? "none" : "currentColor"}
                            strokeWidth={1.5}
                            fill={i < getLeadRating(lead) ? "currentColor" : "none"}
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 ml-1">{getLeadRating(lead)}/5</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {getLeadSource(lead) === "whatsapp" ? (
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        ) : <Mail className="h-3 w-3" />}
                        {getLeadSource(lead) === "whatsapp" ? "WhatsApp" : "Email"}
                      </span>
                      <span className="text-slate-400 text-xs">{lead.session?.collectedData?.location || lead.location}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
                </button>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Contact</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Source</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Rating</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Created</th>
                </tr>
              </thead>
              <tbody>
                {displayedLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => setSelectedLead(lead)}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                          {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="font-medium text-slate-800">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <div>{lead.email}</div>
                      <div className="text-slate-400">{lead.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {getLeadSource(lead) === "whatsapp" ? (
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        ) : <Mail className="h-3 w-3" />}
                        {getLeadSource(lead) === "whatsapp" ? "WhatsApp" : "Email"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full capitalize",
                        getLeadStatus(lead) === "approved" ? "bg-green-100 text-green-600" :
                        getLeadStatus(lead) === "declined" ? "bg-red-100 text-red-600" :
                        getLeadStatus(lead) === "active" ? "bg-blue-100 text-blue-600" :
                        "bg-yellow-100 text-yellow-600"
                      )}>
                        {getLeadStatus(lead)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon key={i} filled={i < getLeadRating(lead)} />
                        ))}
                        <span className="text-xs text-slate-500 ml-1">{getLeadRating(lead)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={async (updates) => {
            const response = await fetch(`/api/leads/${selectedLead.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updates),
            })
            if (response.ok) {
              const updatedLead = await response.json()
              setSelectedLead(updatedLead)
              mutate()
            }
          }}
          onSendMessage={async (action, message) => {
            const response = await fetch(`/api/leads/${selectedLead.id}/send`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action, message }),
            })
            if (response.ok) {
              const result = await response.json()
              setSelectedLead(result.lead)
              mutate()
            }
          }}
        />
      )}
    </ThemeBackground>
  )
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={cn("h-3.5 w-3.5", filled ? "text-slate-500 fill-slate-500" : "text-slate-300")}
      viewBox="0 0 24 24"
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={1.5}
      fill={filled ? "currentColor" : "none"}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
