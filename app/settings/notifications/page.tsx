"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Check, AlertTriangle, Mail, MessageCircle, Clock, CheckCircle, XCircle } from "lucide-react"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
  const router = useRouter()
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [preferences, setPreferences] = useState({
    pushEnabled: true,
    newLeads: true,
    leadApproved: true,
    leadDeclined: true,
    manualReview: true,
    dailySummary: false,
    weeklyReport: true,
  })

  useEffect(() => {
    const saved = localStorage.getItem("notificationPreferences")
    if (saved) {
      setPreferences(JSON.parse(saved))
    }
  }, [])

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleToggle = (key: keyof typeof preferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] }
    setPreferences(newPrefs)
    localStorage.setItem("notificationPreferences", JSON.stringify(newPrefs))
    showToast("Preferences saved", "success")
  }

  const handleSaveAll = () => {
    localStorage.setItem("notificationPreferences", JSON.stringify(preferences))
    showToast("All notification preferences saved", "success")
  }

  const notificationTypes = [
    {
      category: "Lead Notifications",
      items: [
        {
          key: "newLeads" as const,
          icon: MessageCircle,
          title: "New Leads",
          description: "Get notified when new leads come in",
          color: "text-emerald-500",
          bgColor: "bg-emerald-100",
        },
        {
          key: "leadApproved" as const,
          icon: CheckCircle,
          title: "Leads Approved",
          description: "Notifications when leads are approved",
          color: "text-blue-500",
          bgColor: "bg-blue-100",
        },
        {
          key: "leadDeclined" as const,
          icon: XCircle,
          title: "Leads Declined",
          description: "Notifications when leads are declined",
          color: "text-slate-500",
          bgColor: "bg-slate-100",
        },
        {
          key: "manualReview" as const,
          icon: Clock,
          title: "Manual Review Needed",
          description: "Reminders for leads requiring manual review",
          color: "text-amber-500",
          bgColor: "bg-amber-100",
        },
      ],
    },
    {
      category: "Reports",
      items: [
        {
          key: "dailySummary" as const,
          icon: Bell,
          title: "Daily Summary",
          description: "Receive a daily summary of lead activity",
          color: "text-purple-500",
          bgColor: "bg-purple-100",
        },
        {
          key: "weeklyReport" as const,
          icon: Mail,
          title: "Weekly Report",
          description: "Get weekly performance reports via email",
          color: "text-indigo-500",
          bgColor: "bg-indigo-100",
        },
      ],
    },
  ]

  return (
    <ThemeBackground>
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </button>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h1 className="text-xl font-semibold text-slate-800">Notification Preferences</h1>
              <p className="text-sm text-slate-500 mt-1">Choose how you want to be notified</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Bell className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Push Notifications</p>
                      <p className="text-sm text-slate-500">Enable or disable all notifications</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle("pushEnabled")}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                      preferences.pushEnabled ? "bg-blue-500" : "bg-slate-200"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                        preferences.pushEnabled ? "left-7" : "left-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              {notificationTypes.map((section) => (
                <div key={section.category}>
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
                    {section.category}
                  </h3>
                  <div className="space-y-3">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isEnabled = preferences[item.key]
                      return (
                        <div
                          key={item.key}
                          className={cn(
                            "p-4 rounded-xl border transition-colors",
                            preferences.pushEnabled
                              ? "border-slate-200 bg-white hover:border-slate-300"
                              : "border-slate-100 bg-slate-50 opacity-60"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", item.bgColor)}>
                                <Icon className={cn("h-5 w-5", item.color)} />
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">{item.title}</p>
                                <p className="text-sm text-slate-500">{item.description}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggle(item.key)}
                              disabled={!preferences.pushEnabled}
                              className={cn(
                                "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                                isEnabled && preferences.pushEnabled ? "bg-blue-500" : "bg-slate-200",
                                !preferences.pushEnabled && "cursor-not-allowed"
                              )}
                            >
                              <span
                                className={cn(
                                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                                  isEnabled && preferences.pushEnabled ? "left-7" : "left-1"
                                )}
                              />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={handleSaveAll}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all",
          toast.type === "success" && "bg-emerald-50 border-emerald-200",
          toast.type === "error" && "bg-red-50 border-red-200",
          toast.type === "info" && "bg-blue-50 border-blue-200"
        )}>
          {toast.type === "success" && <Check className="h-5 w-5 text-emerald-600" />}
          {toast.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600" />}
          {toast.type === "info" && <Bell className="h-5 w-5 text-blue-600" />}
          <span className="text-sm font-medium text-slate-700">{toast.message}</span>
        </div>
      )}
    </ThemeBackground>
  )
}
