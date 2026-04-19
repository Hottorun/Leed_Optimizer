"use client"

import { useState, useMemo, useEffect, useRef, Suspense } from "react"
import useSWR from "swr"
import { useRouter, useSearchParams } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { LeadDetailPanel } from "@/components/lead-detail-panel"
import { ImportLeadModal } from "@/components/import-lead-modal"
import { Search, Mail, Plus, ChevronRight, ChevronDown, ArrowUpDown, LayoutGrid, List, Clock, Star, X, Check, CheckCircle2, AlertCircle, Sparkles, Zap } from "lucide-react"
import type { Lead } from "@/lib/types"
import { getSafeString } from "@/lib/lead-utils"
import { cn } from "@/lib/utils"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { useUser } from "@/lib/use-user"
import { toast } from "sonner"

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
  const { data: leadsData, mutate } = useSWR<Lead[]>("/api/leads", fetcher, { refreshInterval: 30000 })
  const leads = Array.isArray(leadsData) ? leadsData : []
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [sourceFilter, setSourceFilter] = useState<"all" | "whatsapp" | "email">("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("rating-high")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedActionLeads, setSelectedActionLeads] = useState<Set<string>>(new Set())
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  const [newLeadNotif, setNewLeadNotif] = useState<{ message: string; id: string } | null>(null)
  const prevLeadIdsRef = useRef<Set<string>>(new Set())

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
      setStatusFilter(filter)
    }
  }, [])

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login")
    }
  }, [user, userLoading, router])

  // Track last fetched time and detect new leads for toast
  useEffect(() => {
    if (leads.length === 0) return
    setLastFetched(new Date())

    const currentIds = new Set(leads.map(l => l.id))
    if (prevLeadIdsRef.current.size > 0) {
      const newLeads = leads.filter(l => !prevLeadIdsRef.current.has(l.id))
      if (newLeads.length > 0) {
        const lead = newLeads[0]
        setNewLeadNotif({
          message: newLeads.length === 1
            ? `New lead: ${lead.name}`
            : `${newLeads.length} new leads received`,
          id: lead.id,
        })
        setTimeout(() => setNewLeadNotif(null), 5000)
      }
    }
    prevLeadIdsRef.current = currentIds
  }, [leads])

  const getLeadRating = (lead: Lead): number => lead.session?.rating ?? lead.rating ?? 0
  const getLeadStatus = (lead: Lead): string => lead.session?.status || lead.status || "pending"
  const getCollectedDataFirst = (collectedData: Record<string, unknown> | Record<string, unknown>[] | null | undefined): Record<string, unknown> => {
    if (!collectedData) return {}
    if (Array.isArray(collectedData)) return collectedData[0] || {}
    return collectedData
  }
  const getLeadSource = (lead: Lead): string => {
    const collectedData = getCollectedDataFirst(lead.session?.collectedData)
    if (typeof collectedData?.source === "string") return collectedData.source
    if (lead.phone) return "whatsapp"
    if (lead.email) return "email"
    return ""
  }
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2)

  const handleApproveLead = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Failed to approve lead")
      }
      mutate()
    } catch {
      toast.error("Failed to approve lead")
    }
  }

  const handleDeclineLead = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "declined" }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Failed to decline lead")
      }
      mutate()
    } catch {
      toast.error("Failed to decline lead")
    }
  }

  const handleBatchApprove = async () => {
    const ids = Array.from(selectedActionLeads)
    const results = await Promise.allSettled(
      ids.map(leadId =>
        fetch(`/api/leads/${leadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved" }),
        })
      )
    )
    const failed = results.filter(r => r.status === "rejected").length
    setSelectedActionLeads(new Set())
    mutate()
    if (failed > 0) {
      toast.error(`${failed} lead${failed > 1 ? "s" : ""} failed to approve`)
    }
  }

  const handleDeleteLead = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to delete lead")
      }
      if (selectedLead?.id === leadId) setSelectedLead(null)
      mutate()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete lead"
      throw new Error(msg)
    }
  }

  const handleDeleteAllDeclined = async () => {
    const ids = declinedLeads.map(l => l.id)
    const results = await Promise.allSettled(
      ids.map(id => fetch(`/api/leads/${id}`, { method: "DELETE" }))
    )
    const failed = results.filter(r => r.status === "rejected").length
    setSelectedActionLeads(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.delete(id))
      return next
    })
    mutate()
    if (failed > 0) {
      toast.error(`${failed} lead${failed > 1 ? "s" : ""} failed to delete`)
    }
  }

  const handleBatchDecline = async () => {
    const ids = Array.from(selectedActionLeads)
    const results = await Promise.allSettled(
      ids.map(leadId =>
        fetch(`/api/leads/${leadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "declined" }),
        })
      )
    )
    const failed = results.filter(r => r.status === "rejected").length
    setSelectedActionLeads(new Set())
    mutate()
    if (failed > 0) {
      toast.error(`${failed} lead${failed > 1 ? "s" : ""} failed to decline`)
    }
  }

  const toggleSelectAll = () => {
    if (selectedActionLeads.size === actionLeads.length) {
      setSelectedActionLeads(new Set())
    } else {
      setSelectedActionLeads(new Set(actionLeads.map(l => l.id)))
    }
  }

  const toggleSelectLead = (leadId: string) => {
    const newSet = new Set(selectedActionLeads)
    if (newSet.has(leadId)) {
      newSet.delete(leadId)
    } else {
      newSet.add(leadId)
    }
    setSelectedActionLeads(newSet)
  }

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

  const manualLeads = useMemo(() => {
    return actionLeads.filter(l => getLeadStatus(l) === "manual")
  }, [actionLeads])

  const declinedLeads = useMemo(() => {
    return actionLeads.filter(l => getLeadStatus(l) === "declined")
  }, [actionLeads])

  const reviewedToday = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return leads.filter(l => {
      const updated = new Date(l.updatedAt || l.createdAt)
      const status = getLeadStatus(l)
      return updated >= today && (status === "approved" || status === "declined")
    }).length
  }, [leads])

  const toReviewCount = manualLeads.length + declinedLeads.length
  const reviewedCount = reviewedToday
  const progressPercent = toReviewCount > 0 ? Math.min((reviewedCount / toReviewCount) * 100, 100) : 0
  const minsToFinish = Math.ceil((toReviewCount - reviewedCount) * 0.5)

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

    return [...filtered].sort((a, b) => {
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
  }, [leads, searchQuery, sourceFilter, statusFilter, sortBy])

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
        className="rounded-lg border border-border bg-card p-4 hover:border-foreground/30 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
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
                  i < rating ? "text-yellow-400 fill-yellow-400" : "text-border"
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

  const renderActionCard = (lead: Lead, isDeclined: boolean = false, key?: string) => {
    const rating = getLeadRating(lead)
    const status = getLeadStatus(lead)
    const source = getLeadSource(lead)
    const initials = getInitials(lead.name)
    const isSelected = selectedActionLeads.has(lead.id)
    const aiSummary = lead.session?.ratingReason || ""

    return (
      <div
        key={key}
        onClick={() => setSelectedLead(lead)}
        className={cn(
          "bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:border-foreground/30 hover:shadow-sm hover:-translate-y-0.5 transition-all flex flex-col",
          isDeclined && "opacity-75",
          isSelected && "ring-2 ring-foreground/50"
        )}
      >
        {/* Card Header */}
        <div className="p-4 flex flex-col flex-1" style={{ minHeight: "180px" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">{lead.name}</h3>
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
                <p className="text-xs text-muted-foreground">{getTimeAgo(lead.createdAt)} ago · {source === "whatsapp" ? "WhatsApp" : "Email"}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleSelectLead(lead.id)
              }}
              className={cn(
                "w-5 h-5 rounded border transition-colors flex items-center justify-center",
                isSelected 
                  ? "bg-foreground border-foreground text-background" 
                  : "border-border hover:border-foreground/50"
              )}
            >
              {isSelected && <Check className="h-3 w-3" />}
            </button>
          </div>

          {/* Score Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn(
                  "h-3.5 w-3.5",
                  i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                )} />
              ))}
            </div>
            <span className="text-xs px-2 py-1 bg-foreground text-background rounded-md font-semibold">
              {rating.toFixed(1)} / 5
            </span>
          </div>

          {/* AI Reasoning Box - Animated gradient border */}
          <div
            className="relative rounded-lg mb-3 min-h-[80px]"
            style={{
              padding: "1.5px",
              background: "linear-gradient(90deg, #8B5CF6, #A855F7, #3B82F6, #8B5CF6)",
              backgroundSize: "200% 100%",
              animation: "gradient-x 3s linear infinite"
            }}
          >
            <div className="rounded-md p-2.5 h-full" style={{ backgroundColor: "var(--card)" }}>
              {aiSummary ? (
                <>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3 h-3 text-violet-400" />
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">AI Reasoning</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{aiSummary}</p>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  No AI reasoning available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Actions - flush to bottom */}
        <div className="flex border-t-[1.5px] border-border mt-auto">
          {status === "declined" ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteLead(lead.id)
                }}
                className="flex-1 px-4 py-2.5 text-sm text-[var(--status-declined)] hover:bg-[var(--status-declined-bg)] transition-colors border-r border-border"
              >
                Delete permanently
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleApproveLead(lead.id)
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--status-approved)] hover:bg-[var(--status-approved-bg)] transition-colors"
              >
                Override & approve
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeclineLead(lead.id)
                }}
                className="flex-1 px-4 py-2.5 text-sm text-muted-foreground hover:text-[var(--status-declined)] hover:bg-[var(--status-declined-bg)] transition-colors border-r border-border"
              >
                Decline
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleApproveLead(lead.id)
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--status-approved)] hover:bg-[var(--status-approved-bg)] transition-colors"
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  const renderActionTab = () => (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ fontWeight: 600, letterSpacing: "-0.5px" }}>Needs Action</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and decide on these leads</p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-semibold tracking-tight">{toReviewCount}</span>
            <span className="text-xs text-muted-foreground">To review</span>
          </div>
          <div className="w-[2px] h-9 bg-border opacity-60" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-semibold tracking-tight">{reviewedCount}</span>
            <span className="text-xs text-muted-foreground">Done today</span>
          </div>
          <div className="w-[2px] h-9 bg-border opacity-60" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Today's progress</span>
              <span className="text-xs text-muted-foreground">{reviewedCount} / {toReviewCount}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-foreground rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="w-[2px] h-9 bg-border opacity-60" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-semibold tracking-tight">{minsToFinish > 0 ? minsToFinish : 0}</span>
            <span className="text-xs text-muted-foreground">Min to finish</span>
          </div>
        </div>
      </div>

      {/* Batch Action Toolbar */}
      <div 
        className="rounded-xl flex items-center px-4 py-3 border border-border"
        style={{ backgroundColor: "var(--card)" }}
      >
        <button
          onClick={toggleSelectAll}
          className={cn(
            "w-4 h-4 rounded border transition-colors flex items-center justify-center mr-3",
            selectedActionLeads.size === actionLeads.length && actionLeads.length > 0
              ? "bg-foreground border-foreground"
              : "border-muted-foreground"
          )}
          style={{ color: "var(--background)" }}
        >
          {selectedActionLeads.size === actionLeads.length && actionLeads.length > 0 && <Check className="h-2.5 w-2.5" />}
        </button>
        <span className="flex-1 text-sm text-foreground opacity-70">
          {selectedActionLeads.size > 0 
            ? `${selectedActionLeads.size} selected`
            : "Select leads to batch approve or decline"
          }
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleBatchApprove}
            disabled={selectedActionLeads.size === 0}
            className="text-xs px-4 py-1.5 rounded-md font-medium text-white disabled:opacity-30 transition-opacity"
            style={{ backgroundColor: "var(--status-approved)" }}
          >
            Approve
          </button>
          <button
            onClick={handleBatchDecline}
            disabled={selectedActionLeads.size === 0}
            className="text-xs px-4 py-1.5 rounded-md font-medium text-white disabled:opacity-30 transition-opacity"
            style={{ backgroundColor: "var(--status-declined)" }}
          >
            Decline
          </button>
        </div>
      </div>

      {/* Manual Review Section */}
      {manualLeads.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Manual review</span>
            <span className="px-2 py-0.5 text-xs bg-[var(--status-manual-bg)] text-[var(--status-manual)] rounded-full font-medium">{manualLeads.length}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">AI was unsure — your call</p>
          <div className="w-full h-[2px] bg-border opacity-60 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...manualLeads].sort((a, b) => getLeadRating(b) - getLeadRating(a)).map((lead) => renderActionCard(lead, false, lead.id))}
          </div>
        </div>
      )}

      {/* AI Declined Section */}
      {declinedLeads.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">AI declined — override?</span>
              <span className="px-2 py-0.5 text-xs bg-[var(--status-declined-bg)] text-[var(--status-declined)] rounded-full font-medium">{declinedLeads.length}</span>
            </div>
            <button
              onClick={handleDeleteAllDeclined}
              className="text-xs text-[var(--status-declined)] hover:bg-[var(--status-declined-bg)] px-2.5 py-1 rounded-md transition-colors"
            >
              Delete all declined
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">AI rejected these — approve only if you disagree</p>
          <div className="w-full h-[2px] bg-border opacity-60 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...declinedLeads].sort((a, b) => getLeadRating(b) - getLeadRating(a)).map((lead) => renderActionCard(lead, true, lead.id))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {actionLeads.length === 0 && (
        <div className="text-center py-12 border border-border rounded-xl bg-card">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-[var(--status-approved)]" />
          <h3 className="text-base font-medium">All caught up</h3>
          <p className="text-sm text-muted-foreground mt-1">No leads require attention</p>
        </div>
      )}
    </div>
  )

  const renderLeadListItem = (lead: Lead) => {
    const rating = getLeadRating(lead)
    const status = getLeadStatus(lead)
    const source = getLeadSource(lead)
    const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)

    return (
      <tr
        key={lead.id}
        onClick={() => setSelectedLead(lead)}
        className="border-b border-border hover:bg-muted/60 cursor-pointer transition-colors"
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
                i < rating ? "text-yellow-400 fill-yellow-400" : "text-border"
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

      {/* New Lead Toast */}
      {newLeadNotif && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card shadow-xl cursor-pointer max-w-xs"
          onClick={() => {
            setNewLeadNotif(null)
            router.push(`/leads?id=${newLeadNotif.id}`)
          }}
        >
          <Zap className="h-4 w-4 text-[var(--status-approved)] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{newLeadNotif.message}</p>
            <p className="text-xs text-muted-foreground">Click to view</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setNewLeadNotif(null) }} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="p-6 space-y-5 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Leads</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {leads.length} total leads
              {lastFetched && (
                <span className="ml-2">
                  · Last updated {lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </p>
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
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            All ({stats.totalLeads})
          </button>
          <button
            onClick={() => setActiveTab("action")}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5",
              activeTab === "action"
                ? "border-[var(--status-pending)] text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            Needs Action
            {stats.needsAction > 0 && (
              <span className={cn(
                "px-1.5 py-0.5 text-xs rounded-full font-medium",
                activeTab === "action"
                  ? "bg-[var(--status-pending-bg)] text-[var(--status-pending)]"
                  : "bg-muted text-muted-foreground"
              )}>{stats.needsAction}</span>
            )}
          </button>
        </div>

        {/* All Leads Tab */}
        {activeTab === "all" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 rounded-md border border-border pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
                    style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}
                  />
                </div>

                {/* Status Filters */}
                <div 
                  className="flex gap-1 p-1 rounded-lg"
                  style={{ backgroundColor: "var(--card)" }}
                >
                  {["all", "pending", "approved", "manual", "declined"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status === "all" ? "all" : status)}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-md transition-colors capitalize",
                        statusFilter === status
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {status === "all" ? "All" : status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="h-9 pl-3 pr-8 rounded-md border border-border text-sm appearance-none cursor-pointer"
                      style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}
                    >
                      <option value="rating-high">Rating: High → Low</option>
                      <option value="rating-low">Rating: Low → High</option>
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="name-az">Name A → Z</option>
                      <option value="name-za">Name Z → A</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* View Toggle */}
                <div 
                  className="flex items-center gap-0.5 border border-border rounded-lg p-1"
                  style={{ backgroundColor: "var(--card)" }}
                >
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      viewMode === "grid" ? "bg-foreground text-background" : "text-muted-foreground"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Leads Display */}
            {filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-border rounded-xl bg-card gap-2">
                <Search className="h-7 w-7 text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">No leads found</p>
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors">
                    Clear search
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLeads.map((lead) => renderLeadCard(lead))}
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden bg-card">
                <table className="w-full">
                  <thead className="border-b border-border">
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
        {activeTab === "action" && renderActionTab()}
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
            } else {
              const data = await response.json().catch(() => ({}))
              throw new Error(data.error || "Failed to update lead")
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
            } else {
              const data = await response.json().catch(() => ({}))
              throw new Error(data.error || "Failed to send message")
            }
          }}
          onDelete={async (leadId) => {
            const response = await fetch(`/api/leads/${leadId}`, {
              method: "DELETE",
            })
            if (response.ok) {
              setSelectedLead(null)
              mutate()
            } else {
              const data = await response.json().catch(() => ({}))
              throw new Error(data.error || "Failed to delete lead")
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
