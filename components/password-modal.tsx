"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Loader2, AlertTriangle, Key, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PasswordModal({ open, onOpenChange }: PasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("All fields are required", "error")
      return
    }

    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error")
      return
    }

    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "error")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (res.ok) {
        showToast("Password updated successfully", "success")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        onOpenChange(false)
      } else {
        const data = await res.json()
        showToast(data.error || "Failed to update password", "error")
      }
    } catch (err) {
      console.error("Failed to update password:", err)
      showToast("Failed to update password", "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-6">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Update your account password
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="cursor-pointer"
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className="cursor-pointer"
            />
          </div>
        </DialogContent>

        {toast && (
          <div className={cn(
            "fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all",
            toast.type === "success" && "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700",
            toast.type === "error" && "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700",
            toast.type === "info" && "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
          )}>
            {toast.type === "success" && <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            {toast.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />}
            {toast.type === "info" && <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{toast.message}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="cursor-pointer">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}