"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, Eye, EyeOff, Check, AlertTriangle, Lock, Database, Trash2, Download } from "lucide-react"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"

export default function PrivacyPage() {
  const router = useRouter()
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [preferences, setPreferences] = useState({
    showPhonePublic: false,
    showEmailPublic: false,
    showLocationPublic: false,
    autoDeleteOld: true,
    dataRetentionDays: 90,
    analyticsEnabled: true,
    errorTracking: true,
  })

  useEffect(() => {
    const saved = localStorage.getItem("privacyPreferences")
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
    localStorage.setItem("privacyPreferences", JSON.stringify(newPrefs))
    showToast("Preferences saved", "success")
  }

  const handleDataRetentionChange = (days: number) => {
    const newPrefs = { ...preferences, dataRetentionDays: days }
    setPreferences(newPrefs)
    localStorage.setItem("privacyPreferences", JSON.stringify(newPrefs))
    showToast("Data retention policy updated", "success")
  }

  const handleRequestData = () => {
    showToast("Data export request submitted. You'll receive an email shortly.", "success")
  }

  const handleDeleteAccount = () => {
    showToast("Please contact support to delete your account", "error")
  }

  const privacyOptions = [
    {
      category: "Profile Visibility",
      items: [
        {
          key: "showPhonePublic" as const,
          icon: Eye,
          title: "Show Phone Number",
          description: "Allow phone numbers to be visible in lead details",
          enabledIcon: Eye,
          disabledIcon: EyeOff,
        },
        {
          key: "showEmailPublic" as const,
          icon: Eye,
          title: "Show Email Address",
          description: "Allow email addresses to be visible in lead details",
          enabledIcon: Eye,
          disabledIcon: EyeOff,
        },
        {
          key: "showLocationPublic" as const,
          icon: Eye,
          title: "Show Location",
          description: "Allow location data to be visible in lead details",
          enabledIcon: Eye,
          disabledIcon: EyeOff,
        },
      ],
    },
    {
      category: "Data & Retention",
      items: [
        {
          key: "autoDeleteOld" as const,
          icon: Trash2,
          title: "Auto-Delete Old Data",
          description: "Automatically remove leads that haven't been updated",
          enabledIcon: Check,
          disabledIcon: Trash2,
        },
      ],
    },
    {
      category: "Analytics & Tracking",
      items: [
        {
          key: "analyticsEnabled" as const,
          icon: Database,
          title: "Usage Analytics",
          description: "Help improve aclea by sharing anonymous usage data",
          enabledIcon: Check,
          disabledIcon: Database,
        },
        {
          key: "errorTracking" as const,
          icon: AlertTriangle,
          title: "Error Reporting",
          description: "Automatically send error reports when issues occur",
          enabledIcon: Check,
          disabledIcon: AlertTriangle,
        },
      ],
    },
  ]

  const dataRetentionOptions = [30, 60, 90, 180, 365]

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
              <h1 className="text-xl font-semibold text-slate-800">Privacy Settings</h1>
              <p className="text-sm text-slate-500 mt-1">Control your data and privacy preferences</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 shrink-0">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">Your data is secure</p>
                    <p className="text-sm text-blue-700 mt-1">
                      We take your privacy seriously. All data is encrypted and stored securely.
                    </p>
                  </div>
                </div>
              </div>

              {privacyOptions.map((section) => (
                <div key={section.category}>
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
                    {section.category}
                  </h3>
                  <div className="space-y-3">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isEnabled = preferences[item.key] as boolean
                      const StatusIcon = isEnabled ? item.enabledIcon : item.disabledIcon
                      return (
                        <div
                          key={item.key}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                                <Icon className="h-5 w-5 text-slate-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">{item.title}</p>
                                <p className="text-sm text-slate-500">{item.description}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggle(item.key)}
                              className={cn(
                                "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                                isEnabled ? "bg-blue-500" : "bg-slate-200"
                              )}
                            >
                              <span
                                className={cn(
                                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                                  isEnabled ? "left-7" : "left-1"
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

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
                  Data Retention
                </h3>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <Lock className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Retention Period</p>
                        <p className="text-sm text-slate-500">Automatically delete leads after this period of inactivity</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {dataRetentionOptions.map((days) => (
                      <button
                        key={days}
                        onClick={() => handleDataRetentionChange(days)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                          preferences.dataRetentionDays === days
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        )}
                      >
                        {days} days
                      </button>
                    ))}
                  </div>
                  {preferences.dataRetentionDays === 365 && (
                    <p className="text-xs text-slate-500 mt-2">
                      Note: Very long retention periods may affect performance.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
                  Your Rights
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">Request Your Data</p>
                        <p className="text-sm text-slate-500">Download all your data in a portable format</p>
                      </div>
                      <button
                        onClick={handleRequestData}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-red-200">
                <h3 className="text-sm font-medium text-red-600 uppercase tracking-wide mb-3">
                  Danger Zone
                </h3>
                <div className="p-4 rounded-xl border border-red-200 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-800">Delete Account</p>
                      <p className="text-sm text-red-600">Permanently delete your account and all associated data</p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
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
          {toast.type === "info" && <Shield className="h-5 w-5 text-blue-600" />}
          <span className="text-sm font-medium text-slate-700">{toast.message}</span>
        </div>
      )}
    </ThemeBackground>
  )
}
