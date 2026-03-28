"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Lock, Save, Check, Loader2, Eye, EyeOff, X } from "lucide-react"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One number", test: (p) => /\d/.test(p) },
]

function getPasswordStrength(password: string): { score: number; label: string } {
  const passed = passwordRequirements.filter((req) => req.test(password)).length
  if (password.length === 0) return { score: 0, label: "" }
  if (passed <= 1) return { score: 1, label: "Weak" }
  if (passed <= 2) return { score: 2, label: "Fair" }
  return { score: 3, label: "Strong" }
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
      setError("Passwords do not match")
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
      setError("Failed to change password")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ThemeBackground className="p-6">
      <div className="max-w-lg mx-auto space-y-5">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div>
          <h1 className="text-xl font-semibold tracking-tight">Password</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Update your password</p>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="p-5 space-y-4">
            {error && (
              <div className="border border-destructive/30 text-destructive px-3 py-2 rounded-md text-sm bg-destructive/5">
                {error}
              </div>
            )}

            {saved && (
              <div className="border border-border px-3 py-2 rounded-md text-sm flex items-center gap-2">
                <Check className="h-4 w-4" />
                Password changed
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-9 pl-3 pr-10 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-9 pl-3 pr-10 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              {newPassword.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          level <= passwordStrength.score
                            ? passwordStrength.score === 1 ? "bg-destructive" : passwordStrength.score === 2 ? "bg-warning" : "bg-foreground"
                            : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <ul className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <li
                        key={index}
                        className={cn(
                          "text-xs flex items-center gap-1.5",
                          req.test(newPassword) ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {req.test(newPassword) ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
                        )}
                        {req.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "w-full h-9 pl-3 pr-10 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20",
                    confirmPassword.length > 0 && !passwordsMatch ? "border-destructive" : "border-border"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <X className="h-3 w-3" />
                  Passwords do not match
                </p>
              )}
            </div>

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
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ThemeBackground>
  )
}
