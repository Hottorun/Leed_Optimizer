"use client"

import {
  LayoutDashboard,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  MessageSquare,
  Star,
  Users,
  UserPlus,
  UserCheck,
  Heart,
  Filter,
  LogOut,
  Shield,
  RefreshCw,
  Bell,
  Menu,
  X,
  Sparkles,
  MessageCircle,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { LeadStatus, CustomerType, RatingFilter, Lead } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { useLanguage } from "./language-provider"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  teamId?: string
  teamRole?: "owner" | "admin" | "member"
}

interface AppSidebarProps {
  activeFilter: LeadStatus | null
  onFilterChange: (filter: LeadStatus | null) => void
  customerTypeFilter: CustomerType
  onCustomerTypeFilterChange: (type: CustomerType) => void
  ratingFilter: RatingFilter
  onRatingFilterChange: (rating: RatingFilter) => void
  onOpenSettings: () => void
  onOpenUserManagement: () => void
  onOpenTeamManagement: () => void
  user?: User | null
  leads: Lead[]
  onRefresh: () => void
  mobileMenuOpen: boolean
  onMobileMenuOpen: () => void
  onMobileMenuClose: () => void
  onSelectLead: (lead: Lead) => void
}

export function AppSidebar({
  activeFilter,
  onFilterChange,
  customerTypeFilter,
  onCustomerTypeFilterChange,
  ratingFilter,
  onRatingFilterChange,
  onOpenSettings,
  onOpenUserManagement,
  onOpenTeamManagement,
  user,
  leads,
  onRefresh,
  mobileMenuOpen,
  onMobileMenuOpen,
  onMobileMenuClose,
  onSelectLead,
}: AppSidebarProps) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const prevLeadsCount = useRef(leads.length)

  const statusItems = [
    { id: null, label: language === 'de' ? 'Alle Leads' : 'All Leads', icon: LayoutDashboard, color: "" },
    { id: "pending" as LeadStatus, label: language === 'de' ? 'Zur Prüfung' : 'Pending Review', icon: Clock, color: "text-chart-3" },
    { id: "approved" as LeadStatus, label: language === 'de' ? 'Genehmigt' : 'Approved', icon: CheckCircle, color: "text-primary" },
    { id: "declined" as LeadStatus, label: language === 'de' ? 'Abgelehnt' : 'Declined', icon: XCircle, color: "text-destructive" },
    { id: "unrelated" as LeadStatus, label: language === 'de' ? 'Nicht relevant' : 'Unrelated', icon: Filter, color: "text-muted-foreground" },
  ]

  const customerTypeItems = [
    { id: "all" as CustomerType, label: language === 'de' ? 'Alle Kunden' : 'All Customers', icon: Users },
    { id: "first-time" as CustomerType, label: language === 'de' ? 'Neukunde' : 'First-time', icon: UserPlus },
    { id: "returning" as CustomerType, label: language === 'de' ? 'Bestandskunde' : 'Returning', icon: UserCheck },
    { id: "loyal" as CustomerType, label: language === 'de' ? 'Stammkunde (3+)' : 'Loyal (3+)', icon: Heart },
  ]

  const ratingItems = [
    { id: "all" as RatingFilter, label: language === 'de' ? 'Alle Bewertungen' : 'All Ratings' },
    { id: 5 as RatingFilter, label: "5 ★" },
    { id: 4 as RatingFilter, label: "4 ★" },
    { id: 3 as RatingFilter, label: "3 ★" },
    { id: 2 as RatingFilter, label: "2 ★" },
    { id: 1 as RatingFilter, label: "1 ★" },
  ]

  useEffect(() => {
    if (leads.length > prevLeadsCount.current) {
      const newLead = leads[0]
      if (newLead) {
        const platform = newLead.contactPlatform === "whatsapp" ? "WhatsApp" : "Email"
        if (newLead.autoApproved) {
          toast.success(`New lead auto-approved: ${newLead.name}`, {
            description: `${platform} lead - ${newLead.rating} stars`,
            duration: 5000,
          })
        } else {
          toast.info(`New ${platform} lead: ${newLead.name}`, {
            description: `${newLead.rating} stars - Pending review`,
            duration: 5000,
          })
        }
      }
    }
    prevLeadsCount.current = leads.length
  }, [leads])

  const handleLogoClick = () => {
    setIsRefreshing(true)
    onRefresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const getNotifications = () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentLeads = leads.filter(lead => new Date(lead.createdAt) > oneDayAgo)
    
    if (recentLeads.length === 0) return { count: 0, items: [] }
    
    const items = recentLeads.map(lead => ({
      id: lead.id,
      lead
    }))
    
    return { count: items.length, items }
  }

  const notificationData = getNotifications()

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" })
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300 lg:hidden",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between gap-3 border-b border-border px-6">
          <button 
            onClick={handleLogoClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary cursor-pointer transition-transform active:scale-95 hover:brightness-110"
          >
            {isRefreshing ? (
              <RefreshCw className="h-5 w-5 text-primary-foreground animate-spin" />
            ) : (
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            )}
          </button>
          <span className="text-lg font-semibold text-sidebar-foreground">aclea</span>
          <button 
            onClick={onMobileMenuClose}
            className="p-2 rounded-lg hover:bg-sidebar-accent/50 cursor-pointer"
          >
            <X className="h-5 w-5 text-sidebar-foreground" />
          </button>
        </div>
        {/* Mobile content */}
        <nav className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</p>
          {statusItems.map((item) => {
            const Icon = item.icon
            const isActive = activeFilter === item.id
            return (
              <button key={item.label} onClick={() => { onFilterChange(item.id); onMobileMenuClose(); }} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}>
                <Icon className={cn("h-5 w-5", item.color)} />
                {item.label}
              </button>
            )
          })}
          <div className="my-4 border-t border-border" />
          <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer Type</p>
          {customerTypeItems.map((item) => {
            const Icon = item.icon
            const isActive = customerTypeFilter === item.id
            return (
              <button key={item.id} onClick={() => { onCustomerTypeFilterChange(item.id); onMobileMenuClose(); }} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}>
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
          <div className="my-4 border-t border-border" />
          <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rating</p>
          {ratingItems.map((item) => {
            const isActive = ratingFilter === item.id
            return (
              <button key={item.id.toString()} onClick={() => { onRatingFilterChange(item.id); onMobileMenuClose(); }} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}>
                {item.id === "all" ? <Star className="h-5 w-5" /> : (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-3 w-3", i < (item.id as number) ? "fill-primary text-primary" : "text-muted-foreground/30")} />
                    ))}
                  </div>
                )}
                {item.id === "all" && item.label}
              </button>
            )
          })}
          <div className="my-4 border-t border-border" />
          <button onClick={() => { onOpenSettings(); onMobileMenuClose(); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors cursor-pointer hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
            <Settings className="h-5 w-5" />
            Settings
          </button>
          {user?.role === "admin" && (
            <button onClick={() => { onOpenUserManagement(); onMobileMenuClose(); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors cursor-pointer hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
              <Users className="h-5 w-5" />
              User Management
            </button>
          )}
        </nav>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user?.name || "Admin User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || "admin@leadflow.com"}
              </p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden lg:flex h-screen w-64 flex-col border-r border-border bg-sidebar">
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <button 
            onClick={handleLogoClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary cursor-pointer transition-transform active:scale-95 hover:brightness-110"
          >
            {isRefreshing ? (
              <RefreshCw className="h-5 w-5 text-primary-foreground animate-spin" />
            ) : (
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            )}
          </button>
          <button 
            onClick={handleLogoClick}
            className="text-lg font-semibold text-sidebar-foreground cursor-pointer hover:underline underline-offset-4 transition-all active:scale-95"
          >
            aclea
          </button>
          <div className="flex-1" />
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "relative p-2 rounded-lg border border-border hover:bg-sidebar-accent/50 transition-colors cursor-pointer",
              showNotifications && "bg-sidebar-accent"
            )}
          >
            <Bell className="h-5 w-5 text-sidebar-foreground" />
            {notificationData.count > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                {notificationData.count > 9 ? "9+" : notificationData.count}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute left-0 top-full mt-2 w-80 max-h-96 rounded-lg border border-border bg-popover shadow-lg z-50 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-border bg-muted/50">
                <h4 className="font-semibold text-sm">Activity (24h)</h4>
                <p className="text-xs text-muted-foreground">{notificationData.count} new lead{notificationData.count !== 1 ? "s" : ""}</p>
              </div>
              <div className="overflow-y-auto flex-1">
                {notificationData.items.length === 0 ? (
                  <p className="p-4 text-xs text-muted-foreground text-center">No new activity</p>
                ) : (
                  <div className="divide-y divide-border">
                    {notificationData.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectLead(item.lead)
                          setShowNotifications(false)
                        }}
                        className="w-full flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer text-left"
                      >
                        <NotificationIcon type={item.lead.contactPlatform === "whatsapp" ? "whatsapp" : item.lead.autoApproved ? "auto_approved" : "email"} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{item.lead.name}</p>
                            <StatusBadge status={item.lead.status} />
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{item.lead.workType}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={item.lead.rating} />
                            {item.lead.autoApproved && (
                              <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">Auto</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {/* Status Filter */}
          <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </p>
          {statusItems.map((item) => {
            const Icon = item.icon
            const isActive = activeFilter === item.id
            return (
              <button
                key={item.label}
                onClick={() => onFilterChange(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", item.color)} />
                {item.label}
              </button>
            )
          })}

          <div className="my-4 border-t border-border" />

          {/* Customer Type Filter */}
          <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Customer Type
          </p>
          {customerTypeItems.map((item) => {
            const Icon = item.icon
            const isActive = customerTypeFilter === item.id
            return (
              <button
                key={item.id}
                onClick={() => onCustomerTypeFilterChange(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}

          <div className="my-4 border-t border-border" />

          {/* Rating Filter */}
          <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Rating
          </p>
          {ratingItems.map((item) => {
            const isActive = ratingFilter === item.id
            return (
              <button
                key={item.id.toString()}
                onClick={() => onRatingFilterChange(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                {item.id === "all" ? (
                  <Star className="h-5 w-5" />
                ) : (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < (item.id as number) ? "fill-primary text-primary" : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                )}
                {item.id === "all" && item.label}
              </button>
            )
          })}

          <div className="my-4 border-t border-border" />

          {/* Settings */}
          <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Settings
          </p>
          <button 
            onClick={onOpenSettings}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors cursor-pointer hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <Settings className="h-5 w-5" />
            Settings
          </button>
          {(user?.teamRole === "owner" || user?.teamRole === "admin") && (
            <button 
              onClick={onOpenTeamManagement}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors cursor-pointer hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <Users className="h-5 w-5" />
              Team
            </button>
          )}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user?.name || "Admin User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || "admin@leadflow.com"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "auto_approved":
      return (
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      )
    case "whatsapp":
      return (
        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="h-4 w-4 text-green-500" />
        </div>
      )
    case "email":
      return (
        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Mail className="h-4 w-4 text-blue-500" />
        </div>
      )
    default:
      return (
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <Bell className="h-4 w-4 text-muted-foreground" />
        </div>
      )
  }
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const config: Record<LeadStatus, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-chart-3/20 text-chart-3 border-chart-3/30" },
    approved: { label: "Approved", className: "bg-primary/20 text-primary border-primary/30" },
    declined: { label: "Declined", className: "bg-destructive/20 text-destructive border-destructive/30" },
    unrelated: { label: "Unrelated", className: "bg-muted/50 text-muted-foreground border-muted" },
  }
  const { label, className } = config[status]
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded border ${className}`}>
      {label}
    </span>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  )
}
