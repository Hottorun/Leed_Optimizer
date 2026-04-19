"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Bell, Shield, Database, Key, Moon, ChevronRight, ArrowLeft, Check, X, AlertTriangle, Bot, Loader2, Users, LogOut, Crown, UserPlus, UserMinus, Copy, Trash2 } from "lucide-react"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/use-user"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

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
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)
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
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false)
  const [autoDeleteDays, setAutoDeleteDays] = useState(30)
  const [isSavingAutoDelete, setIsSavingAutoDelete] = useState(false)

  const isAdminOrOwner = user?.teamRole === "admin" || user?.teamRole === "owner"

  useEffect(() => {
    setMounted(true)
    setIsDark(document.documentElement.classList.contains("dark"))
  }, [])

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login")
    }
  }, [user, userLoading, router])

  useEffect(() => {
    if (!user?.id) return
    setIsLoading(false)
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (typeof data.autoDeleteDeclinedDays === "number") {
          setAutoDeleteEnabled(data.autoDeleteDeclinedDays > 0)
          setAutoDeleteDays(data.autoDeleteDeclinedDays > 0 ? data.autoDeleteDeclinedDays : 30)
        }
      })
      .catch(console.error)
  }, [user?.id])

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
    const newMode = isDark ? "light" : "dark"
    setIsDark(newMode === "dark")

    // Direct DOM update — immediate and reliable regardless of next-themes timing
    document.documentElement.classList.toggle("dark", newMode === "dark")
    document.documentElement.setAttribute("data-mode", newMode)
    localStorage.setItem("theme", newMode)

    // Sync next-themes state
    setTheme(newMode)

    showToast(!isDark ? "Dark mode enabled" : "Light mode enabled", "success")

    setIsSaving(true)
    try {
      await fetch("/api/settings/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newMode }),
      })
    } catch (e) {
      console.error("Failed to save theme preference", e)
    } finally {
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
    if (!confirm("Are you sure you want to delete this member?")) return
    try {
      const res = await fetch(`/api/teams/members?memberId=${memberId}&deleteAccount=true`, { method: "DELETE" })
      if (res.ok) {
        setTeamMembers((prev) => prev.filter((m) => m.id !== memberId))
      } else {
        const data = await res.json()
        setTeamError(data.error || "Failed to delete member")
      }
    } catch (err) {
      console.error("Failed to delete member:", err)
      setTeamError("Failed to delete member")
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
    if (!confirm(`Transfer ownership to ${memberName}? You will become an admin.`)) return
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
      showToast("Invite code copied", "success")
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
        showToast("Account deleted", "success")
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
        showToast("Account and team deleted", "success")
        setShowDeleteDialog(false)
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        router.push("/login")
      } else {
        const data = await res.json()
        showToast(data.error || "Failed to delete", "error")
      }
    } catch (err) {
      console.error("Delete failed:", err)
      showToast("Failed to delete", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveAutoDelete = async () => {
    setIsSavingAutoDelete(true)
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoDeleteDeclinedDays: autoDeleteEnabled ? autoDeleteDays : 0 }),
      })
      showToast("Auto-delete setting saved", "success")
    } catch {
      showToast("Failed to save", "error")
    } finally {
      setIsSavingAutoDelete(false)
    }
  }

  const sections = [
    ...(isAdminOrOwner ? [{
      title: "Team",
      items: [
        { icon: Users, label: "Team Members", description: "Manage team and access", action: () => router.push("/settings/team") },
      ],
      inviteCode: inviteCode,
    }] : []),
    {
      title: "Account",
      items: [
        { icon: User, label: "Profile", description: "Name, email, avatar", action: () => router.push("/settings/profile") },
        { icon: Key, label: "Password", description: "Change password", action: () => router.push("/settings/password") },
        { icon: Shield, label: "Security", description: "2FA, login history", action: () => router.push("/settings/security") },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: Bell, label: "Notifications", description: "Email and push alerts", action: () => router.push("/settings/notifications") },
        { icon: Bot, label: "AI Settings", description: "AI configuration", action: () => router.push("/settings/ai") },
      ],
    },
    {
      title: "Data",
      items: [
        { icon: Database, label: "Data Management", description: "Export, import data", action: () => router.push("/settings/data-management") },
        { icon: Shield, label: "Privacy", description: "Data and privacy controls", action: () => router.push("/settings/privacy") },
      ],
    },
  ]

  if (userLoading || isLoading) {
    return (
      <ThemeBackground>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </ThemeBackground>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ThemeBackground className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div>
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-4">
            {sections.map((section) => (
              <div key={section.title} className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-medium">{section.title}</h3>
                </div>
                <div className="divide-y divide-border">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Dark Mode Toggle */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-medium mb-3">Appearance</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Dark Mode</span>
                </div>
                <Switch
                  checked={mounted && isDark}
                  onCheckedChange={toggleDarkMode}
                  disabled={isSaving || !mounted}
                  className="[--thumb-size:22px] sm:[--thumb-size:22px]"
                />
              </div>
            </div>

            {/* Auto-delete declined leads */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Declined Leads</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-delete after</span>
                  <Switch
                    checked={autoDeleteEnabled}
                    onCheckedChange={setAutoDeleteEnabled}
                    className="[--thumb-size:22px] sm:[--thumb-size:22px]"
                  />
                </div>
                {autoDeleteEnabled && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={autoDeleteDays}
                      onChange={e => setAutoDeleteDays(Math.max(1, Math.min(365, Number(e.target.value))))}
                      className="w-16 h-8 rounded-md border border-border px-2 text-sm text-center"
                      style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                )}
                <button
                  onClick={handleSaveAutoDelete}
                  disabled={isSavingAutoDelete}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-md hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                  {isSavingAutoDelete ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  Save
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-medium mb-3">Session</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border text-sm rounded-md hover:bg-muted transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="w-full px-4 py-2 border border-destructive/30 text-destructive text-sm rounded-md hover:bg-destructive/10 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-lg border shadow-lg transition-all text-sm",
          toast.type === "success" && "bg-card border-border",
          toast.type === "error" && "bg-card border-border",
          toast.type === "info" && "bg-card border-border"
        )}>
          {toast.type === "success" && <Check className="h-4 w-4" />}
          {toast.type === "error" && <AlertTriangle className="h-4 w-4" />}
          {toast.type === "info" && <Bell className="h-4 w-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Logout Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
          <div className="bg-card rounded-lg border border-border p-5 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-base font-medium mb-2">Log out</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="px-4 py-2 border border-border text-sm rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-foreground text-background text-sm rounded-md hover:bg-foreground/90 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
          <div className="bg-card rounded-lg border border-border p-5 max-w-sm w-full mx-4 shadow-xl">
            {deleteStep === "team" && (
              <>
                <h3 className="text-base font-medium mb-2">Team Owner</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You own a team. Transfer ownership or delete the team.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="p-3 border border-border rounded-md">
                    <p className="text-sm font-medium mb-1">Transfer ownership</p>
                    <p className="text-xs text-muted-foreground">Go to Team Members to transfer.</p>
                    <button
                      onClick={() => { setShowDeleteDialog(false); setShowTeamDialog(true) }}
                      className="mt-2 text-xs underline"
                    >
                      Team Settings
                    </button>
                  </div>
                  <div className="p-3 border border-destructive/30 rounded-md bg-destructive/5">
                    <p className="text-sm font-medium mb-1 text-destructive">Delete team & account</p>
                    <p className="text-xs text-muted-foreground">Permanently delete team and all data.</p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setShowDeleteDialog(false); setDeleteStep("initial") }}
                    className="px-4 py-2 border border-border text-sm rounded-md hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setDeleteStep("confirm")}
                    className="px-4 py-2 bg-destructive text-destructive-foreground text-sm rounded-md hover:bg-destructive/90 transition-colors"
                  >
                    Delete All
                  </button>
                </div>
              </>
            )}

            {deleteStep === "confirm" && (
              <>
                <h3 className="text-base font-medium mb-2">Delete Account</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This cannot be undone. Type DELETE to confirm.
                </p>
                <div className="p-3 border border-destructive/30 rounded-md mb-4 bg-destructive/5">
                  <input
                    type="text"
                    id="delete-confirm"
                    placeholder="DELETE"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm mt-2"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setShowDeleteDialog(false); setDeleteStep("initial") }}
                    className="px-4 py-2 border border-border text-sm rounded-md hover:bg-muted transition-colors"
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
                        showToast("Type DELETE to confirm", "error")
                      }
                    }}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-destructive text-destructive-foreground text-sm rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Team Dialog */}
      {showTeamDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
          <div className="bg-card rounded-lg border border-border max-w-lg w-full mx-4 shadow-xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Manage members and access</p>
              </div>
              <button
                onClick={() => setShowTeamDialog(false)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              {teamError && (
                <div className="border border-destructive/30 text-destructive px-3 py-2 rounded-md text-sm bg-destructive/5">
                  {teamError}
                </div>
              )}

              {inviteCode && (
                <div className="border border-border rounded-md p-3">
                  <p className="text-xs font-medium mb-2">Invite Code</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded border border-border text-sm font-mono">
                      {inviteCode}
                    </code>
                    <Button variant="outline" size="sm" onClick={copyInviteCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Share to invite new members</p>
                </div>
              )}

              {/* Add Member Form */}
              <div className="border border-border rounded-md overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                  <h4 className="text-sm font-medium">Add Member</h4>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email</Label>
                      <Input type="email" placeholder="member@example.com" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Name</Label>
                      <Input placeholder="John Doe" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} className="h-9 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Password</Label>
                      <Input type="password" placeholder="********" value={newMember.password} onChange={(e) => setNewMember({ ...newMember, password: e.target.value })} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Role</Label>
                      <select
                        value={newMember.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value as "admin" | "member" })}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleAddMember}
                      disabled={isAddingMember || !newMember.email || !newMember.name || !newMember.password}
                    >
                      {isAddingMember ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <UserPlus className="mr-2 h-3 w-3" />}
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="border border-border rounded-md overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                  <h4 className="text-sm font-medium">Members</h4>
                </div>
                <div className="divide-y divide-border">
                  {isLoadingMembers ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No members found
                    </div>
                  ) : (
                    [...teamMembers]
                      .sort((a, b) => {
                        if (a.id === user?.id) return -1
                        if (b.id === user?.id) return 1
                        return 0
                      })
                      .map((member) => (
                        <div key={member.id} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                              {member.role === "owner" ? (
                                <Crown className="h-3.5 w-3.5" />
                              ) : (
                                member.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.role === "owner" ? (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Crown className="h-3 w-3" />
                                Owner
                              </span>
                            ) : (
                              <>
                                {user?.teamRole === "owner" && (
                                  <>
                                    <select
                                      value={member.role}
                                      onChange={(e) => handleUpdateRole(member.id, e.target.value as "admin" | "member")}
                                      className="h-7 rounded border border-input bg-background px-2 text-xs"
                                    >
                                      <option value="member">Member</option>
                                      <option value="admin">Admin</option>
                                    </select>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleTransferOwnership(member.id, member.name)}
                                      className="h-7 text-xs"
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
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                >
                                  <UserMinus className="h-3.5 w-3.5" />
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
