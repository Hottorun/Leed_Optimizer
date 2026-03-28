"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Bell, User, LogOut, Settings, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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

  const getActivePage = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/leads") return "Leads"
    if (pathname === "/analytics") return "Analytics"
    if (pathname === "/settings") return "Settings"
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
      const now = new Date()
      const diffMs = now.getTime() - createdAt.getTime()
      const diffHours = diffMs / 3600000
      return diffHours <= 24
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(lead => {
      const isNew = () => {
        const createdAt = new Date(lead.createdAt)
        const now = new Date()
        const diffMs = now.getTime() - createdAt.getTime()
        return diffMs <= 3600000
      }
      const status = lead.session?.status || lead.status
      const isAutoUpdate = lead.autoApproved === true || lead.autoApproved === false

      return {
        id: lead.id,
        text: status === "approved"
          ? `${lead.name} approved`
          : status === "declined"
            ? `${lead.name} declined`
            : lead.phone
              ? `New WhatsApp: ${lead.name}`
              : `New email: ${lead.name}`,
        time: getTimeAgo(lead.createdAt),
        type: isAutoUpdate ? "auto" : isNew() ? "new" : "update",
      }
    })

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-8">
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
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-foreground" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-card rounded-lg border border-border shadow-lg overflow-hidden">
                <div className="px-3 py-2.5 border-b border-border">
                  <h3 className="text-sm font-medium">Notifications</h3>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => {
                          setShowNotifications(false)
                          window.location.href = `/leads?id=${notif.id}`
                        }}
                        className="w-full px-3 py-2.5 text-left border-b border-border last:border-0 hover:bg-muted transition-colors"
                      >
                        <p className="text-sm text-foreground">{notif.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{notif.time}</p>
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
                    View all leads
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-border mx-1" />

          <div className="relative" ref={userMenuRef}>
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
              <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg border border-border shadow-lg overflow-hidden">
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
        </div>
      </div>
    </header>
  )
}
