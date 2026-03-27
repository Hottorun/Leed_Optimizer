"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@/lib/use-user"
import { Users, UserPlus, UserMinus, Crown, ArrowLeft, Loader2, Shield } from "lucide-react"

interface TeamMember {
  id: string
  email: string
  name: string
  role: "owner" | "admin" | "member"
  created_at: string
}

export default function TeamSettings() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)
  const [newMember, setNewMember] = useState({ email: "", name: "", password: "", role: "member" as "admin" | "member" })
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAdminOrOwner = user?.teamRole === "admin" || user?.teamRole === "owner"

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login")
    } else if (!userLoading && user && !isAdminOrOwner) {
      router.push("/settings")
    }
  }, [user, userLoading, router, isAdminOrOwner])

  const fetchTeamMembers = async () => {
    setIsLoadingMembers(true)
    try {
      const res = await fetch("/api/teams/members")
      const data = await res.json()
      if (data.members) {
        setTeamMembers(data.members)
      }
    } catch (err) {
      console.error("Failed to fetch team members:", err)
      setError("Failed to load team members")
    } finally {
      setIsLoadingMembers(false)
    }
  }

  useEffect(() => {
    if (user && isAdminOrOwner) {
      fetchTeamMembers()
    }
  }, [user, isAdminOrOwner])

  const handleAddMember = async () => {
    if (!newMember.email || !newMember.name || !newMember.password) return
    setIsAddingMember(true)
    setError(null)
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
        setError(data.error || "Failed to add member")
      }
    } catch (err) {
      console.error("Failed to add member:", err)
      setError("Failed to add member")
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
        setError(data.error || "Failed to delete member account")
      }
    } catch (err) {
      console.error("Failed to delete member:", err)
      setError("Failed to delete member account")
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
        setError(data.error || "Failed to update role")
      }
    } catch (err) {
      console.error("Failed to update role:", err)
      setError("Failed to update role")
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
        setError(data.error || "Failed to transfer ownership")
      }
    } catch (err) {
      console.error("Failed to transfer ownership:", err)
      setError("Failed to transfer ownership")
    }
  }

  if (userLoading || !user) {
    return (
      <ThemeBackground className="p-6 space-y-6">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </ThemeBackground>
    )
  }

  if (!isAdminOrOwner) {
    return null
  }

  return (
    <ThemeBackground className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Team Management</h1>
        <p className="text-slate-500 mt-1">Manage your team members and their access levels</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add New Member
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="member@example.com"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="cursor-pointer"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={newMember.password}
                onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                className="cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
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

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Current Team Members</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {isLoadingMembers ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No team members found
            </div>
          ) : (
            teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    {member.role === "owner" ? (
                      <Crown className="h-5 w-5 text-yellow-500" />
                    ) : member.role === "admin" ? (
                      <Shield className="h-5 w-5 text-blue-500" />
                    ) : (
                      <span className="text-sm font-medium text-slate-600">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{member.name}</p>
                    <p className="text-sm text-slate-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.role === "owner" ? (
                    <span className="text-sm text-slate-500 flex items-center gap-1">
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
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm cursor-pointer"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTransferOwnership(member.id, member.name)}
                            className="h-9 cursor-pointer text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                          >
                            <Crown className="h-4 w-4 mr-1" />
                            Transfer
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id)}
                        className="h-9 w-9 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50"
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
    </ThemeBackground>
  )
}
