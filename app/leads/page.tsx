"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { LeadDetailPanel } from "@/components/lead-detail-panel"
import { Search, Mail, MessageCircle, Plus, Heart, Clock, ChevronRight, ArrowUpDown, Filter, X, ChevronDown, Phone, XCircle, RotateCcw, Trash2, AlertTriangle, LayoutGrid, Sparkles } from "lucide-react"
import type { Lead, LeadSource } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ThemeBackground } from "@/lib/use-theme-gradient"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type SortOption = "newest" | "oldest" | "rating-high" | "rating-low" | "name-az" | "name-za"

export default function LeadsPage() {
  const { data: leads = [], mutate } = useSWR<Lead[]>("/api/leads", fetcher)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [showAllManual, setShowAllManual] = useState(false)

  const sortLeads = (leadsToSort: Lead[]) => {
    return [...leadsToSort].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "rating-high":
          return b.rating - a.rating
        case "rating-low":
          return a.rating - b.rating
        case "name-az":
          return a.name.localeCompare(b.name)
        case "name-za":
          return b.name.localeCompare(a.name)
        default:
          return 0
      }
    })
  }

  const filterLeads = (leadsToFilter: Lead[]) => {
    return leadsToFilter.filter(l => {
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          l.name.toLowerCase().includes(query) ||
          l.phone.includes(query) ||
          l.email.toLowerCase().includes(query) ||
          l.workType.toLowerCase().includes(query)
        )
      }
      return true
    })
  }

  const manualLeadsRaw = leads.filter(l => l.status === "manual")
  const manualLeads = sortLeads(filterLeads(manualLeadsRaw)).sort((a, b) => {
    const scoreA = a.rating + (a.isLoyal ? 1 : 0)
    const scoreB = b.rating + (b.isLoyal ? 1 : 0)
    return scoreB - scoreA
  })

  const getAiRecommendation = (lead: Lead) => {
    if (lead.rating >= 4) {
      return { text: "High priority", cta: "Contact today", style: "border-indigo-200 bg-indigo-50 text-indigo-600" }
    }
    if (lead.rating >= 3) {
      return { text: "Medium priority", cta: "Schedule follow-up", style: "border-blue-200 bg-blue-50 text-blue-600" }
    }
    return { text: "Nurture", cta: "Send newsletter", style: "border-slate-200 bg-slate-50 text-slate-500" }
  }
  const loyalCustomersRaw = leads.filter(l => l.isLoyal && (l.status === "approved" || l.status === "pending"))
  const loyalCustomers = sortLeads(filterLeads(loyalCustomersRaw))
  const declinedLeadsRaw = leads.filter(l => l.status === "declined")
  const declinedLeads = sortLeads(filterLeads(declinedLeadsRaw))

  const handleUpdateLead = async (updates: Partial<Lead>) => {
    if (!selectedLead) return
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
  }

  const handleSendMessage = async (action: "approve" | "decline", message: string) => {
    if (!selectedLead) return
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
  }

  const handleUndecline = async (leadId: string) => {
    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "manual" }),
    })
    if (response.ok) {
      mutate()
    }
  }

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return
    const response = await fetch(`/api/leads/${leadId}`, {
      method: "DELETE",
    })
    if (response.ok) {
      mutate()
    }
  }

  const getDaysUntilAutoDelete = (createdAt: string) => {
    const created = new Date(createdAt)
    const deleteDate = new Date(created)
    deleteDate.setMonth(deleteDate.getMonth() + 1)
    const now = new Date()
    const diffTime = deleteDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <ThemeBackground>
      <AppHeader onRefresh={mutate} isRefreshing={false} />
      
      <div className="p-6 space-y-8">
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
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors",
              showFilters ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
            {(sourceFilter !== "all") && (
              <span className="h-2 w-2 rounded-full bg-slate-500" />
            )}
          </button>

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
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
            <span className="text-sm font-medium text-slate-600">Source:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSourceFilter("all")}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                  sourceFilter === "all" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                )}
              >
                All
              </button>
              <button
                onClick={() => setSourceFilter("whatsapp")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors",
                  sourceFilter === "whatsapp" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                )}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </button>
              <button
                onClick={() => setSourceFilter("email")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors",
                  sourceFilter === "email" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                )}
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </button>
            </div>
            
            {(sourceFilter !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setSourceFilter("all")
                  setSearchQuery("")
                }}
                className="ml-auto flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>
        )}

        {manualLeads.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Clock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Needs Manual Review</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{manualLeads.length} leads require human approval</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(showAllManual ? manualLeads : manualLeads.slice(0, 6)).map((lead) => {
                const aiRec = getAiRecommendation(lead)
                return (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-5 text-left hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">{lead.name}</h3>
                      {lead.isLoyal && <Heart className="h-4 w-4 text-slate-400 fill-slate-400 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={cn("h-3.5 w-3.5", i < lead.rating ? "text-slate-500 fill-slate-500" : "text-slate-300")}
                            viewBox="0 0 24 24"
                            stroke={i < lead.rating ? "none" : "currentColor"}
                            strokeWidth={1.5}
                            fill={i < lead.rating ? "currentColor" : "none"}
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 ml-1">{lead.rating}/5</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-2">{lead.conversationSummary}</p>
                    <div className={cn("mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs", aiRec.style)}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-medium">{aiRec.text}</span>
                      </div>
                      <span className="font-medium">{aiRec.cta}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {lead.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-blue-500" />
                        {lead.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className={cn(
                        "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                        lead.source === "whatsapp" ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      )}>
                        {lead.source === "whatsapp" ? (
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        ) : <Mail className="h-3 w-3" />}
                        {lead.source === "whatsapp" ? "WhatsApp" : "Email"}
                      </span>
                      <span className="text-slate-400">{lead.location}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
                </button>
              )})}
            </div>
            {manualLeads.length > 6 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAllManual(!showAllManual)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {showAllManual ? (
                    <>
                      Show Less
                      <ChevronDown className="h-4 w-4 rotate-180" />
                    </>
                  ) : (
                    <>
                      Show {manualLeads.length - 6} More
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </section>
        )}

        {loyalCustomers.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Heart className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Priority Customers</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your loyal and returning customers</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loyalCustomers.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-4 text-left hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">{lead.name}</h3>
                      <Heart className="h-4 w-4 text-slate-400 fill-slate-400 shrink-0" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{lead.workType}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        lead.status === "approved" ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      )}>
                        {lead.status}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </section>
        )}

        {declinedLeads.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <XCircle className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Declined Leads</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{declinedLeads.length} declined leads (auto-delete after 30 days)</p>
              </div>
            </div>
            <div className="space-y-3">
              {declinedLeads.map((lead) => {
                const daysLeft = getDaysUntilAutoDelete(lead.updatedAt)
                return (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-800 dark:text-slate-100">{lead.name}</h3>
                          <span className={cn(
                            "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                            daysLeft <= 7 ? "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          )}>
                            <AlertTriangle className="h-3 w-3" />
                            {daysLeft <= 0 ? "Delete today" : `${daysLeft} days left`}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{lead.workType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUndecline(lead.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Move back to manual review"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Delete permanently"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-4">
              <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-700">No leads yet</h3>
            <p className="text-slate-500 mt-1">Import leads or wait for new inquiries</p>
          </div>
        )}
      </div>

      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdateLead}
          onSendMessage={handleSendMessage}
        />
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 m-4">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Import Lead Manually</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-slate-800 placeholder:text-slate-400" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-slate-800 placeholder:text-slate-400" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input type="tel" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-slate-800 placeholder:text-slate-400" placeholder="+1 555 123 4567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-slate-800 placeholder:text-slate-400" placeholder="Los Angeles, CA" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Work Type</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-slate-800 placeholder:text-slate-400" placeholder="Kitchen Renovation" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loyal Customer</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                  <span className="text-sm text-slate-600">Mark as priority/loyal customer</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Import Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </ThemeBackground>
  )
}
