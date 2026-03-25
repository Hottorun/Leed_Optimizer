"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, UserPlus, Crown, Shield, User, Trash2, Loader2, Copy, RefreshCw, Key } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Team, TeamMember, TeamRole } from "@/lib/types"

interface TeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTeamCreated: () => void
}

export function TeamDialog({ open, onOpenChange, onTeamCreated }: TeamDialogProps) {
  const [teamName, setTeamName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return
    
    setIsLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || "Failed to create team")
        return
      }
      
      onTeamCreated()
      onOpenChange(false)
    } catch {
      setError("Failed to create team")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Welcome to aclea
          </DialogTitle>
          <DialogDescription>
            Create a team to get started. You'll be the owner of this team and can invite others later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              placeholder="e.g., Marketing Team"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && teamName.trim()) {
                  handleCreateTeam()
                }
              }}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button 
            onClick={handleCreateTeam}
            disabled={!teamName.trim() || isLoading}
            className="w-full cursor-pointer"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Team"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface TeamManagementProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: Team | null
  onTeamUpdate: () => void
}

export function TeamManagement({ open, onOpenChange, team, onTeamUpdate }: TeamManagementProps) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({ email: "", name: "", password: "", role: "member" as TeamRole })
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open && team) {
      fetchMembers()
      setInviteCode(team.inviteCode || "")
    }
  }, [open, team])

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/teams/members")
      const data = await res.json()
      if (data.members) {
        setMembers(data.members)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("Failed to copy code")
    }
  }

  const handleRegenerateCode = async () => {
    if (!confirm("This will invalidate the current invite code. Team members using the old code will not be able to join. Continue?")) return
    
    setIsRegenerating(true)
    try {
      const res = await fetch("/api/teams/invite-code", {
        method: "POST",
      })
      const data = await res.json()
      if (data.inviteCode) {
        setInviteCode(data.inviteCode)
        onTeamUpdate()
      }
    } catch {
      setError("Failed to regenerate code")
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleAddMember = async () => {
    if (!newMember.email || !newMember.name || !newMember.password) return
    
    setIsAdding(true)
    setError("")
    
    try {
      const res = await fetch("/api/teams/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || "Failed to add member")
        return
      }
      
      setMembers([...members, data.member])
      setNewMember({ email: "", name: "", password: "", role: "member" })
      setShowAddMember(false)
    } catch {
      setError("Failed to add member")
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return
    
    try {
      const res = await fetch(`/api/teams/members?memberId=${memberId}`, { method: "DELETE" })
      if (res.ok) {
        setMembers(members.filter(m => m.id !== memberId))
      }
    } catch {
      setError("Failed to remove member")
    }
  }

  const handleChangeRole = async (memberId: string, newRole: TeamRole) => {
    try {
      const res = await fetch("/api/teams/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, action: "updateRole", newRole }),
      })
      if (res.ok) {
        setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m))
      }
    } catch {
      setError("Failed to update role")
    }
  }

  const handleTransferOwnership = async (memberId: string) => {
    if (!confirm("Are you sure you want to transfer ownership to this member? You will become an admin.")) return
    
    try {
      const res = await fetch("/api/teams/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, action: "transferOwnership" }),
      })
      if (res.ok) {
        await fetchMembers()
        onTeamUpdate()
      }
    } catch {
      setError("Failed to transfer ownership")
    }
  }

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case "owner": return <span title="Owner"><Crown className="h-4 w-4 text-yellow-500" /></span>
      case "admin": return <Shield className="h-4 w-4 text-blue-500" />
      default: return <User className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team: {team?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Einladungscode</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRegenerateCode}
                disabled={isRegenerating}
                className="h-7 cursor-pointer text-xs"
              >
                {isRegenerating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                <span className="ml-1">Neu generieren</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-background px-3 py-2 rounded-md font-mono text-sm font-medium tracking-wider border">
                {inviteCode || "Kein Code verfuegbar"}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyCode}
                className="cursor-pointer"
              >
                {copied ? (
                  <span className="text-emerald-600">Kopiert!</span>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Teilen Sie diesen Code mit neuen Teammitgliedern, damit sie Ihrem Team beitreten konnen.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Team Members ({members.length})</h3>
            {!showAddMember && (
              <Button size="sm" onClick={() => setShowAddMember(true)} className="cursor-pointer">
                <UserPlus className="mr-1 h-4 w-4" />
                Add Member
              </Button>
            )}
          </div>

          {showAddMember && (
            <div className="space-y-3 rounded-lg border p-4">
              <h4 className="text-sm font-medium">Add New Member</h4>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
                <Input
                  placeholder="Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  value={newMember.password}
                  onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                />
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as TeamRole })}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowAddMember(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddMember} disabled={isAdding} className="cursor-pointer">
                  {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Member"}
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{member.name}</p>
                        {getRoleIcon(member.role)}
                      </div>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleChangeRole(member.id, e.target.value as TeamRole)}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      disabled={member.role === "owner"}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    {member.role !== "owner" && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleTransferOwnership(member.id)}
                          title="Make Owner"
                          className="h-7 w-7 cursor-pointer"
                        >
                          <Crown className="h-3 w-3 text-yellow-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveMember(member.id)}
                          title="Remove member"
                          className="cursor-pointer text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
