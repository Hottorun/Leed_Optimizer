"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Mail, Save, Check, Loader2, Briefcase, Users } from "lucide-react"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"

interface Profile {
  firstName: string
  lastName: string
  email: string
  industry: string
  teamName: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    email: "",
    industry: "",
    teamName: "",
  })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/settings/profile")
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else if (data.name) {
          const nameParts = data.name.split(" ")
          const firstName = nameParts[0] || ""
          const lastName = nameParts.slice(1).join(" ") || ""
          setProfile({
            firstName,
            lastName,
            email: data.email || "",
            industry: data.industry || "",
            teamName: data.teamName || "",
          })
        } else if (data.email) {
          setProfile(prev => ({ ...prev, email: data.email, teamName: data.teamName || "" }))
        }
      })
      .catch(err => {
        console.error("Failed to load profile:", err)
        setError("Failed to load profile")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const fullName = `${profile.firstName} ${profile.lastName}`.trim()
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          industry: profile.industry,
        }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } else {
        setError("Failed to save profile")
      }
    } catch (err) {
      console.error("Failed to save:", err)
      setError("Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <ThemeBackground className="p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </div>
      </ThemeBackground>
    )
  }

  return (
    <ThemeBackground className="p-6">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Back */}
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Update your personal details</p>
        </div>

        {/* Form Card */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="p-5 space-y-4">
            {error && (
              <div className="border border-destructive/30 text-destructive px-3 py-2 rounded-md text-sm bg-destructive/5">
                {error}
              </div>
            )}

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-semibold">
                {profile.firstName.charAt(0)}{profile.lastName.charAt(0) || ""}
              </div>
              <div>
                <p className="text-sm font-medium">{profile.firstName} {profile.lastName}</p>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full h-9 px-3 rounded-md border border-border bg-muted text-muted-foreground text-sm cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Industry</label>
              <input
                type="text"
                value={profile.industry}
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                placeholder="e.g., Construction, Real Estate"
                className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
              />
            </div>

            {profile.teamName && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Team</label>
                <input
                  type="text"
                  value={profile.teamName}
                  disabled
                  className="w-full h-9 px-3 rounded-md border border-border bg-muted text-muted-foreground text-sm cursor-not-allowed"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => router.push("/settings")}
                className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "px-4 py-1.5 text-sm rounded-md transition-all flex items-center gap-1.5",
                  saved
                    ? "bg-foreground/80 text-background"
                    : "bg-foreground text-background hover:bg-foreground/90"
                )}
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : saved ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ThemeBackground>
  )
}
