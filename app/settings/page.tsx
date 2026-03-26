"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Bell, Shield, Palette, Database, Key, Globe, Moon, Sun, ChevronRight, Mail, ArrowLeft, Check, X, AlertTriangle, Bot } from "lucide-react"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"

export default function Settings() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({
    push: true,
  })
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

  useEffect(() => {
    const savedMode = localStorage.getItem("mode")
    setDarkMode(savedMode === "dark")
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem("mode", newMode ? "dark" : "light")
    document.documentElement.setAttribute("data-mode", newMode ? "dark" : "light")
    if (newMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    showToast(newMode ? "Switched to dark mode" : "Switched to light mode", "success")
  }

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type })
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const sections = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Profile Information", description: "Update your name, email, and profile picture", action: () => router.push("/settings/profile") },
        { icon: Key, label: "Password", description: "Change your password", action: () => showToast("Opening password settings...", "info") },
        { icon: Shield, label: "Security", description: "Two-factor authentication and login history", action: () => showToast("Opening security settings...", "info") },
      ],
    },
    {
      title: "Notifications",
      items: [
        { icon: Bell, label: "Notification Preferences", description: "Choose how you want to be notified", action: () => router.push("/settings/notifications") },
      ],
    },
    {
      title: "Appearance",
      items: [
        { icon: Palette, label: "Theme", description: "Customize the look of your dashboard", action: () => router.push("/settings/theme") },
      ],
    },
    {
      title: "AI Settings",
      items: [
        { icon: Bot, label: "AI Configuration", description: "Customize how AI handles your leads", action: () => router.push("/settings/ai") },
      ],
    },
    {
      title: "Data & Privacy",
      items: [
        { icon: Database, label: "Data Management", description: "Export or import your data", action: () => router.push("/settings/data-management") },
        { icon: Shield, label: "Privacy Settings", description: "Control your data and privacy", action: () => router.push("/settings/privacy") },
      ],
    },
  ]

  return (
    <ThemeBackground className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-800">{section.title}</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-blue-50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <Icon className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Quick Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-slate-500" />
                  <span className="text-sm text-slate-700">Dark Mode</span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                    darkMode ? "bg-blue-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      darkMode ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-slate-500" />
                  <span className="text-sm text-slate-700">Push Notifications</span>
                </div>
                <button
                  onClick={() => { setNotifications({ ...notifications, push: !notifications.push }); showToast(`Push notifications ${!notifications.push ? "enabled" : "disabled"}`, "success") }}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                    notifications.push ? "bg-blue-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notifications.push ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Plan</span>
                <span className="font-medium text-slate-800">Pro</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Leads Used</span>
                <span className="font-medium text-slate-800">12 / 100</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "12%" }} />
              </div>
            </div>
            <button 
              onClick={() => showToast("Opening upgrade options...", "info")}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Upgrade Plan
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Danger Zone</h3>
            <button 
              onClick={() => showToast("Please contact support to delete your account", "error")}
              className="w-full px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            >
              Delete Account
            </button>
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
