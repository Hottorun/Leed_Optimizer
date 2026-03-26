"use client"

import { useState, useMemo, useEffect } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
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

export default function LeadsPage() {
  const router = useRouter()
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
  const [uiStyle, setUIStyle] = useState<"colored" | "minimal">("colored")

  useEffect(() => {
    const savedStyle = (localStorage.getItem("uiStyle") || "colored") as "colored" | "minimal"
    setUIStyle(savedStyle)
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
        l.email.toLowerCase().includes(query)
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

  const renderLeadCard = (lead: Lead) => {
    const rating = getLeadRating(lead)
    const status = getLeadStatus(lead)
    const workType = lead.session?.collectedData?.workType || lead.workType || "Not specified"
    const location = lead.session?.collectedData?.location || lead.location || "Not specified"
    const aiRecommendation = lead.session?.aiRecommendation || "No recommendation yet"
    const conversationSummary = lead.conversationSummary || lead.session?.collectedData?.message || ""
    const shortRequest = getShortRequest(conversationSummary)
    
    return (
      <button
        key={lead.id}
        onClick={() => setSelectedLead(lead)}
        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 text-left hover:shadow-md hover:border-slate-300 transition-all cursor-pointer w-full"
      >
        <div className="flex items-center gap-3">
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold", uiStyle === "minimal" ? "bg-slate-200 text-slate-700" : "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700")}>
            {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 truncate">{lead.name}</h3>
              {lead.isLoyal && <Heart className={cn("h-4 w-4 shrink-0", uiStyle === "minimal" ? "text-slate-500 fill-slate-500" : "text-pink-500 fill-pink-500")} />}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </span>
              <span className="text-slate-600">•</span>
              <span>{workType}</span>
            </div>
          </div>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full capitalize shrink-0 font-medium",
            uiStyle === "minimal" ? "bg-slate-200 text-slate-700" :
            status === "approved" ? "bg-green-100 text-green-800" :
            status === "declined" ? "bg-red-100 text-red-800" :
            status === "manual" ? "bg-amber-100 text-amber-800" :
            "bg-yellow-100 text-yellow-800"
          )}>
            {status}
          </span>
        </div>
        
        {shortRequest && (
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
            <MessageSquare className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <span className="font-medium">{shortRequest}</span>
          </div>
        )}
        
        <div className={cn(
          "rounded-lg p-3 text-sm",
          uiStyle === "minimal" 
            ? "bg-slate-50 border border-slate-200" 
            : rating >= 4 
              ? "bg-indigo-50 border border-indigo-200" 
              : rating >= 3 
                ? "bg-blue-50 border border-blue-200" 
                : "bg-slate-50 border border-slate-200"
        )}>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className={cn("h-3.5 w-3.5", uiStyle === "minimal" ? "text-slate-600" : rating >= 4 ? "text-indigo-600" : rating >= 3 ? "text-blue-600" : "text-slate-600")} />
            <span className={cn("font-medium", uiStyle === "minimal" ? "text-slate-700" : rating >= 4 ? "text-indigo-800" : rating >= 3 ? "text-blue-800" : "text-slate-700")}>
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
          <p className="text-xs text-slate-700 leading-relaxed">{aiRecommendation}</p>
        </div>
        
        <div className="flex items-center justify-between text-xs text-slate-700">
          <span className="flex items-center gap-1">
            {getLeadSource(lead) === "whatsapp" ? (
              <svg className={cn("h-3.5 w-3.5", uiStyle === "minimal" ? "text-slate-600" : "text-green-600")} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
            ) : <Mail className={cn("h-3.5 w-3.5", uiStyle === "minimal" ? "text-slate-600" : "text-blue-600")} />}
            {getLeadSource(lead) === "whatsapp" ? "WhatsApp" : "Email"}
          </span>
          <span className="text-slate-600">{lead.phone}</span>
        </div>
      </button>
    )
  }

  return (
    <ThemeBackground>
      <AppHeader onRefresh={mutate} isRefreshing={false} user={user ? { name: user.name, email: user.email } : undefined} />
      
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

        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "overview" 
                ? uiStyle === "minimal" ? "border-slate-600 text-slate-700" : "border-indigo-600 text-indigo-600" 
                : "border-transparent text-slate-600 hover:text-slate-700"
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
                ? uiStyle === "minimal" ? "border-slate-600 text-slate-700" : "border-indigo-600 text-indigo-600" 
                : "border-transparent text-slate-600 hover:text-slate-700"
            )}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Leads
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{stats.totalLeads}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("action")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "action" 
                ? uiStyle === "minimal" ? "border-slate-600 text-slate-700" : "border-amber-500 text-amber-600" 
                : "border-transparent text-slate-600 hover:text-slate-700"
            )}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Needs Action
              {stats.needsAction > 0 && (
                <span className={cn("px-2 py-0.5 rounded-full text-xs", uiStyle === "minimal" ? "bg-slate-200 text-slate-600" : "bg-amber-100 text-amber-600")}>{stats.needsAction}</span>
              )}
            </div>
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-xl", uiStyle === "minimal" ? "bg-slate-200" : "bg-blue-100")}>
                    <Users className={cn("h-5 w-5", uiStyle === "minimal" ? "text-slate-600" : "text-blue-600")} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Leads</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.totalLeads}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-xl", uiStyle === "minimal" ? "bg-slate-200" : "bg-green-100")}>
                    <CheckCircle className={cn("h-5 w-5", uiStyle === "minimal" ? "text-slate-600" : "text-green-600")} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Approved</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.approved}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-xl", uiStyle === "minimal" ? "bg-slate-200" : "bg-amber-100")}>
                    <Eye className={cn("h-5 w-5", uiStyle === "minimal" ? "text-slate-600" : "text-amber-600")} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Needs Action</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.needsAction}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-xl", uiStyle === "minimal" ? "bg-slate-200" : "bg-yellow-100")}>
                    <Clock className={cn("h-5 w-5", uiStyle === "minimal" ? "text-slate-600" : "text-yellow-600")} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Pending</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.pendingLeads}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-800 mb-4">Lead Status Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", uiStyle === "minimal" ? "bg-slate-500" : "bg-yellow-500")} />
                      <span className="text-sm text-slate-600">Pending</span>
                    </div>
                    <span className="font-medium text-slate-800">{stats.pendingLeads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", uiStyle === "minimal" ? "bg-slate-500" : "bg-amber-500")} />
                      <span className="text-sm text-slate-600">Manual Review</span>
                    </div>
                    <span className="font-medium text-slate-800">{stats.manualReview}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", uiStyle === "minimal" ? "bg-slate-500" : "bg-green-500")} />
                      <span className="text-sm text-slate-600">Approved</span>
                    </div>
                    <span className="font-medium text-slate-800">{stats.approved}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", uiStyle === "minimal" ? "bg-slate-500" : "bg-red-500")} />
                      <span className="text-sm text-slate-600">Declined</span>
                    </div>
                    <span className="font-medium text-slate-800">{stats.declined}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-800 mb-4">Source Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className={cn("h-4 w-4", uiStyle === "minimal" ? "text-slate-500" : "text-green-500")} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      </svg>
                      <span className="text-sm text-slate-600">WhatsApp</span>
                    </div>
                    <span className="font-medium text-slate-800">{stats.whatsapp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className={cn("h-4 w-4", uiStyle === "minimal" ? "text-slate-500" : "text-blue-500")} />
                      <span className="text-sm text-slate-600">Email</span>
                    </div>
                    <span className="font-medium text-slate-800">{stats.email}</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Average Rating</span>
                    <span className="font-bold text-slate-800">{stats.avgRating} / 5</span>
                  </div>
                </div>
              </div>
            </div>

            {actionLeads.length > 0 && (
              <div className={cn("border rounded-xl p-5", uiStyle === "minimal" ? "bg-slate-100 border-slate-300" : "bg-amber-50 border-amber-200")}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn("h-5 w-5", uiStyle === "minimal" ? "text-slate-600" : "text-amber-600")} />
                    <h3 className="font-semibold text-slate-800">Leads Requiring Human Action</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("action")}
                    className={cn("text-sm font-medium", uiStyle === "minimal" ? "text-slate-600 hover:text-slate-700" : "text-amber-600 hover:text-amber-700")}
                  >
                    View All →
                  </button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {actionLeads.slice(0, 3).map(renderLeadCard)}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "all" && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                    statusFilter === "all" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
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
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
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
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  )}
                >
                  Approved ({stats.approved})
                </button>
                <button
                  onClick={() => setStatusFilter("manual")}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                    statusFilter === "manual" 
                      ? uiStyle === "minimal" ? "bg-slate-600 border-slate-600 text-white" : "bg-amber-600 border-amber-600 text-white" 
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
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
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  )}
                >
                  Declined ({stats.declined})
                </button>
                <div className="h-6 w-px bg-slate-300 mx-2" />
                <button
                  onClick={() => setSourceFilter(sourceFilter === "whatsapp" ? "all" : "whatsapp")}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                    sourceFilter === "whatsapp" 
                      ? uiStyle === "minimal" ? "bg-slate-600 border-slate-600 text-white" : "bg-green-600 border-green-600 text-white" 
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
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
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  )}
                >
                  Email ({stats.email})
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-600 focus:border-slate-400 focus:outline-none"
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
                {filteredLeads.map(renderLeadCard)}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-bold text-blue-700">
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
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full capitalize font-medium",
                            getLeadStatus(lead) === "approved" ? "bg-green-100 text-green-800" :
                            getLeadStatus(lead) === "declined" ? "bg-red-100 text-red-800" :
                            getLeadStatus(lead) === "manual" ? "bg-amber-100 text-amber-800" :
                            "bg-yellow-100 text-yellow-800"
                          )}>
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
              <div className={cn("rounded-2xl border p-6", uiStyle === "minimal" ? "bg-slate-100 border-slate-300" : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200")}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-4 rounded-2xl shadow-lg", uiStyle === "minimal" ? "bg-slate-600 text-white shadow-slate-200" : "bg-amber-500 text-white shadow-amber-200")}>
                      <UserCheck className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Manual Review Required</h2>
                      <p className="text-sm text-slate-600">{manualReviewLeads.length} leads need your attention</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAllManual(!showAllManual)}
                    className={cn("flex items-center gap-2 px-4 py-2 bg-white border rounded-lg transition-colors text-sm font-medium", uiStyle === "minimal" ? "border-slate-300 text-slate-600 hover:bg-slate-100" : "border-amber-200 text-amber-700 hover:bg-amber-50")}
                  >
                    {showAllManual ? "Show Less" : `View All (${manualReviewLeads.length})`}
                    <ChevronRight className={cn("h-4 w-4 transition-transform", showAllManual && "rotate-90")} />
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {sortLeads(manualReviewLeads).slice(0, showAllManual ? undefined : 4).map(renderLeadCard)}
                </div>
              </div>
            )}

            {declinedLeads.length > 0 && (
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-slate-600 text-white shadow-lg shadow-slate-200">
                      <ThumbsDown className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Declined Leads</h2>
                      <p className="text-sm text-slate-600">{declinedLeads.length} leads • Auto-deleted after 30 days</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAllDeclined(!showAllDeclined)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    {showAllDeclined ? "Show Less" : `View All (${declinedLeads.length})`}
                    <ChevronRight className={cn("h-4 w-4 transition-transform", showAllDeclined && "rotate-90")} />
                  </button>
                </div>
                <div className="space-y-3">
                  {sortLeads(declinedLeads).slice(0, showAllDeclined ? undefined : 6).map((lead) => {
                    const daysLeft = Math.max(0, 30 - Math.floor((Date.now() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60 * 24)))
                    return (
                      <div 
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-600">
                            {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-slate-800 truncate">{lead.name}</h3>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={cn("h-3.5 w-3.5", i < getLeadRating(lead) ? "text-amber-400 fill-amber-400" : "text-slate-400")} viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                                <Clock className="h-3 w-3" />
                                {daysLeft} days left
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 truncate">{lead.conversationSummary?.split('.')[0] || "-"}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRestoreLead(lead.id)
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Restore
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteLead(lead.id)
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {actionLeads.length === 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-500" />
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
