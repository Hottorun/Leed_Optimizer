"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { LeadDetailPanel } from "@/components/lead-detail-panel"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import {
  TrendingUp, Clock, Star, ChevronRight,
  Target, CheckCircle, ArrowRight, Sparkles,
  AlertCircle
} from "lucide-react"
import type { Lead } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string; teamId?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    Promise.all([
      fetch("/api/auth").then(res => res.json()),
      fetch("/api/leads").then(res => res.json())
    ])
      .then(([authData, leadsData]) => {
        setUser(authData.user)
        setLeads(Array.isArray(leadsData) ? leadsData : [])
        if (!authData.user) {
          router.push("/login")
        }
      })
      .catch(() => {
        router.push("/login")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [router, mounted])

  if (!mounted || isLoading) {
    return (
      <ThemeBackground>
        <div className="min-h-screen" />
      </ThemeBackground>
    )
  }

  if (!user) {
    return null
  }

  const firstName = user.name?.split(" ")[0] || "User"

  const topLeads = [...leads]
    .filter(l => (l.session?.rating ?? 0) >= 3)
    .sort((a, b) => {
      const aRating = a.session?.rating ?? 0
      const bRating = b.session?.rating ?? 0
      if (bRating !== aRating) return bRating - aRating
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    .slice(0, 5)

  const urgentLeads = [...leads]
    .filter(l => {
      const status = l.session?.status || l.status
      return status === "pending" || status === "manual"
    })
    .sort((a, b) => {
      const aRating = a.session?.rating ?? 0
      const bRating = b.session?.rating ?? 0
      if (bRating !== aRating) return bRating - aRating
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
    .slice(0, 5)

  const stats = {
    totalLeads: leads.length,
    newToday: leads.filter(l => {
      const today = new Date()
      const created = new Date(l.createdAt)
      return created.toDateString() === today.toDateString()
    }).length,
    pending: leads.filter(l => {
      const status = l.session?.status || l.status
      return status === "pending" || status === "manual"
    }).length,
    approved: leads.filter(l => (l.session?.status || l.status) === "approved").length
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2)
  }

  const getRating = (lead: Lead): number => {
    return lead.session?.rating ?? 0
  }

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
        setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l))
      }
    } catch (error) {
      console.error("Failed to update lead:", error)
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
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const renderLeadRow = (lead: Lead, index?: number, showBadge?: boolean) => {
    const segment = lead.workType || lead.session?.collectedData?.workType || "No segment"
    const status = lead.session?.status || lead.status
    const isOverdue = status === "pending" || status === "manual"
    
    return (
      <button
        key={lead.id}
        onClick={() => setSelectedLead(lead)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted transition-colors text-left group"
      >
        {index !== undefined && (
          <span className="text-xs text-muted-foreground w-4 text-right">{index + 1}</span>
        )}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {getInitials(lead.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{lead.name}</p>
            {showBadge && isOverdue && (
              <span style={{ background: "#fff7ed", color: "#c2410c", borderRadius: "4px", padding: "2px 6px", fontSize: "11px", fontWeight: 500 }}>
                Review
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{segment}</p>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn(
              "h-3 w-3",
              i < getRating(lead) ? "text-yellow-500 fill-yellow-500" : "text-muted"
            )} />
          ))}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    )
  }

  return (
    <div key={user.id}>
      <AppHeader onRefresh={() => {}} isRefreshing={false} user={{ name: user.name, email: user.email }} leads={leads} />
      <ThemeBackground>
        {selectedLead && (
          <LeadDetailPanel
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onUpdate={handleUpdateLead}
            onSendMessage={handleSendMessage}
          />
        )}
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
          {/* Centered Greeting with AI Badge */}
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground mb-4">
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
              AI-Powered Lead Management
            </div>
            <h1 className="text-2xl font-semibold tracking-tight" style={{ fontWeight: 600, letterSpacing: "-0.5px" }}>
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {firstName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Here&apos;s your lead overview</p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/leads" className="rounded-lg border border-border bg-card p-4 hover:border-foreground/30 transition-colors" style={{ borderLeft: "3px solid #111" }}>
              <p className="text-xs text-muted-foreground">Total Leads</p>
              <p className="text-3xl font-semibold mt-1" style={{ letterSpacing: "-1px" }}>{stats.totalLeads}</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.totalLeads > 0 ? "All time" : "No leads yet"}</p>
            </Link>
            <Link href="/leads?sort=newest" className="rounded-lg border border-border bg-card p-4 hover:border-foreground/30 transition-colors">
              <p className="text-xs text-muted-foreground">New Today</p>
              <p className="text-3xl font-semibold mt-1" style={{ letterSpacing: "-1px" }}>{stats.newToday}</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.newToday > 0 ? "Ready to contact" : "No new leads"}</p>
            </Link>
            <Link href="/leads?tab=action" className="rounded-lg border border-border bg-card p-4 hover:border-foreground/30 transition-colors" style={{ borderLeft: "3px solid #f59e0b" }}>
              <p className="text-xs text-muted-foreground">Needs Review</p>
              <p className="text-3xl font-semibold mt-1" style={{ letterSpacing: "-1px" }}>{stats.pending}</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.pending > 0 ? "Action required" : "All caught up"}</p>
            </Link>
            <Link href="/leads?filter=approved" className="rounded-lg border border-border bg-card p-4 hover:border-foreground/30 transition-colors" style={{ borderLeft: "3px solid #22c55e" }}>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-3xl font-semibold mt-1" style={{ letterSpacing: "-1px" }}>{stats.approved}</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.approved > 0 ? "Ready to convert" : "No approved leads"}</p>
            </Link>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Top Leads */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div style={{ width: "20px", height: "20px", borderRadius: "6px", background: "#f4f4f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h2 className="text-sm font-medium" style={{ fontWeight: 600, letterSpacing: "-0.5px" }}>Top Leads</h2>
                </div>
                <Link href="/leads" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="p-2">
                {topLeads.length > 0 ? (
                  topLeads.map((lead, index) => renderLeadRow(lead, index))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No leads yet
                  </div>
                )}
              </div>
            </div>

            {/* Needs Attention */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div style={{ width: "20px", height: "20px", borderRadius: "6px", background: "#f4f4f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h2 className="text-sm font-medium" style={{ fontWeight: 600, letterSpacing: "-0.5px" }}>Needs Attention</h2>
                </div>
                <Link href="/leads?tab=action" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="p-2">
                {urgentLeads.length > 0 ? (
                  urgentLeads.map((lead) => renderLeadRow(lead, undefined, true))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    All caught up
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
