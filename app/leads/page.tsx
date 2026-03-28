"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import useSWR from "swr"
import { useRouter, useSearchParams } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { LeadDetailPanel } from "@/components/lead-detail-panel"
import { ImportLeadModal } from "@/components/import-lead-modal"
import { Search, Mail, Plus, ChevronRight, ArrowUpDown, LayoutGrid, List, Clock, Star, X, Check } from "lucide-react"
import type { Lead } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { useUser } from "@/lib/use-user"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type SortOption = "newest" | "oldest" | "rating-high" | "rating-low" | "name-az" | "name-za"
type TabType = "overview" | "all" | "action"

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground text-sm">Loading...</div>}>
      <LeadsContent />
    </Suspense>
  )
}

function LeadsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: userLoading } = useUser()
  const { data: leads = [], mutate } = useSWR<Lead[]>("/api/leads", fetcher)
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [sourceFilter, setSourceFilter] = useState<"all" | "whatsapp" | "email">("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("rating-high")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const leadId = searchParams.get("id")
    if (leadId && leads.length > 0) {
      const lead = leads.find(l => l.id === leadId)
      if (lead) {
        setSelectedLead(lead)
        router.replace("/leads", { scroll: false })
      }
    }
  }, [searchParams, leads, router])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get("tab")
    const filter = params.get("filter")

    if (tab === "action") {
      setActiveTab("action")
    } else if (filter) {
      setActiveTab("all")
      if (filter) setStatusFilter(filter)
    }
  }, [])

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login")
    }
  }, [user, userLoading, router])

  const getLeadRating = (lead: Lead): number => lead.session?.rating ?? lead.rating ?? 0
  const getLeadStatus = (lead: Lead): string => lead.session?.status || lead.status || "pending"
  const getLeadSource = (lead: Lead): string => {
    if (lead.phone) return "whatsapp"
    if (lead.email) return "email"
    return ""
  }

  const handleApproveLead = async (leadId: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })
      mutate()
    } catch (error) {
      console.error("Failed to approve lead:", error)
    }
  }

  const handleDeclineLead = async (leadId: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "declined" }),
      })
      mutate()
    } catch (error) {
      console.error("Failed to decline lead:", error)
    }
  }

  const stats = useMemo(() => {
    const totalLeads = leads.length
    const pendingLeads = leads.filter(l => getLeadStatus(l) === "pending").length
    const manualReview = leads.filter(l => getLeadStatus(l) === "manual").length
    const declined = leads.filter(l => getLeadStatus(l) === "declined").length
    const approved = leads.filter(l => getLeadStatus(l) === "approved").length
    const needsAction = manualReview + declined

    return {
      totalLeads,
      pendingLeads,
      manualReview,
      declined,
      approved,
      needsAction,
      whatsapp: leads.filter(l => getLeadSource(l) === "whatsapp").length,
      email: leads.filter(l => getLeadSource(l) === "email").length,
    }
  }, [leads])

  const actionLeads = useMemo(() => {
    return leads.filter(l => {
      const status = getLeadStatus(l)
      return status === "manual" || status === "declined"
    })
  }, [leads])

  const sortLeads = (leadsToSort: Lead[]) => {
    return [...leadsToSort].sort((a, b) => {
      const ratingA = getLeadRating(a)
      const ratingB = getLeadRating(b)
      switch (sortBy) {
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "rating-high": return ratingB - ratingA
        case "rating-low": return ratingA - ratingB
        case "name-az": return a.name.localeCompare(b.name)
        case "name-za": return b.name.localeCompare(a.name)
        default: return 0
      }
    })
  }

  const filteredLeads = useMemo(() => {
    let filtered = leads

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(query) ||
        l.phone?.includes(query) ||
        l.email?.toLowerCase().includes(query)
      )
    }

    if (sourceFilter !== "all") {
      filtered = filtered.filter(l => getLeadSource(l) === sourceFilter)
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(l => getLeadStatus(l) === statusFilter)
    }

    return sortLeads(filtered)
  }, [leads, searchQuery, sourceFilter, statusFilter, sortBy])

  const getTimeAgo = (date: Date | string) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    return `${diffDays}d`
  }

  const renderLeadCard = (lead: Lead) => {
    const rating = getLeadRating(lead)
    const status = getLeadStatus(lead)
    const workType = lead.session?.collectedData?.workType || lead.workType || "-"
    const source = getLeadSource(lead)
    const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)

    return (
      <div
        key={lead.id}
        onClick={() => setSelectedLead(lead)}
        className="rounded-lg border border-border bg-card p-4 hover:border-foreground/30 transition-all cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-medium truncate">{lead.name}</h3>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full capitalize font-medium",
                status === "approved" && "bg-[var(--status-approved-bg)] text-[var(--status-approved)]",
                status === "pending" && "bg-[var(--status-pending-bg)] text-[var(--status-pending)]",
                status === "manual" && "bg-[var(--status-manual-bg)] text-[var(--status-manual)]",
                status === "declined" && "bg-[var(--status-declined-bg)] text-[var(--status-declined)]",
              )}>
                {status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{workType}</p>
          </div>
          <div className="text-xs text-muted-foreground">
            {getTimeAgo(lead.createdAt)}
          </div>
        </div>

        {/* Rating & AI Recommendation */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn(
                  "h-3 w-3",
                  i < rating ? "text-foreground fill-foreground" : "text-muted"
                )} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{source === "whatsapp" ? "WhatsApp" : "Email"}</span>
          </div>
          {lead.session?.ratingReason && (
            <p className="text-xs text-muted-foreground line-clamp-2">{lead.session.ratingReason}</p>
          )}
        </div>

        {/* Actions for action tab */}
        {(status === "manual" || status === "declined") && activeTab === "action" && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleApproveLead(lead.id)
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-md hover:bg-foreground/90 transition-colors"
            >
              <Check className="h-3 w-3" />
              Approve
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeclineLead(lead.id)
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border text-xs font-medium rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-3 w-3" />
              Decline
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderLeadListItem = (lead: Lead) => {
    const rating = getLeadRating(lead)
    const status = getLeadStatus(lead)
    const source = getLeadSource(lead)
    const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)

    return (
      <tr
        key={lead.id}
        onClick={() => setSelectedLead(lead)}
        className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {initials}
            </div>
            <span className="text-sm font-medium">{lead.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
          {lead.email || lead.phone || "-"}
        </td>
        <td className="px-4 py-3">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full capitalize font-medium",
            status === "approved" && "bg-[var(--status-approved-bg)] text-[var(--status-approved)]",
            status === "pending" && "bg-[var(--status-pending-bg)] text-[var(--status-pending)]",
            status === "manual" && "bg-[var(--status-manual-bg)] text-[var(--status-manual)]",
            status === "declined" && "bg-[var(--status-declined-bg)] text-[var(--status-declined)]",
          )}>
            {status}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn(
                "h-3 w-3",
                i < rating ? "text-foreground fill-foreground" : "text-muted"
              )} />
            ))}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
          {source === "whatsapp" ? "WhatsApp" : "Email"}
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground">
          {getTimeAgo(lead.createdAt)}
        </td>
      </tr>
    )
  }

  return (
    <ThemeBackground>
      <AppHeader onRefresh={mutate} isRefreshing={false} user={user ? { name: user.name, email: user.email } : undefined} leads={leads || []} />

      <div className="p-6 space-y-5 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Leads</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{leads.length} total leads</p>
          </div>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Import
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border pb-px">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "all"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            All ({stats.totalLeads})
          </button>
          <button
            onClick={() => setActiveTab("action")}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5",
              activeTab === "action"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Needs Action
            {stats.needsAction > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-muted">{stats.needsAction}</span>
            )}
          </button>
        </div>

        {/* All Leads Tab */}
        {activeTab === "all" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
                />
              </div>

              {/* Status Filters */}
              <div className="flex gap-1">
                {["all", "pending", "approved", "manual", "declined"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status === "all" ? "all" : status)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-md border transition-colors capitalize",
                      statusFilter === status
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground/30"
                    )}
                  >
                    {status === "all" ? "All" : status}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-9 px-3 rounded-md border border-border bg-background text-sm appearance-none cursor-pointer"
              >
                <option value="rating-high">Rating</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name-az">Name A-Z</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center gap-0.5 border border-border rounded-md p-0.5">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    viewMode === "grid" ? "bg-foreground text-background" : "text-muted-foreground"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Leads Display */}
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No leads found
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLeads.map((lead) => renderLeadCard(lead))}
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">Contact</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Rating</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Source</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => renderLeadListItem(lead))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Action Tab */}
        {activeTab === "action" && (
          <div className="space-y-6">
            {actionLeads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortLeads(actionLeads).map((lead) => renderLeadCard(lead))}
              </div>
            ) : (
              <div className="text-center py-12 border border-border rounded-lg">
                <Check className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h3 className="text-base font-medium">All caught up</h3>
                <p className="text-sm text-muted-foreground mt-1">No leads require attention</p>
              </div>
            )}
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

      <ImportLeadModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => mutate()}
      />
    </ThemeBackground>
  )
}
