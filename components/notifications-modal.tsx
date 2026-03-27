"use client"

import { useState, useEffect } from "react"
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
import { Switch } from "@/components/ui/switch"
import { CheckCircle, Loader2, AlertTriangle, Bell, Clock, Globe, Mail, Phone, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/use-user"

interface NotificationsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsModal({ open, onOpenChange }: NotificationsModalProps) {
  const { user } = useUser()
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [leadScoreThreshold, setLeadScoreThreshold] = useState(50)
  const [notificationFrequency, setNotificationFrequency] = useState("immediate")
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false)
  const [quietHoursStart, setQuietHoursStart] = useState("22:00")
  const [quietHoursEnd, setQuietHoursEnd] = useState("08:00")
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    if (!user?.id) {
      onOpenChange(false)
      return
    }

    const loadNotificationSettings = async () => {
      try {
        const res = await fetch(`/api/settings/notifications`)
        const data = await res.json()
        
        if (data) {
          setEmailEnabled(data.emailEnabled ?? true)
          setSmsEnabled(data.smsEnabled ?? false)
          setPushEnabled(data.pushEnabled ?? true)
          setLeadScoreThreshold(data.leadScoreThreshold ?? 50)
          setNotificationFrequency(data.notificationFrequency ?? "immediate")
          setQuietHoursEnabled(data.quietHoursEnabled ?? false)
          setQuietHoursStart(data.quietHoursStart ?? "22:00")
          setQuietHoursEnd(data.quietHoursEnd ?? "08:00")
        }
      } catch (err) {
        console.error("Failed to load notification settings:", err)
        // Use defaults
      }
    }

    loadNotificationSettings()
  }, [user?.id, onOpenChange])

  const handleSave = async () => {
    if (!user?.id) return

    setIsSaving(true)
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailEnabled,
          smsEnabled,
          pushEnabled,
          leadScoreThreshold,
          notificationFrequency,
          quietHoursEnabled,
          quietHoursStart,
          quietHoursEnd,
        }),
      })

      if (res.ok) {
        showToast("Notification settings updated successfully", "success")
        onOpenChange(false)
      } else {
        showToast("Failed to update notification settings", "error")
      }
    } catch (err) {
      console.error("Failed to update notification settings:", err)
      showToast("Failed to update notification settings", "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-6">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogDescription>
            Configure how and when you want to be notified
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="notification-channels">Notification Channels</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Email Notifications</span>
              </div>
              <Switch
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium">SMS Notifications</span>
              </div>
              <Switch
                checked={smsEnabled}
                onCheckedChange={setSmsEnabled}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100">
                <Bell className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium">Push Notifications</span>
              </div>
              <Switch
                checked={pushEnabled}
                onCheckedChange={setPushEnabled}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="lead-score">Lead Score Threshold</Label>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Only notify for leads with a score above this threshold
              </p>
              <div className="flex items-center gap-2">
                <Input
                  id="lead-score"
                  type="number"
                  min="0"
                  max="100"
                  value={leadScoreThreshold}
                  onChange={(e) => setLeadScoreThreshold(parseInt(e.target.value) || 0)}
                  className="w-20"
                  disabled={!emailEnabled && !smsEnabled && !pushEnabled}
                />
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="frequency">Notification Frequency</Label>
            <div className="space-y-2">
              <div className="flex gap-3">
                <button
                  onClick={() => setNotificationFrequency("immediate")}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer",
                    notificationFrequency === "immediate"
                      ? "bg-blue-600 text-white"
                      : "bg-background border-border hover:border-blue-600/50"
                  )}
                >
                  Immediate
                </button>
                <button
                  onClick={() => setNotificationFrequency("hourly")}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer",
                    notificationFrequency === "hourly"
                      ? "bg-blue-600 text-white"
                      : "bg-background border-border hover:border-blue-600/50"
                  )}
                >
                  Hourly Digest
                </button>
                <button
                  onClick={() => setNotificationFrequency("daily")}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer",
                    notificationFrequency === "daily"
                      ? "bg-blue-600 text-white"
                      : "bg-background border-border hover:border-blue-600/50"
                  )}
                >
                  Daily Digest
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="quiet-hours">Quiet Hours</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-moon-100">
                  <Moon className="h-4 w-4 text-moon-600" />
                </div>
                <span className="text-sm font-medium">Enable Quiet Hours</span>
              </div>
              <Switch
                checked={quietHoursEnabled}
                onCheckedChange={setQuietHoursEnabled}
                disabled={!emailEnabled && !smsEnabled && !pushEnabled}
              />
            </div>
            {quietHoursEnabled && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quiet-start">Start Time</Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      className="cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiet-end">End Time</Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {toast && (
          <div className={cn(
            "fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all",
            toast.type === "success" && "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700",
            toast.type === "error" && "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700",
            toast.type === "info" && "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
          )}>
            {toast.type === "success" && <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            {toast.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />}
            {toast.type === "info" && <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
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