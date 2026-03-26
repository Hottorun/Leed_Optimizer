"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, MessageCircle, Mail, Sparkles, X, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Lead } from "@/lib/types"

interface NotificationItem {
  id: string
  type: "new_lead" | "auto_approved" | "whatsapp" | "email"
  count: number
  message: string
}

interface NotificationBellProps {
  leads: Lead[]
  lastLoginTime: string | null
}

export function NotificationBell({ leads, lastLoginTime }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showInitialPopup, setShowInitialPopup] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const prevLeadsCount = useRef(leads.length)
  const hasShownInitial = useRef(false)

  const notifications = getNotifications(leads, lastLoginTime)
  const unreadCount = notifications.length

  useEffect(() => {
    if (lastLoginTime && leads.length > 0 && !hasShownInitial.current) {
      hasShownInitial.current = true
      setShowInitialPopup(true)
      setTimeout(() => setShowInitialPopup(false), 8000)
    }
  }, [lastLoginTime, leads.length])

  useEffect(() => {
    if (leads.length > prevLeadsCount.current) {
      const newLeads = leads.slice(0, leads.length - prevLeadsCount.current)
      const newLead = newLeads[0]
      
      if (newLead) {
        const session = newLead.session
        const platform = session?.collectedData?.contactPlatform === "whatsapp" ? "WhatsApp" : "Email"
        const isQualified = (session?.rating ?? 0) >= 4
        if (newLead.autoApproved) {
          toast.success(`New lead auto-approved: ${newLead.name}`, {
            description: `${platform} lead - Qualified`,
            duration: 5000,
          })
        } else {
          toast.info(`New ${platform} lead: ${newLead.name}`, {
            description: isQualified ? "Qualified - Pending review" : "Pending review",
            duration: 5000,
          })
        }
      }
    }
    prevLeadsCount.current = leads.length
  }, [leads])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <>
      {showInitialPopup && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-6 pointer-events-none">
          <div className="pointer-events-auto bg-card border border-border rounded-xl shadow-lg p-4 w-80 animate-in slide-in-from-right-5 fade-in duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Welcome Back!</h3>
              </div>
              <button 
                onClick={() => setShowInitialPopup(false)} 
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className="flex items-start gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <NotificationIcon type={notification.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notification.count} lead{notification.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative p-2 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer",
            isOpen && "bg-accent"
          )}
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-popover shadow-lg z-50 overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/50">
              <h3 className="font-semibold text-sm">Activity Summary</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Since your last visit</p>
            </div>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No new activity
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto p-2">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <NotificationIcon type={notification.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {notification.count} lead{notification.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function NotificationIcon({ type }: { type: NotificationItem["type"] }) {
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
          <Globe className="h-4 w-4 text-muted-foreground" />
        </div>
      )
  }
}

function getNotifications(leads: Lead[], lastLoginTime: string | null): NotificationItem[] {
  if (!lastLoginTime) return []

  const loginDate = new Date(lastLoginTime)
  const newLeads = leads.filter(lead => {
    const leadDate = new Date(lead.createdAt)
    return leadDate > loginDate
  })

  if (newLeads.length === 0) return []

  const notifications: NotificationItem[] = []

  const approved = newLeads.filter(l => l.autoApproved)
  if (approved.length > 0) {
    notifications.push({
      id: "auto_approved",
      type: "auto_approved",
      count: approved.length,
      message: "Auto-approved",
    })
  }

  const whatsapp = newLeads.filter(l => l.session?.collectedData?.contactPlatform === "whatsapp")
  if (whatsapp.length > 0) {
    notifications.push({
      id: "whatsapp",
      type: "whatsapp",
      count: whatsapp.length,
      message: "New WhatsApp",
    })
  }

  const email = newLeads.filter(l => l.session?.collectedData?.contactPlatform === "email")
  if (email.length > 0) {
    notifications.push({
      id: "email",
      type: "email",
      count: email.length,
      message: "New Email",
    })
  }

  return notifications
}
