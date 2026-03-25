"use client"

import { useState, useCallback, useEffect } from "react"
import useSWR from "swr"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { StatsCards } from "./stats-cards"
import { LeadsGrid } from "./leads-grid"
import { LeadDetailPanel } from "./lead-detail-panel"
import { SettingsDialog } from "./settings-dialog"
import { AddLeadDialog } from "./add-lead-dialog"
import { UserManagementDialog } from "./user-management-dialog"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import type { Lead, LeadStatus, ContactPlatform, ViewMode, AppSettings, GroupByOption, CustomerType } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
}

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeadStatus | null>(null)
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all")
  const [platformFilter, setPlatformFilter] = useState<ContactPlatform | "all">("all")
  const [customerTypeFilter, setCustomerTypeFilter] = useState<CustomerType>("all")
  const [groupBy, setGroupBy] = useState<GroupByOption>("none")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [addLeadOpen, setAddLeadOpen] = useState(false)
  const [userManagementOpen, setUserManagementOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<AppSettings>({
    autoDeleteDeclinedDays: 0,
    webhookUrl: "",
    autoApproveEnabled: false,
    autoApproveMinRating: 4,
    autoDeclineUnrelated: false,
    followUpDays: 3,
    followUpMessage: "Hi {name}, just checking in on your inquiry. Are you still interested?",
    defaultApproveMessage: "Thank you for your interest! We'd love to work with you.",
    defaultDeclineMessage: "Thank you for reaching out. Unfortunately, we're not able to help at this time.",
    defaultUnrelatedMessage: "This message doesn't seem to be related to our services.",
  })

  const { data: leads = [], mutate, isValidating } = useSWR<Lead[]>(
    "/api/leads",
    fetcher,
    {
      refreshInterval: 30000,
    }
  )

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(setSettings)
      .catch(console.error)
    
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (settings.autoDeleteDeclinedDays > 0) {
      fetch("/api/cron/auto-delete", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.deletedCount > 0) {
            mutate()
          }
        })
        .catch(console.error)
    }
  }, [settings.autoDeleteDeclinedDays, mutate])

  const handleRefresh = useCallback(() => {
    mutate()
  }, [mutate])

  const handleFilterChange = (filter: LeadStatus | null) => {
    setStatusFilter(filter)
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

  const handleSendMessage = async (action: "approve" | "decline" | "unrelated", message: string) => {
    if (!selectedLead) return

    const actionLabels = {
      approve: "approved",
      decline: "declined",
      unrelated: "marked as unrelated",
    }

    const response = await fetch(`/api/leads/${selectedLead.id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, message }),
    })

    if (response.ok) {
      const result = await response.json()
      setSelectedLead(result.lead)
      mutate()
      toast.success(`Lead ${actionLabels[action]}!`, {
        description: "Webhook sent to n8n",
      })
    } else {
      toast.error("Failed to send message")
    }
  }

  const handleDeleteLead = async () => {
    if (!selectedLead) return

    const leadName = selectedLead.name
    const response = await fetch(`/api/leads/${selectedLead.id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      setSelectedLead(null)
      mutate()
      toast.success(`${leadName} deleted`)
    } else {
      toast.error("Failed to delete lead")
    }
  }

  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings),
    })

    if (response.ok) {
      const updated = await response.json()
      setSettings(updated)
      toast.success("Settings saved successfully")
    } else {
      toast.error("Failed to save settings")
    }
  }

  const handleDeleteAllLeads = async () => {
    const response = await fetch("/api/leads/bulk?action=all", {
      method: "DELETE",
    })

    if (response.ok) {
      const result = await response.json()
      setSelectedLead(null)
      mutate()
      toast.success(`All ${result.deletedCount} leads deleted`)
    } else {
      toast.error("Failed to delete all leads")
    }
  }

  const handleDeleteOldDeclined = async (): Promise<number> => {
    const response = await fetch(
      `/api/leads/bulk?action=old-declined&days=${settings.autoDeleteDeclinedDays}`,
      { method: "DELETE" }
    )

    if (response.ok) {
      const result = await response.json()
      mutate()
      return result.deletedCount
    }
    return 0
  }

  const handleAddLead = async (leadData: {
    name: string
    phone: string
    email: string
    location: string
    workType: string
    conversationSummary: string
    approveMessage: string
    declineMessage: string
    rating: number
    ratingReason: string
    contactPlatform: ContactPlatform
  }) => {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadData),
    })

    if (response.ok) {
      const result = await response.json()
      mutate()
      if (result.autoApproved) {
        toast.success(`${leadData.name} added and auto-approved!`, {
          description: `${leadData.contactPlatform === "whatsapp" ? "WhatsApp" : "Email"} lead with ${leadData.rating} stars`,
        })
      } else {
        toast.success(`${leadData.name} added successfully!`, {
          description: `${leadData.contactPlatform === "whatsapp" ? "WhatsApp" : "Email"} lead - Pending review`,
        })
      }
    } else {
      toast.error("Failed to add lead")
    }
  }

  const getFilterTitle = () => {
    const parts: string[] = []
    if (statusFilter) parts.push(statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1))
    if (ratingFilter) parts.push(`${ratingFilter}+ Stars`)
    if (platformFilter && platformFilter !== "all") {
      parts.push(platformFilter === "whatsapp" ? "WhatsApp" : "Email")
    }
    if (customerTypeFilter && customerTypeFilter !== "all") {
      if (customerTypeFilter === "first-time") parts.push("First-time")
      else if (customerTypeFilter === "returning") parts.push("Returning")
      else if (customerTypeFilter === "loyal") parts.push("Loyal (3+)")
    }
    
    if (parts.length === 0) return "All Leads"
    return parts.join(" - ")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        activeFilter={statusFilter}
        onFilterChange={handleFilterChange}
        ratingFilter={ratingFilter}
        onRatingFilterChange={setRatingFilter}
        customerTypeFilter={customerTypeFilter}
        onCustomerTypeFilterChange={setCustomerTypeFilter}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenUserManagement={() => setUserManagementOpen(true)}
        user={user}
        leads={leads}
        onRefresh={handleRefresh}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuOpen={() => setMobileMenuOpen(true)}
        onMobileMenuClose={() => setMobileMenuOpen(false)}
        onSelectLead={handleSelectLead}
      />

      <div className="flex-1 lg:pl-64">
        <AppHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-6 pt-16 sm:pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Lead Management</h1>
            <p className="mt-1 text-muted-foreground">
              Review and respond to incoming customer inquiries
            </p>
          </div>

          <StatsCards
            leads={leads}
            activeStatus={statusFilter}
            activePlatform={platformFilter}
            onStatsClick={handleFilterChange}
            onPlatformClick={(platform) => setPlatformFilter(platform)}
          />

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {getFilterTitle()}
              </h2>
              <span className="text-sm text-muted-foreground">
                {leads.length} total leads
              </span>
            </div>

            <LeadsGrid
              leads={leads}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              ratingFilter={ratingFilter}
              platformFilter={platformFilter}
              customerTypeFilter={customerTypeFilter}
              groupBy={groupBy}
              selectedLeadId={selectedLead?.id ?? null}
              onSelectLead={handleSelectLead}
              viewMode={viewMode}
            />
          </div>
        </main>
      </div>

      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={handleCloseLead}
          onUpdate={handleUpdateLead}
          onSendMessage={handleSendMessage}
          onDelete={handleDeleteLead}
        />
      )}

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onDeleteAllLeads={handleDeleteAllLeads}
        onDeleteOldDeclined={handleDeleteOldDeclined}
      />

      <AddLeadDialog
        open={addLeadOpen}
        onOpenChange={setAddLeadOpen}
        onAddLead={handleAddLead}
      />

      <UserManagementDialog
        open={userManagementOpen}
        onOpenChange={setUserManagementOpen}
      />

      <Toaster position="top-right" />

      <Button
        onClick={() => setAddLeadOpen(true)}
        className="fixed bottom-6 right-6 z-40 shadow-lg cursor-pointer h-14 px-6 text-base"
        size="lg"
      >
        <Plus className="mr-2 h-6 w-6" />
        Add Lead
      </Button>
    </div>
  )
}
