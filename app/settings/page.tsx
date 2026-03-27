"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { User, Bell, Shield, Database, Key, Globe, Moon, ChevronRight, Mail, ArrowLeft, Check, X, AlertTriangle, Bot, Loader2, Users, LogOut, Crown, UserPlus, UserMinus, Copy } from "lucide-react"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/use-user"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UserSettings } from "@/lib/types"

interface TeamMember {
  id: string
  email: string
  name: string
  role: "owner" | "admin" | "member"
  created_at: string
}

export default function Settings() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [themeReady, setThemeReady] = useState(false)
  const themeInitialized = useRef(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [deleteStep, setDeleteStep] = useState<"initial" | "confirm" | "team" | "done">("initial")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [showTeamDialog, setShowTeamDialog] = useState(false)
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [newMember, setNewMember] = useState({ email: "", name: "", password: "", role: "member" as "admin" | "member" })
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [teamError, setTeamError] = useState<string | null>(null)
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  const [showDataManagementModal, setShowDataManagementModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const isAdminOrOwner = user?.teamRole === "admin" || user?.teamRole === "owner"

  useEffect(() => {
    setMounted(true)
    // Delay enabling theme transitions to avoid flip on mount
    const timer = setTimeout(() => setThemeReady(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login")
    }
  }, [user, userLoading, router])

  useEffect(() => {
    if (!user?.id || themeInitialized.current) return

    fetch("/api/settings/user")
      .then(res => res.json())
      .then((data: UserSettings) => {
        if (data && typeof data === 'object' && 'theme' in data) {
          const savedTheme = data.theme || "light"
          if (savedTheme !== theme) {
            setTheme(savedTheme)
          }
        }
        themeInitialized.current = true
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [user?.id, theme, setTheme])

  useEffect(() => {
    if (!user?.id || !isAdminOrOwner) return

    fetch("/api/teams")
      .then(res => res.json())
      .then((data) => {
        if (data.team?.inviteCode) {
          setInviteCode(data.team.inviteCode)
        }
      })
      .catch(console.error)
  }, [user?.id, isAdminOrOwner])

  useEffect(() => {
    if (showTeamDialog && isAdminOrOwner) {
      setIsLoadingMembers(true)
      fetchTeamMembers().finally(() => setIsLoadingMembers(false))
    }
  }, [showTeamDialog, isAdminOrOwner])

  const toggleDarkMode = async () => {
    const currentMode = theme || "light"
    const newMode = currentMode === "dark" ? "light" : "dark"
    
    // Let next-themes handle the visual change
    setTheme(newMode)
    showToast(newMode === "dark" ? "Switched to dark mode" : "Switched to light mode", "success")

    // Save to database
    try {
      const userResponse = await fetch("/api/auth")
      const userData = await userResponse.json()
      
      if (userData.user?.id) {
        setIsSaving(true)
        await fetch("/api/settings/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: newMode })
        })
        setIsSaving(false)
      }
    } catch (e) {
      console.error("Failed to save theme preference", e)
      setIsSaving(false)
    }
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      router.push("/login")
    } catch (err) {
      console.error("Logout failed:", err)
      showToast("Failed to logout", "error")
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch("/api/teams/members")
      const data = await res.json()
      if (data.members) {
        setTeamMembers(data.members)
      }
    } catch (err) {
      console.error("Failed to fetch team members:", err)
    }
  }

  const handleAddMember = async () => {
    if (!newMember.email || !newMember.name || !newMember.password) return
    setIsAddingMember(true)
    setTeamError(null)
    try {
      const res = await fetch("/api/teams/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      })
      const data = await res.json()
      if (res.ok) {
        setNewMember({ email: "", name: "", password: "", role: "member" })
        fetchTeamMembers()
      } else {
        setTeamError(data.error || "Failed to add member")
      }
    } catch (err) {
      console.error("Failed to add member:", err)
      setTeamError("Failed to add member")
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user's account? This cannot be undone.")) return
    try {
      const res = await fetch(`/api/teams/members?memberId=${memberId}&deleteAccount=true`, { method: "DELETE" })
      if (res.ok) {
        setTeamMembers((prev) => prev.filter((m) => m.id !== memberId))
      } else {
        const data = await res.json()
        setTeamError(data.error || "Failed to delete member account")
      }
    } catch (err) {
      console.error("Failed to delete member:", err)
      setTeamError("Failed to delete member account")
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: "admin" | "member") => {
    try {
      const res = await fetch("/api/teams/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, action: "updateRole", newRole }),
      })
      if (res.ok) {
        fetchTeamMembers()
      } else {
        const data = await res.json()
        setTeamError(data.error || "Failed to update role")
      }
    } catch (err) {
      console.error("Failed to update role:", err)
      setTeamError("Failed to update role")
    }
  }

  const handleTransferOwnership = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to transfer ownership to ${memberName}? You will become an admin.`)) return
    try {
      const res = await fetch("/api/teams/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, action: "transferOwnership" }),
      })
      if (res.ok) {
        fetchTeamMembers()
      } else {
        const data = await res.json()
        setTeamError(data.error || "Failed to transfer ownership")
      }
    } catch (err) {
      console.error("Failed to transfer ownership:", err)
      setTeamError("Failed to transfer ownership")
    }
  }

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode)
      showToast("Invite code copied to clipboard", "success")
    }
  }

  const handleDeleteClick = async () => {
    if (user?.teamRole === "owner") {
      await fetchTeamMembers()
      setDeleteStep("team")
    } else {
      setDeleteStep("confirm")
    }
    setShowDeleteDialog(true)
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch("/api/settings/account", { method: "DELETE" })
      if (res.ok) {
        showToast("Account deleted successfully", "success")
        setShowDeleteDialog(false)
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        router.push("/login")
      } else {
        const data = await res.json()
        showToast(data.error || "Failed to delete account", "error")
      }
    } catch (err) {
      console.error("Delete account failed:", err)
      showToast("Failed to delete account", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteTeamAndAccount = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch("/api/settings/account", { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteTeam: true })
      })
      if (res.ok) {
        showToast("Account and team deleted successfully", "success")
        setShowDeleteDialog(false)
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        router.push("/login")
      } else {
        const data = await res.json()
        showToast(data.error || "Failed to delete account and team", "error")
      }
    } catch (err) {
      console.error("Delete team and account failed:", err)
      showToast("Failed to delete account and team", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  const sections = [
    ...(isAdminOrOwner ? [{
      title: "Team Management",
      items: [
        { icon: Users, label: "Team Members", description: "Manage your team and their access levels", action: () => setShowTeamDialog(true) },
      ],
      inviteCode: inviteCode,
    }] : []),
    {
      title: "Account",
      items: [
        { icon: User, label: "Profile Information", description: "Update your name, email, and profile picture", action: () => setShowProfileModal(true) },
        { icon: Key, label: "Password", description: "Change your password", action: () => setShowPasswordModal(true) },
        { icon: Shield, label: "Security", description: "Two-factor authentication and login history", action: () => setShowSecurityModal(true) },
      ],
    },
    {
      title: "Notifications",
      items: [
        { icon: Bell, label: "Notification Preferences", description: "Choose how you want to be notified", action: () => setShowNotificationsModal(true) },
      ],
    },
    {
      title: "AI Settings",
      items: [
        { icon: Bot, label: "AI Configuration", description: "Customize how AI handles your leads", action: () => setShowAiModal(true) },
      ],
    },
    {
      title: "Data Management",
      items: [
        { icon: Database, label: "Data Management", description: "Export or import your data", action: () => setShowDataManagementModal(true) },
      ],
    },
    {
      title: "Privacy Settings",
      items: [
        { icon: Shield, label: "Privacy Settings", description: "Control your data and privacy", action: () => setShowPrivacyModal(true) },
      ],
    },
  ]

  if (userLoading || isLoading) {
    return (
      <ThemeBackground className="p-6 space-y-6">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </ThemeBackground>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ThemeBackground className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard")}
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
                  disabled={isSaving || !mounted}
                  className={`relative w-12 h-6 rounded-full cursor-pointer ${
                    mounted && theme === "dark" ? "bg-blue-500" : "bg-slate-200"
                  } ${isSaving ? "opacity-50" : ""} ${themeReady ? "transition-colors" : ""}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full ${
                      mounted && theme === "dark" ? "left-7" : "left-1"
                    } ${themeReady ? "transition-transform" : ""}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-slate-500" />
                  <span className="text-sm text-slate-700">Notifications</span>
                </div>
                <button
                  onClick={() => router.push("/settings/notifications")}
                  className="relative w-12 h-6 rounded-full bg-blue-500 cursor-pointer"
                >
                  <span className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full transition-transform" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Danger Zone</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowLogoutDialog(true)}
                className="w-full px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
              <button 
                onClick={handleDeleteClick}
                className="w-full px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all",
          toast.type === "success" && "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700",
          toast.type === "error" && "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700",
          toast.type === "info" && "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
        )}>
          {toast.type === "success" && <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          {toast.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />}
          {toast.type === "info" && <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{toast.message}</span>
        </div>
      )}

      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <LogOut className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Logout</h3>
                <p className="text-sm text-slate-500">Confirm logout</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to logout? You will need to sign in again to access your account.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full mx-4 shadow-xl">
            {deleteStep === "team" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                    <Crown className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Team Owner</h3>
                    <p className="text-sm text-slate-500">Action required</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  You are the owner of a team. Before deleting your account, you must either:
                </p>
                <div className="space-y-3 mb-6">
                  <div className="p-3 border border-slate-200 rounded-lg">
                    <p className="text-sm font-medium text-slate-800 mb-1">Option 1: Transfer ownership</p>
                    <p className="text-xs text-slate-500">
                      Go to Team Members and transfer ownership to another admin.
                    </p>
                    <button
                      onClick={() => { setShowDeleteDialog(false); setShowTeamDialog(true) }}
                      className="mt-2 text-xs text-blue-600 hover:underline cursor-pointer"
                    >
                      Go to Team Settings
                    </button>
                  </div>
                  <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                    <p className="text-sm font-medium text-red-800 mb-1">Option 2: Delete team & account</p>
                    <p className="text-xs text-red-600">
                      This will permanently delete your team, all team members, and your account.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => { setShowDeleteDialog(false); setDeleteStep("initial") }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setDeleteStep("confirm")}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Delete Team & Account
                  </button>
                </div>
              </>
            )}

            {deleteStep === "confirm" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Delete Account</h3>
                    <p className="text-sm text-slate-500">Final confirmation</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
                  <p className="text-sm text-red-800 font-medium">
                    Type <span className="font-mono">DELETE</span> to confirm
                  </p>
                  <input
                    type="text"
                    id="delete-confirm"
                    placeholder="DELETE"
                    className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => { setShowDeleteDialog(false); setDeleteStep("initial") }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const input = document.getElementById("delete-confirm") as HTMLInputElement
                      if (input.value === "DELETE") {
                        if (user?.teamRole === "owner") {
                          handleDeleteTeamAndAccount()
                        } else {
                          handleDeleteAccount()
                        }
                      } else {
                        showToast("Please type DELETE to confirm", "error")
                      }
                    }}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showTeamDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Management
                </h3>
                <p className="text-sm text-slate-500 mt-1">Manage your team members and their access levels</p>
              </div>
              <button
                onClick={() => setShowTeamDialog(false)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {teamError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {teamError}
                </div>
              )}

              {inviteCode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-800 mb-2">Team Invite Code</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border border-slate-200 text-sm">
                      {inviteCode}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyInviteCode}
                      className="cursor-pointer"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Share this code with new members to join your team</p>
                </div>
              )}

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <h4 className="font-medium text-slate-800">Add New Member</h4>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-email">Email</Label>
                      <Input
                        id="team-email"
                        type="email"
                        placeholder="member@example.com"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Name</Label>
                      <Input
                        id="team-name"
                        placeholder="John Doe"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-password">Password</Label>
                      <Input
                        id="team-password"
                        type="password"
                        placeholder="********"
                        value={newMember.password}
                        onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team-role">Role</Label>
                      <select
                        id="team-role"
                        value={newMember.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value as "admin" | "member" })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddMember}
                      disabled={isAddingMember || !newMember.email || !newMember.name || !newMember.password}
                      className="cursor-pointer"
                    >
                      {isAddingMember ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Member
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <h4 className="font-medium text-slate-800">Current Team Members</h4>
                </div>
                <div className="divide-y divide-slate-100">
                  {isLoadingMembers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                      No team members found
                    </div>
                  ) : (
                    [...teamMembers]
                      .sort((a, b) => {
                        if (a.id === user?.id) return -1
                        if (b.id === user?.id) return 1
                        return 0
                      })
                      .map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                            {member.role === "owner" ? (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            ) : member.role === "admin" ? (
                              <Shield className="h-4 w-4 text-blue-500" />
                            ) : (
                              <span className="text-sm font-medium text-slate-600">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{member.name}</p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.role === "owner" ? (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Crown className="h-3 w-3 text-yellow-500" />
                              Owner
                            </span>
                          ) : (
                            <>
                              {user?.teamRole === "owner" && (
                                <>
                                  <select
                                    value={member.role}
                                    onChange={(e) => handleUpdateRole(member.id, e.target.value as "admin" | "member")}
                                    className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs cursor-pointer"
                                  >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleTransferOwnership(member.id, member.name)}
                                    className="h-8 cursor-pointer text-yellow-600 border-yellow-200 hover:bg-yellow-50 text-xs"
                                  >
                                    <Crown className="h-3 w-3 mr-1" />
                                    Transfer
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveMember(member.id)}
                                className="h-8 w-8 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ThemeBackground>
  )
}