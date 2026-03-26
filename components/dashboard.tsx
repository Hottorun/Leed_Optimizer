"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { AppHeader } from "./app-header"
import { BigStatsHeader } from "./big-stats-header"
import { LeadsGrid } from "./leads-grid"
import { LeadDetailPanel } from "./lead-detail-panel"
import { Search, Mail, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Pagination } from "./pagination"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { useProfile } from "@/lib/use-profile"
import type { Lead, LeadStatus, LeadSource } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const LEADS_PER_PAGE = 20

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeadStatus | null>(null)
  const [sourceFilter, setSourceFilter] = useState<LeadSource | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)

  const { profile } = useProfile()

  const { data: leads = [], mutate, isValidating } = useSWR<Lead[]>(
    "/api/leads",
    fetcher,
    {
      refreshInterval: 30000,
    }
  )

  const handleRefresh = useCallback(() => {
    mutate()
  }, [mutate])

  const handleFilterChange = (filter: LeadStatus | null) => {
    setStatusFilter(filter)
    setCurrentPage(1)
  }

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead)
  }

  const handleCloseLead = () => {
    setSelectedLead(null)
  }

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

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !searchQuery ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.workType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.conversationSummary.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || lead.status === statusFilter
    const matchesSource = !sourceFilter || lead.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })

  const whatsappLeads = filteredLeads.filter(l => l.source === "whatsapp")
  const emailLeads = filteredLeads.filter(l => l.source === "email")

  const totalPages = Math.ceil(filteredLeads.length / LEADS_PER_PAGE)
  const startIndex = (currentPage - 1) * LEADS_PER_PAGE
  const endIndex = startIndex + LEADS_PER_PAGE
  const paginatedFilteredLeads = filteredLeads.slice(startIndex, endIndex)
  
  const paginatedWhatsapp = paginatedFilteredLeads.filter(l => l.source === "whatsapp")
  const paginatedEmail = paginatedFilteredLeads.filter(l => l.source === "email")

  return (
    <ThemeBackground>
      <AppHeader onRefresh={handleRefresh} isRefreshing={isValidating} />
      
      <BigStatsHeader 
        leads={leads} 
        onFilterClick={handleFilterChange}
        activeFilter={statusFilter}
        companyName={profile.company}
      />

      <main className="p-6">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">All Leads</h2>
            <p className="text-sm text-slate-500">{leads.length} total leads</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full sm:w-64 rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value as LeadStatus || null)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="manual">Manual Review</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
              </select>
              
              <select
                value={sourceFilter || ""}
                onChange={(e) => setSourceFilter(e.target.value as LeadSource || null)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
              >
                <option value="">All Sources</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
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
        </div>

        {paginatedWhatsapp.length > 0 && (
          <div className="mb-8">
            <button className="flex items-center gap-2 mb-4 group hover:opacity-80 transition-opacity duration-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-200">
                <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h3 className="text-base font-medium text-slate-700 group-hover:text-blue-600 transition-colors duration-200">WhatsApp Leads</h3>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                {whatsappLeads.length}
              </span>
            </button>
            <LeadsGrid
              leads={paginatedWhatsapp}
              searchQuery={searchQuery}
              selectedLeadId={selectedLead?.id ?? null}
              onSelectLead={handleSelectLead}
              viewMode={viewMode}
            />
          </div>
        )}

        {paginatedEmail.length > 0 && (
          <div className="mb-8">
            <button className="flex items-center gap-2 mb-4 group hover:opacity-80 transition-opacity duration-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors duration-200">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-base font-medium text-slate-700 group-hover:text-blue-600 transition-colors duration-200">Email Leads</h3>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                {emailLeads.length}
              </span>
            </button>
            <LeadsGrid
              leads={paginatedEmail}
              searchQuery={searchQuery}
              selectedLeadId={selectedLead?.id ?? null}
              onSelectLead={handleSelectLead}
              viewMode={viewMode}
            />
          </div>
        )}

        {filteredLeads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-4">
              <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-700">No leads found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>

      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={handleCloseLead}
          onUpdate={handleUpdateLead}
          onSendMessage={handleSendMessage}
        />
      )}
    </ThemeBackground>
  )
}
