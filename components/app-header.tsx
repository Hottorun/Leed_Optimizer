"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Bell, User, LogOut, Settings, ChevronDown, Loader2, Menu, X, CheckCircle, AlertCircle, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Lead } from "@/lib/types"

interface AppHeaderProps {
  onRefresh: () => void
  isRefreshing: boolean
  notificationCount?: number
  user?: {
    name?: string
    email?: string
  }
  leads?: Lead[]
}

export function AppHeader({ onRefresh, isRefreshing, notificationCount = 0, user, leads = [] }: AppHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false)
  }, [pathname])

  const getActivePage = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/leads") return "Leads"
    if (pathname === "/analytics") return "Analytics"
    if (pathname === "/calendar") return "Calendar"
    if (pathname?.startsWith("/settings")) return "Settings"
    return "Dashboard"
  }

  const handleLogoClick = () => {
    setIsLoading(true)
    router.push("/dashboard")
    setTimeout(() => setIsLoading(false), 1000)
  }

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Leads", path: "/leads" },
    { name: "Analytics", path: "/analytics" },
    { name: "Calendar", path: "/calendar" },
  ]

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const notifications = leads
    .filter(lead => {
      const createdAt = new Date(lead.createdAt)
      const updatedAt = new Date(lead.updatedAt || lead.createdAt)
      const now = new Date()
      const createdDiff = (now.getTime() - createdAt.getTime()) / 3600000
      const updatedDiff = (now.getTime() - updatedAt.getTime()) / 3600000
      // Include leads created in last 24h OR leads with status change in last 24h
      const status = lead.session?.status || lead.status
      const isAutoProcessed = status === "approved" || status === "declined"
      return createdDiff <= 24 || (isAutoProcessed && lead.autoApproved && updatedDiff <= 24)
    })
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt).getTime()
      const bTime = new Date(b.updatedAt || b.createdAt).getTime()
      return bTime - aTime
    })
    .map(lead => {
      const status = lead.session?.status || lead.status
      const createdAt = new Date(lead.createdAt)
      const now = new Date()
      const isNew = (now.getTime() - createdAt.getTime()) <= 3600000

      let text: string
      let type: "new" | "approved" | "declined" | "manual"

      if (lead.autoApproved && status === "approved") {
        text = `Auto-approved: ${lead.name}`
        type = "approved"
      } else if (lead.autoApproved === false && status === "declined") {
        text = `Auto-declined: ${lead.name}`
        type = "declined"
      } else if (status === "approved") {
        text = `Approved: ${lead.name}`
        type = "approved"
      } else if (status === "declined") {
        text = `Declined: ${lead.name}`
        type = "declined"
      } else if (status === "manual") {
        text = `Needs review: ${lead.name}`
        type = "manual"
      } else {
        text = lead.phone ? `New WhatsApp lead: ${lead.name}` : `New email lead: ${lead.name}`
        type = "new"
      }

      return {
        id: lead.id,
        text,
        time: getTimeAgo(lead.updatedAt || lead.createdAt),
        type,
      }
    })

  const unreadCount = notifications.length

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 text-background animate-spin" />
                ) : (
                  <span className="text-xs font-bold text-background">A</span>
                )}
              </div>
              <span className="text-sm font-semibold tracking-tight">aclea</span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = getActivePage() === item.name
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.path)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-md transition-colors",
                      isActive
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {item.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-foreground" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-card rounded-lg border border-border shadow-xl overflow-hidden z-50">
                  <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Notifications</h3>
                      <p className="text-xs text-muted-foreground">Last 24 hours</p>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-muted rounded-full">{unreadCount}</span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-3 py-8 text-center">
                        <Bell className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => {
                            setShowNotifications(false)
                            window.location.href = `/leads?id=${notif.id}`
                          }}
                          className="w-full px-3 py-2.5 text-left border-b border-border last:border-0 hover:bg-muted transition-colors flex items-start gap-2.5"
                        >
                          <div className="mt-0.5 shrink-0">
                            {notif.type === "approved" && (
                              <CheckCircle className="h-3.5 w-3.5 text-[var(--status-approved)]" />
                            )}
                            {notif.type === "declined" && (
                              <X className="h-3.5 w-3.5 text-[var(--status-declined)]" />
                            )}
                            {notif.type === "manual" && (
                              <AlertCircle className="h-3.5 w-3.5 text-[var(--status-manual)]" />
                            )}
                            {notif.type === "new" && (
                              <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{notif.text}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{notif.time}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="px-3 py-2 border-t border-border">
                    <button
                      onClick={() => {
                        setShowNotifications(false)
                        router.push("/leads")
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground font-medium"
                    >
                      View all leads →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-5 w-px bg-border mx-1 hidden md:block" />

            {/* User Menu */}
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="hidden sm:block text-sm text-muted-foreground">{user?.name || "User"}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg border border-border shadow-lg overflow-hidden z-50">
                  <div className="px-3 py-2.5 border-b border-border">
                    <p className="text-sm font-medium">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => router.push("/settings")}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <button
                      onClick={async () => {
                        await fetch("/api/auth", { method: "DELETE" })
                        router.push("/login")
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = getActivePage() === item.name
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.path)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 text-sm rounded-md transition-colors",
                      isActive
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {item.name}
                  </button>
                )
              })}
            </nav>
            <div className="px-4 pb-3 pt-1 border-t border-border">
              <div className="px-3 py-2 mb-1">
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
              </div>
              <button
                onClick={() => router.push("/settings")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button
                onClick={async () => {
                  await fetch("/api/auth", { method: "DELETE" })
                  router.push("/login")
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
