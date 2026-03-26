"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Bell, User, LogOut, Settings, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AppHeaderProps {
  onRefresh: () => void
  isRefreshing: boolean
  notificationCount?: number
  user?: {
    name?: string
    email?: string
  }
}

export function AppHeader({ onRefresh, isRefreshing, notificationCount = 0, user }: AppHeaderProps) {
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

  const notifications = [
    { id: 1, text: "New lead from WhatsApp", time: "2 min ago" },
    { id: 2, text: "Lead approved: James Rodriguez", time: "15 min ago" },
    { id: 3, text: "New email lead received", time: "1 hour ago" },
  ]

  return (
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
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                  getActivePage() === item.name 
                    ? uiStyle === "minimal" ? "bg-slate-400 text-slate-800" : "bg-slate-100 text-slate-800" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                {item.name}
              </button>
            ))}
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
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                    >
                      <p className="text-sm text-slate-800">{notif.text}</p>
                      <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
                  <button 
                    onClick={() => router.push("/settings/notifications")}
                    className="text-sm text-slate-600 hover:text-slate-800 font-medium"
                  >
                    View all notifications
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
  )
}
