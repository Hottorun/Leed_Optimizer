"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Mail, Camera, Save, Check, Loader2, Briefcase, Users } from "lucide-react"
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
  const [avatar, setAvatar] = useState<string | null>(null)

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return (
      <ThemeBackground className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        </div>
      </ThemeBackground>
    )
  }

  return (
    <ThemeBackground className="p-6">
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
            <h1 className="text-xl font-semibold text-slate-800">Profile Information</h1>
            <p className="text-sm text-slate-500 mt-1">Update your personal details</p>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                  ) : profile.firstName || profile.lastName ? (
                    <span className="text-2xl font-medium text-blue-600">
                      {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                    </span>
                  ) : (
                    <User className="h-10 w-10 text-blue-600" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-slate-500 mt-3">Click camera to upload photo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full h-10 px-4 rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.industry}
                  onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                  placeholder="e.g., Construction, Real Estate, Healthcare"
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {profile.teamName && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Team</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.teamName}
                    disabled
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 mt-1">Team cannot be changed</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => router.push("/settings")}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 cursor-pointer",
                  saved 
                    ? "bg-emerald-600 text-white" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ThemeBackground>
  )
}
