"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Lock, KeyRound, Save, Check, Loader2, Eye, EyeOff, X } from "lucide-react"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /\d/.test(p) },
  { label: "One special character (!@#$%^&*)", test: (p) => /[!@#$%^&*]/.test(p) },
]

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  const passed = passwordRequirements.filter((req) => req.test(password)).length
  
  if (password.length === 0) return { score: 0, label: "", color: "" }
  if (passed <= 1) return { score: 1, label: "Weak", color: "bg-red-500" }
  if (passed <= 2) return { score: 2, label: "Fair", color: "bg-orange-500" }
  if (passed <= 3) return { score: 3, label: "Good", color: "bg-yellow-500" }
  if (passed <= 4) return { score: 4, label: "Strong", color: "bg-emerald-500" }
  return { score: 5, label: "Very strong", color: "bg-emerald-600" }
}

export default function PasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const passwordStrength = getPasswordStrength(newPassword)
  const allRequirementsMet = passwordRequirements.every((req) => req.test(newPassword))
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  const handleSave = async () => {
    setError(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (!allRequirementsMet) {
      setError("Please meet all password requirements")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setSaved(true)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => setSaved(false), 2000)
      } else {
        setError(data.error || "Failed to change password")
      }
    } catch (err) {
      console.error("Failed to change password:", err)
      setError("Failed to change password")
    } finally {
      setIsSaving(false)
    }
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
            <h1 className="text-xl font-semibold text-slate-800">Change Password</h1>
            <p className="text-sm text-slate-500 mt-1">Update your password to keep your account secure</p>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {saved && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <Check className="h-4 w-4" />
                Password changed successfully!
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full h-10 pl-10 pr-12 rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full h-10 pl-10 pr-12 rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {newPassword.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Password strength:</span>
                    <span className={cn(
                      passwordStrength.score >= 4 ? "text-emerald-600 font-medium" :
                      passwordStrength.score >= 2 ? "text-yellow-600 font-medium" :
                      "text-red-600 font-medium"
                    )}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          level <= passwordStrength.score ? passwordStrength.color : "bg-slate-200"
                        )}
                      />
                    ))}
                  </div>
                  <ul className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <li
                        key={index}
                        className={cn(
                          "text-xs flex items-center gap-2 transition-colors",
                          req.test(newPassword) ? "text-emerald-600" : "text-slate-400"
                        )}
                      >
                        {req.test(newPassword) ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <div className="h-3 w-3 rounded-full border border-slate-400" />
                        )}
                        {req.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={cn(
                    "w-full h-10 pl-10 pr-12 rounded-lg border bg-white text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100",
                    confirmPassword.length > 0 && !passwordsMatch ? "border-red-400" : "border-slate-200"
                  )}
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <X className="h-3 w-3" />
                  Passwords do not match
                </p>
              )}
            </div>

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
                    <Loader2 className="h-4 w-4 animate-spin" />
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
                    Change Password
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
