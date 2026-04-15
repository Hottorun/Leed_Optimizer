"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { LeadDetailPanel } from "@/components/lead-detail-panel"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/use-user"
import { getLeadStatus, getLeadRating, getLeadInitials } from "@/lib/lead-utils"
import {
  Clock, Star, ChevronRight,
  ArrowRight, CheckCircle2, Users
} from "lucide-react"
import type { Lead } from "@/lib/types"
import { useEffect } from "react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then(res => res.json())

// ── LeadRow component (proper component, not inline render function) ──────────

interface LeadRowProps {
  lead: Lead
  index?: number
  showBadge?: boolean
  onSelect: (lead: Lead) => void
}

function LeadRow({ lead, index, showBadge, onSelect }: LeadRowProps) {
  const segment = lead.workType || lead.session?.collectedData?.workType || "No segment"
  const status = getLeadStatus(lead)
  const isOverdue = status === "pending" || status === "manual"
  const rating = getLeadRating(lead)

  return (
    <button
      onClick={() => onSelect(lead)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted transition-colors text-left group"
    >
      {index !== undefined && (
        <span className="text-xs text-muted-foreground w-4 text-right">{index + 1}</span>
      )}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
        {getLeadInitials(lead.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{lead.name}</p>
          {showBadge && isOverdue && (
            <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[var(--status-pending-bg)] text-[var(--status-pending)]">
              Review
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{segment}</p>
      </div>
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={cn(
            "h-3 w-3",
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-border"
          )} />
        ))}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const { data: leadsData, mutate, isValidating } = useSWR<Lead[]>("/api/leads", fetcher)
  const leads = Array.isArray(leadsData) ? leadsData : []
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login")
    }
  }, [user, userLoading, router])

  const topLeads = useMemo(() =>
    [...leads]
      .filter(l => getLeadRating(l) >= 3)
      .sort((a, b) => {
        const diff = getLeadRating(b) - getLeadRating(a)
        if (diff !== 0) return diff
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      .slice(0, 5),
    [leads]
  )

  const urgentLeads = useMemo(() =>
    [...leads]
      .filter(l => {
        const status = getLeadStatus(l)
        return status === "pending" || status === "manual"
      })
      .sort((a, b) => {
        const diff = getLeadRating(b) - getLeadRating(a)
        if (diff !== 0) return diff
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
      .slice(0, 5),
    [leads]
  )

  const stats = useMemo(() => {
    const today = new Date().toDateString()
    return {
      totalLeads: leads.length,
      newToday: leads.filter(l => new Date(l.createdAt).toDateString() === today).length,
      pending: leads.filter(l => {
        const status = getLeadStatus(l)
        return status === "pending" || status === "manual"
      }).length,
      approved: leads.filter(l => getLeadStatus(l) === "approved").length,
    }
  }, [leads])

  const handleUpdateLead = async (updates: Partial<Lead>) => {
    if (!selectedLead) return
    try {
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
        toast.error(data.error || "Failed to update lead")
      }
    } catch {
      toast.error("Failed to update lead")
    }
  }

  const handleSendMessage = async (action: "approve" | "decline", message: string) => {
    if (!selectedLead) return
    try {
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send message"
      throw new Error(msg)
    }
  }

  if (userLoading || !user) {
    return (
      <ThemeBackground>
        <div className="min-h-screen" />
      </ThemeBackground>
    )
  }

  const firstName = user.name?.split(" ")[0] || "User"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"

  return (
    <div>
      <AppHeader onRefresh={mutate} isRefreshing={isValidating} user={{ name: user.name, email: user.email }} leads={leads} />
      <ThemeBackground>
        {selectedLead && (
          <LeadDetailPanel
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onUpdate={handleUpdateLead}
            onSendMessage={handleSendMessage}
            onDelete={async (leadId) => {
              const response = await fetch(`/api/leads/${leadId}`, { method: "DELETE" })
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
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
          {/* Greeting */}
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-approved)]" />
              AI-Powered Lead Management
            </div>
            <h1 className="text-2xl font-semibold tracking-tight" style={{ letterSpacing: "-0.5px" }}>
              Good {greeting}, {firstName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Here&apos;s your lead overview</p>
            <div className="mt-5 mx-auto flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-border" />
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-border" />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/leads" className="rounded-lg border border-border bg-card p-4 hover:border-foreground/30 hover:shadow-sm hover:-translate-y-0.5 transition-all border-l-2 border-l-foreground/20">
              <p className="text-xs text-muted-foreground">Total Leads</p>
              <p className="text-3xl font-semibold mt-1 tracking-tight">{stats.totalLeads}</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.totalLeads > 0 ? "All time" : "No leads yet"}</p>
            </Link>
            <Link href="/leads?sort=newest" className="rounded-lg border border-border bg-card p-4 hover:border-foreground/30 hover:shadow-sm hover:-translate-y-0.5 transition-all">
              <p className="text-xs text-muted-foreground">New Today</p>
              <p className="text-3xl font-semibold mt-1 tracking-tight">{stats.newToday}</p>
              <p className={cn("text-xs mt-1", stats.newToday > 0 ? "text-[var(--status-approved)] font-medium" : "text-muted-foreground")}>{stats.newToday > 0 ? "Ready to contact" : "No new leads"}</p>
            </Link>
            <Link href="/leads?tab=action" className="rounded-lg border border-border bg-card p-4 hover:border-foreground/30 hover:shadow-sm hover:-translate-y-0.5 transition-all border-l-2 border-l-[var(--status-pending)]">
              <p className="text-xs text-muted-foreground">Needs Review</p>
              <p className="text-3xl font-semibold mt-1 tracking-tight">{stats.pending}</p>
              <p className={cn("text-xs mt-1", stats.pending > 0 ? "text-[var(--status-pending)] font-medium" : "text-muted-foreground")}>{stats.pending > 0 ? "Action required" : "All caught up"}</p>
            </Link>
            <Link href="/leads?filter=approved" className="rounded-lg border border-border bg-card p-4 hover:border-foreground/30 hover:shadow-sm hover:-translate-y-0.5 transition-all border-l-2 border-l-[var(--status-approved)]">
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-3xl font-semibold mt-1 tracking-tight">{stats.approved}</p>
              <p className={cn("text-xs mt-1", stats.approved > 0 ? "text-[var(--status-approved)] font-medium" : "text-muted-foreground")}>{stats.approved > 0 ? "Ready to convert" : "No approved leads"}</p>
            </Link>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Top Leads */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-muted">
                    <Star className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <h2 className="text-sm font-semibold tracking-tight">Top Leads</h2>
                </div>
                <Link href="/leads" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="p-2">
                {topLeads.length > 0 ? (
                  topLeads.map((lead, index) => (
                    <LeadRow key={lead.id} lead={lead} index={index} onSelect={setSelectedLead} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                    <Users className="h-6 w-6 opacity-40" />
                    <p className="text-sm">No leads yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Needs Attention */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-muted">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <h2 className="text-sm font-semibold tracking-tight">Needs Attention</h2>
                </div>
                <Link href="/leads?tab=action" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="p-2">
                {urgentLeads.length > 0 ? (
                  urgentLeads.map((lead) => (
                    <LeadRow key={lead.id} lead={lead} showBadge onSelect={setSelectedLead} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <CheckCircle2 className="h-6 w-6 text-[var(--status-approved)] opacity-70" />
                    <p className="text-sm text-muted-foreground">All caught up</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ThemeBackground>
    </div>
  )
}
