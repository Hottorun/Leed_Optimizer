"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Bell, User, LogOut, Settings, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const gradientKeyframes = `
@keyframes gradientShift {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}
`

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
  const [uiStyle, setUIStyle] = useState<"colored" | "minimal">("colored")
  const notificationRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedStyle = (localStorage.getItem("uiStyle") || "colored") as "colored" | "minimal"
    setUIStyle(savedStyle)
  }, [])

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
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
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
          ? `Lead approved: ${lead.name}` 
          : status === "declined"
            ? `Lead declined: ${lead.name}`
            : lead.phone 
              ? `New lead from WhatsApp: ${lead.name}`
              : `New email lead: ${lead.name}`,
        time: getTimeAgo(lead.createdAt),
        type: isAutoUpdate ? "auto" : isNew() ? "new" : "update",
      }
    })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: gradientKeyframes }} />
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", uiStyle === "minimal" ? "bg-slate-800" : "bg-slate-800")}>
              {isLoading ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <span className="text-sm font-bold text-white">A</span>
              )}
            </div>
            <span className="text-lg font-semibold text-slate-800">Aclea</span>
          </button>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = getActivePage() === item.name
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    backgroundColor: isActive ? (uiStyle === "minimal" ? '#94a3b8' : '#f1f5f9') : 'transparent',
                    color: isActive ? '#1e293b' : '#64748b',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1, #818cf8, #c084fc, #a855f7)'
                    e.currentTarget.style.backgroundSize = '300% 300%'
                    e.currentTarget.style.animation = 'gradientShift 4s ease infinite'
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isActive ? (uiStyle === "minimal" ? '#94a3b8' : '#f1f5f9') : 'transparent'
                    e.currentTarget.style.backgroundSize = ''
                    e.currentTarget.style.animation = ''
                    e.currentTarget.style.color = isActive ? '#1e293b' : '#64748b'
                  }}
                >
                  {item.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1 relative">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-semibold text-slate-800">Notifications</h3>
                  <p className="text-xs text-slate-500">Last 24 hours</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setShowNotifications(false)
                          window.location.href = `/leads?id=${notif.id}`
                        }}
                        className={cn(
                          "px-4 py-3 cursor-pointer border-b border-slate-100 last:border-0 transition-colors",
                          notif.type === "auto" && "border-l-4 border-l-amber-500"
                        )}
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = notif.type === "auto" ? '#fef3c7' : '#f1f5f9'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <p className="text-sm text-slate-800 font-medium">{notif.text}</p>
                        <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
                  <button 
                    onClick={() => {
                      setShowNotifications(false)
                      router.push("/leads")
                    }}
                    className="text-sm text-slate-600 hover:text-slate-800 font-medium"
                  >
                    View all leads
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-slate-200 mx-2" />

          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={cn("flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors", uiStyle === "minimal" ? "hover:bg-slate-200" : "hover:bg-blue-50")}
            >
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", uiStyle === "minimal" ? "bg-gradient-to-br from-slate-700 to-slate-800" : "bg-gradient-to-br from-blue-500 to-blue-700")}>
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-600">{user?.name || "User"}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-medium text-slate-800">{user?.name || "User"}</p>
                  <p className="text-xs text-slate-500">{user?.email || "user@example.com"}</p>
                </div>
                <div className="py-1">
                  <button 
                    onClick={() => router.push("/settings")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button 
                    onClick={async () => {
                      await fetch("/api/auth", { method: "DELETE" })
                      router.push("/login")
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
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
    </>
  )
}
