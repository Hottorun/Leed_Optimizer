"use client"

import { useState, useMemo, useEffect } from "react"
import useSWR from "swr"
import { useRouter, useSearchParams } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { LeadDetailPanel } from "@/components/lead-detail-panel"
import { ImportLeadModal } from "@/components/import-lead-modal"
import { Search, Mail, MessageCircle, Plus, Heart, ChevronRight, ArrowUpDown, X, LayoutGrid, List, Users, AlertTriangle, CheckCircle, Clock, TrendingUp, Zap, Eye, ThumbsDown, UserCheck, MapPin, Sparkles, MessageSquare, Check } from "lucide-react"
import type { Lead } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { useUser } from "@/lib/use-user"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type SortOption = "newest" | "oldest" | "rating-high" | "rating-low" | "name-az" | "name-za"
type TabType = "overview" | "all" | "action"

const statusColors = {
  approved: { bg: "#dcfce7", color: "#16a34a" },
  manual: { bg: "#dbeafe", color: "#2563eb" },
  declined: { bg: "#fee2e2", color: "#dc2626" },
  pending: { bg: "#fef3c7", color: "#d97706" },
}

export default function LeadsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: userLoading } = useUser()
  const { data: leads = [], mutate } = useSWR<Lead[]>("/api/leads", fetcher)
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [sourceFilter, setSourceFilter] = useState<"all" | "whatsapp" | "email">("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("rating-high")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAllManual, setShowAllManual] = useState(false)
  const [showAllDeclined, setShowAllDeclined] = useState(false)

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
  const [uiStyle, setUIStyle] = useState<"colored" | "minimal">("colored")

  useEffect(() => {
    const savedStyle = (localStorage.getItem("uiStyle") || "colored") as "colored" | "minimal"
    setUIStyle(savedStyle)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get("tab")
    const filter = params.get("filter")
    const sort = params.get("sort")
    
    if (tab === "action") {
      setActiveTab("action")
    } else if (filter || sort) {
      setActiveTab("all")
      if (filter) setStatusFilter(filter)
      if (sort) setSortBy(sort as SortOption)
    }
  }, [])

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login")
    }
  }, [user, userLoading, router])

  const getLeadRating = (lead: Lead): number => {
    return lead.session?.rating ?? lead.rating ?? 0
  }

  const getLeadStatus = (lead: Lead): string => {
    return lead.session?.status || lead.status || "pending"
  }

  const getLeadSource = (lead: Lead): string => {
    if (lead.phone) return "whatsapp"
    if (lead.email) return "email"
    return ""
  }

  const handleRestoreLead = async (leadId: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending" }),
      })
      mutate()
    } catch (error) {
      console.error("Failed to restore lead:", error)
    }
  }

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to permanently delete this lead?")) return
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "DELETE",
      })
      mutate()
    } catch (error) {
      console.error("Failed to delete lead:", error)
    }
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
    
    const highPriority = leads.filter(l => getLeadRating(l) >= 4).length
    const avgRating = totalLeads > 0 
      ? (leads.reduce((acc, l) => acc + getLeadRating(l), 0) / totalLeads).toFixed(1)
      : "0.0"

    const needsAction = manualReview + declined

    return {
      totalLeads,
      pendingLeads,
      manualReview,
      declined,
      approved,
      highPriority,
      avgRating,
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

  const manualReviewLeads = useMemo(() => {
    return leads.filter(l => getLeadStatus(l) === "manual")
  }, [leads])

  const declinedLeads = useMemo(() => {
    return leads.filter(l => getLeadStatus(l) === "declined")
  }, [leads])

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

  const filteredLeads = useMemo(() => {
    let filtered = leads

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(query) ||
        l.phone.includes(query) ||
        l.email.includes(query)
      )
    }

    if (sourceFilter !== "all") {
      filtered = filtered.filter(l => getLeadSource(l) === sourceFilter)
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(l => getLeadStatus(l) === statusFilter)
    }

    return sortLeads(filtered)
  }, [leads, searchQuery, sourceFilter, statusFilter])

  const getShortRequest = (summary: string) => {
    if (!summary) return ""
    const first = summary.split('.')[0].toLowerCase()
    if (first.includes('interested in')) return 'needs ' + first.split('interested in ')[1]?.slice(0, 30)
    if (first.includes('looking for')) return 'needs ' + first.split('looking for ')[1]?.slice(0, 30)
    if (first.includes('wants')) return 'needs ' + first.split('wants ')[1]?.slice(0, 30)
    if (first.includes('needs')) return first.slice(0, 40)
    if (first.includes('repair')) return 'needs repair: ' + first.split('repair')[1]?.slice(0, 25)?.trim()
    if (first.includes('fix')) return 'needs fix: ' + first.split('fix')[1]?.slice(0, 25)?.trim()
    return 'needs: ' + first.split(' ').slice(0, 4).join(' ')
  }

  const getTruncatedText = (text: string, maxLength: number = 80) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return { display: text.slice(0, maxLength) + "...", full: text }
  }

  const renderLeadCard = (lead: Lead, showActions: boolean = false, urgentStyle: boolean = false) => {
    const rating = getLeadRating(lead)
    const status = getLeadStatus(lead)
    const workType = lead.session?.collectedData?.workType || lead.workType || "Not specified"
    const location = lead.session?.collectedData?.location || lead.location || "Not specified"
    const aiRecommendation = lead.session?.aiRecommendation || "No recommendation yet"
    const conversationSummary = lead.conversationSummary || lead.session?.collectedData?.message || ""
    const shortRequest = getShortRequest(conversationSummary)
    const statusStyle = statusColors[status as keyof typeof statusColors] || statusColors.pending
    const truncatedNote = getTruncatedText(lead.session?.ratingReason || conversationSummary || "No rating reason available", 80)
    
    const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)
    
    return (
      <div
        key={lead.id}
        className={cn(
          "flex flex-col gap-3 rounded-2xl border bg-white dark:bg-slate-800 p-5 text-left transition-all cursor-pointer w-full shadow-sm",
          urgentStyle 
            ? "border-slate-200 dark:border-slate-700 hover:!border-amber-500" 
            : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
        )}
        style={{ height: 260 }}
        onClick={() => setSelectedLead(lead)}
      >
        <div className="flex items-center gap-3">
          <div 
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-xs font-bold"
            style={{ backgroundColor: "#e2e8f0", color: "#475569" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 dark:text-white truncate">{lead.name}</h3>
              {lead.isLoyal && <Heart className="h-4 w-4 shrink-0 text-pink-500 fill-pink-500" />}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{location}</span>
              <span>•</span>
              <span>{workType}</span>
            </div>
          </div>
          <span 
            className="text-xs px-2 py-0.5 rounded-full capitalize shrink-0 font-medium"
            style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
          >
            {status}
          </span>
        </div>
        
        {shortRequest && (
          <div style={{ fontSize: 13, marginTop: 6, color: "#64748b" }} className="dark:text-slate-400">
            {shortRequest}
          </div>
        )}
        
        <div className="rounded-lg border-2 border-purple-500 p-3" style={{ background: "transparent" }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5" style={{ color: "#818cf8" }} />
            <span className="text-xs" style={{ background: "linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #c084fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 600 }}>
              AI Recommendation
            </span>
            <div className="flex items-center gap-0.5 ml-auto">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={cn("h-3 w-3", i < rating ? "text-amber-400 fill-amber-400" : "text-slate-400")} viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>
          {typeof truncatedNote === 'object' ? (
            <p 
              className="text-[13px] leading-relaxed"
              style={{ color: "#ffffff", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
              title={truncatedNote.full}
            >
              {truncatedNote.display}
            </p>
          ) : (
            <p className="text-[13px] leading-relaxed" style={{ color: "#ffffff", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{truncatedNote}</p>
          )}
        </div>
        
        <div 
          className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
          style={{ borderTop: "1px solid #f1f5f9", marginTop: 12, paddingTop: 10 }}
        >
          <span className="flex items-center gap-1">
            {getLeadSource(lead) === "whatsapp" ? <MessageCircle className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
            {getLeadSource(lead) === "whatsapp" ? "WhatsApp" : "Email"}
          </span>
          <div className="flex items-center gap-2">
            <span>{lead.phone}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedLead(lead)
              }}
              style={{ background: "#1e293b", color: "white", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#334155")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1e293b")}
            >
              Contact
            </button>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleApproveLead(lead.id)
              }}
              style={{ background: "#16a34a", color: "white", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer", border: "none" }}
            >
              Approve
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeclineLead(lead.id)
              }}
              style={{ background: "white", border: "1px solid #e2e8f0", color: "#64748b", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}
            >
              Decline
            </button>
          </div>
        )}
      </div>
    )
  }

  const getTimeAgo = (date: Date | string) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return "1 day ago"
    return `${diffDays} days ago`
  }

  const getFlaggedReason = (note: string) => {
    const lowerNote = note.toLowerCase()
    if (lowerNote.includes("unverified")) return "Unverified company"
    if (lowerNote.includes("budget")) return "Budget unclear"
    if (lowerNote.includes("conflicting")) return "Conflicting info"
    return "Needs manual check"
  }

  const renderManualReviewCard = (lead: Lead) => {
    const rating = getLeadRating(lead)
    const status = getLeadStatus(lead)
    const workType = lead.session?.collectedData?.workType || lead.workType || "Not specified"
    const location = lead.session?.collectedData?.location || lead.location || "Not specified"
    const aiRecommendation = lead.session?.aiRecommendation || "No recommendation yet"
    const conversationSummary = lead.conversationSummary || lead.session?.collectedData?.message || ""
    const statusStyle = statusColors[status as keyof typeof statusColors] || statusColors.pending
    
    const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)
    const timeAgo = getTimeAgo(lead.createdAt || new Date())
    const flaggedReason = getFlaggedReason(aiRecommendation)
    
    return (
      <div
        key={lead.id}
        className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-5 text-left hover:border-slate-300 transition-all cursor-pointer w-full border-l-[3px] border-l-amber-500"
        style={{ minHeight: 220 }}
        onClick={() => setSelectedLead(lead)}
      >
        <div className="flex items-center gap-3">
          <div 
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-xs font-bold"
            style={{ backgroundColor: "#e2e8f0", color: "#475569" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 truncate">{lead.name}</h3>
              {lead.isLoyal && <Heart className="h-4 w-4 shrink-0 text-pink-500 fill-pink-500" />}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </span>
              <span className="text-slate-600">•</span>
              <span>{workType}</span>
              <span className="text-slate-600">•</span>
              <span style={{ color: "#9ca3af", fontSize: 12 }}>{timeAgo}</span>
            </div>
          </div>
          <span 
            className="text-xs px-2 py-0.5 rounded-full capitalize shrink-0 font-medium"
            style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
          >
            {status}
          </span>
        </div>
        
        <div style={{ marginTop: 6, padding: 0 }}>
          <span style={{ color: "#9ca3af", fontWeight: 500, fontSize: 13 }}>Note:</span> 
          <span style={{ color: "#64748b", fontSize: 13, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {conversationSummary.slice(0, 120)}
          </span>
        </div>
        
        <div 
          className="inline-flex items-center gap-2"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 500, marginTop: 8, width: "fit-content" }}
        >
          ⚠ {flaggedReason}
        </div>
        
        <div style={{ background: "#fafaff", border: "1px solid #e0e7ff", borderRadius: 8, padding: "10px 12px" }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5" style={{ color: "#818cf8" }} />
            <span className="text-xs" style={{ background: "linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #c084fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 600 }}>
              AI Recommendation
            </span>
            <div className="flex items-center gap-0.5 ml-auto">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={cn("h-3 w-3", i < rating ? "text-amber-400 fill-amber-400" : "text-slate-400")} viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>
          <p 
            className="text-[13px] leading-relaxed"
            style={{ color: "#374151", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {aiRecommendation}
          </p>
        </div>
        
        <div 
          className="flex items-center justify-between"
          style={{ borderTop: "1px solid #f1f5f9", marginTop: 12, paddingTop: 10 }}
        >
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              {getLeadSource(lead) === "whatsapp" ? <MessageCircle className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
              {getLeadSource(lead) === "whatsapp" ? "WhatsApp" : "Email"}
            </span>
            <span>•</span>
            <span>{lead.phone}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedLead(lead)
            }}
            style={{ background: "#1e293b", color: "white", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#334155")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1e293b")}
          >
            Contact
          </button>
        </div>
        
        <div className="flex gap-2" style={{ marginTop: 10 }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleApproveLead(lead.id)
            }}
            style={{ background: "#16a34a", color: "white", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer", border: "none" }}
          >
            Approve
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeclineLead(lead.id)
            }}
            style={{ background: "white", border: "1px solid #dc2626", color: "#dc2626", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}
          >
            Decline
          </button>
        </div>
      </div>
    )
  }

  const renderSourceBar = (label: string, value: number, total: number, icon: React.ReactNode, onClick?: () => void) => {
    const width = total > 0 ? (value / total) * 100 : 0
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none text-left"
      >
        <span className="text-xs text-slate-600 dark:text-slate-400 w-20">{label}</span>
        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-slate-800 dark:bg-slate-300 rounded-full" style={{ width: `${width}%` }} />
        </div>
        <span className="text-xs font-medium text-slate-800 dark:text-white w-6 text-right">{value}</span>
      </button>
    )
  }

  return (
    <ThemeBackground>
      <AppHeader onRefresh={mutate} isRefreshing={false} user={user ? { name: user.name, email: user.email } : undefined} leads={leads || []} />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Leads Management</h1>
            <p className="text-slate-600 mt-1">Review, approve, and manage your leads</p>
          </div>
          <button
            onClick={() => setShowImportModal(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors",
              uiStyle === "minimal" ? "bg-slate-600 hover:bg-slate-700" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            <Plus className="h-4 w-4" />
            Import Lead
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "overview" 
                ? uiStyle === "minimal" ? "border-slate-600 text-slate-700 dark:text-slate-200" : "border-indigo-600 text-indigo-600 dark:text-indigo-400" 
                : "border-transparent text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "all" 
                ? uiStyle === "minimal" ? "border-slate-600 text-slate-700 dark:text-slate-200" : "border-indigo-600 text-indigo-600 dark:text-indigo-400" 
                : "border-transparent text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Leads
              <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">{stats.totalLeads}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("action")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "action" 
                ? uiStyle === "minimal" ? "border-slate-600 text-slate-700" : "border-orange-500 text-orange-600" 
                : "border-transparent text-slate-600 hover:text-slate-700"
            )}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Needs Action
              {stats.needsAction > 0 && (
                <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">{stats.needsAction}</span>
              )}
            </div>
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-700" style={{ backgroundColor: "#111827" }}>
              <div className="flex items-stretch">
                <button
                  onClick={() => { setActiveTab("all"); setStatusFilter("all"); }}
                  className="flex-1 text-center hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none py-4"
                >
                  <p className="text-sm text-slate-400">Total Leads</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.totalLeads}</p>
                </button>
                <div className="w-px bg-slate-600 mx-2" />
                <button
                  onClick={() => { setActiveTab("all"); setStatusFilter("approved"); }}
                  className="flex-1 text-center hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none py-4"
                >
                  <p className="text-sm text-slate-400">Approved</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.approved}</p>
                </button>
                <div className="w-px bg-slate-600 mx-2" />
                <button
                  onClick={() => { setActiveTab("action"); }}
                  className="flex-1 text-center hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none py-4"
                >
                  <p className="text-sm text-slate-400">Needs Action</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.needsAction}</p>
                </button>
                <div className="w-px bg-slate-600 mx-2" />
                <button
                  onClick={() => { setActiveTab("all"); setStatusFilter("pending"); }}
                  className="flex-1 text-center hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none py-4"
                >
                  <p className="text-sm text-slate-400">Pending</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.pendingLeads}</p>
                </button>
              </div>
            </div>

            {actionLeads.length > 0 && (
              <div className="rounded-2xl border border-orange-200 dark:border-orange-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-white">Leads Requiring Human Action</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("action")}
                    className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
                  >
                    View All →
                  </button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {actionLeads.slice(0, 3).map(lead => renderLeadCard(lead, false, true))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-700 p-5 bg-white">
                <h3 className="font-semibold text-slate-800 mb-4">Lead Status Breakdown</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => { setActiveTab("all"); setStatusFilter("pending"); }}
                    className="flex items-center justify-between w-full hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.pending.color }} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Pending</span>
                    </div>
                    <span className="font-medium text-slate-800 dark:text-white">{stats.pendingLeads}</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab("all"); setStatusFilter("manual"); }}
                    className="flex items-center justify-between w-full hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.manual.color }} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Manual Review</span>
                    </div>
                    <span className="font-medium text-slate-800 dark:text-white">{stats.manualReview}</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab("all"); setStatusFilter("approved"); }}
                    className="flex items-center justify-between w-full hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.approved.color }} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Approved</span>
                    </div>
                    <span className="font-medium text-slate-800 dark:text-white">{stats.approved}</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab("all"); setStatusFilter("declined"); }}
                    className="flex items-center justify-between w-full hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.declined.color }} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Declined</span>
                    </div>
                    <span className="font-medium text-slate-800 dark:text-white">{stats.declined}</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 p-5 bg-white">
                <h3 className="font-semibold text-slate-800 mb-4">Source Breakdown</h3>
                <div className="space-y-3">
                  {renderSourceBar("WhatsApp", stats.whatsapp, stats.totalLeads, 
                    <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>,
                    () => { setActiveTab("all"); setSourceFilter("whatsapp"); }
                  )}
                  {renderSourceBar("Email", stats.email, stats.totalLeads, <Mail className="h-4 w-4 text-blue-500" />, () => { setActiveTab("all"); setSourceFilter("email"); })}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Average Rating</span>
                    <span className="font-bold text-slate-800 dark:text-white">{stats.avgRating} / 5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "all" && (
          <>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                    statusFilter === "all" ? "bg-slate-800 border-slate-800 text-white" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                  )}
                >
                  All ({stats.totalLeads})
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                    statusFilter === "pending" 
                      ? uiStyle === "minimal" ? "bg-slate-600 border-slate-600 text-white" : "bg-yellow-600 border-yellow-600 text-white" 
                      : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                  )}
                >
                  Pending ({stats.pendingLeads})
                </button>
                <button
                  onClick={() => setStatusFilter("approved")}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                    statusFilter === "approved" 
                      ? uiStyle === "minimal" ? "bg-slate-600 border-slate-600 text-white" : "bg-green-600 border-green-600 text-white" 
                      : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                  )}
                >
                  Approved ({stats.approved})
                </button>
                <button
                  onClick={() => setStatusFilter("manual")}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                    statusFilter === "manual" 
                      ? uiStyle === "minimal" ? "bg-slate-600 border-slate-600 text-white" : "bg-orange-600 border-orange-600 text-white" 
                      : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                  )}
                >
                  Manual ({stats.manualReview})
                </button>
                <button
                  onClick={() => setStatusFilter("declined")}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                    statusFilter === "declined" 
                      ? uiStyle === "minimal" ? "bg-slate-600 border-slate-600 text-white" : "bg-red-600 border-red-600 text-white" 
                      : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                  )}
                >
                  Declined ({stats.declined})
                </button>
                <div className="h-6 w-px bg-gray-200 dark:bg-slate-600 mx-2" />
                <button
                  onClick={() => setSourceFilter(sourceFilter === "whatsapp" ? "all" : "whatsapp")}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                    sourceFilter === "whatsapp" 
                      ? uiStyle === "minimal" ? "bg-slate-600 border-slate-600 text-white" : "bg-green-600 border-green-600 text-white" 
                      : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                  )}
                >
                  WhatsApp ({stats.whatsapp})
                </button>
                <button
                  onClick={() => setSourceFilter(sourceFilter === "email" ? "all" : "email")}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                    sourceFilter === "email" 
                      ? uiStyle === "minimal" ? "bg-slate-600 border-slate-600 text-white" : "bg-blue-600 border-blue-600 text-white" 
                      : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                  )}
                >
                  Email ({stats.email})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-4 text-sm text-slate-800 dark:text-white placeholder:text-slate-600 dark:placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none"
                />
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-10 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 appearance-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating-high">Rating: High to Low</option>
                  <option value="rating-low">Rating: Low to High</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn("p-2 rounded-md transition-all", viewMode === "grid" ? uiStyle === "minimal" ? "bg-white text-slate-600 shadow-sm" : "bg-white text-blue-600 shadow-sm" : "text-slate-600")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn("p-2 rounded-md transition-all", viewMode === "list" ? uiStyle === "minimal" ? "bg-white text-slate-600 shadow-sm" : "bg-white text-blue-600 shadow-sm" : "text-slate-600")}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="text-center py-12 text-slate-600">
                <p>No leads found</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLeads.map((lead) => (
                    <div key={lead.id}>
                      {renderLeadCard(lead)}
                    </div>
                ))}
              </div>
            ) : (
              <div className="rounded border border-slate-200 overflow-hidden bg-white">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Name</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Contact</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Rating</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Source</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Request</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr 
                        key={lead.id} 
                        onClick={() => setSelectedLead(lead)}
                        className="bg-white border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-bold text-blue-700">
                              {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <span className="font-medium text-slate-800">{lead.name}</span>
                              {lead.isLoyal && <Heart className="inline h-3 w-3 text-pink-500 fill-pink-500 ml-1" />}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-slate-800">{lead.email}</div>
                          <div className="text-slate-600">{lead.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                            style={{ backgroundColor: statusColors[getLeadStatus(lead) as keyof typeof statusColors]?.bg, color: statusColors[getLeadStatus(lead) as keyof typeof statusColors]?.color }}
                          >
                            {getLeadStatus(lead)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={cn("h-3.5 w-3.5", i < getLeadRating(lead) ? "text-amber-400 fill-amber-400" : "text-slate-400")} viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                            <span className="text-xs text-slate-600 ml-1">{getLeadRating(lead)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-700">
                            {getLeadSource(lead) === "whatsapp" ? (
                              <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                            ) : <Mail className="h-4 w-4 text-blue-600" />}
                            {getLeadSource(lead) === "whatsapp" ? "WhatsApp" : "Email"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
                          {lead.conversationSummary?.split('.')[0] || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === "action" && (
          <div className="space-y-8">
            {manualReviewLeads.length > 0 && (
              <div className="rounded border p-6" style={{ backgroundColor: "#f8fafc" }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <svg className="w-[18px] h-[18px] text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <h2 className="text-lg font-bold text-slate-800">Manual Review Required</h2>
                  </div>
                  <button
                    onClick={() => setShowAllManual(!showAllManual)}
                    className={cn("flex items-center gap-2 px-4 py-2 bg-white border rounded-lg transition-colors text-sm font-medium", uiStyle === "minimal" ? "border-slate-300 text-slate-600 hover:bg-slate-100" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
                  >
                    {showAllManual ? "Show Less" : `View All (${manualReviewLeads.length})`}
                    <ChevronRight className={cn("h-4 w-4 transition-transform", showAllManual && "rotate-90")} />
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {sortLeads(manualReviewLeads).slice(0, showAllManual ? undefined : 4).map((lead) => {
                    return (
                      <div key={lead.id}>
                        {renderManualReviewCard(lead)}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {declinedLeads.length > 0 && (
              <div className="rounded border p-6" style={{ backgroundColor: "#f8fafc" }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <svg className="w-[18px] h-[18px] text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <h2 className="text-lg font-bold text-slate-800">Declined Leads</h2>
                  </div>
                  <button
                    onClick={() => setShowAllDeclined(!showAllDeclined)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    {showAllDeclined ? "Show Less" : `View All (${declinedLeads.length})`}
                    <ChevronRight className={cn("h-4 w-4 transition-transform", showAllDeclined && "rotate-90")} />
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {sortLeads(declinedLeads).slice(0, showAllDeclined ? undefined : 4).map((lead) => {
                    const daysLeft = Math.max(0, 30 - Math.floor((Date.now() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60 * 24)))
                    const statusStyle = statusColors[getLeadStatus(lead) as keyof typeof statusColors] || statusColors.pending
                    const truncatedNote = getTruncatedText(lead.session?.ratingReason || lead.conversationSummary || "No rating reason available", 80)
                    return (
                      <div 
                        key={lead.id} 
                        className="rounded border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all cursor-pointer"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-xs font-bold" style={{ backgroundColor: "#e2e8f0", color: "#475569" }}>
                            {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-800 truncate">{lead.name}</h3>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={cn("h-3 w-3", i < getLeadRating(lead) ? "text-amber-400 fill-amber-400" : "text-slate-400")} viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                ))}
                              </div>
          <span 
            className="text-xs px-3 py-1 rounded-full capitalize shrink-0 font-bold"
            style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
          >
                                {getLeadStatus(lead)}
                              </span>
                              <span className="text-xs text-slate-500">
                                {daysLeft} days left
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">{typeof truncatedNote === 'object' ? truncatedNote.display : truncatedNote}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApproveLead(lead.id)
                            }}
                            style={{ background: "#16a34a", color: "white", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer", border: "none" }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteLead(lead.id)
                            }}
                            style={{ background: "white", border: "1px solid #e2e8f0", color: "#64748b", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {actionLeads.length === 0 && (
              <div className="rounded border border-green-200 p-12 text-center bg-green-50">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">All caught up!</h3>
                <p className="text-slate-600 mt-2">No leads require your attention right now.</p>
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
