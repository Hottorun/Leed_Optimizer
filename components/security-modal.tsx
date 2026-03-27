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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CheckCircle, Loader2, AlertTriangle, Shield, Bell, Phone, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/use-user"

interface SecurityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SecurityModal({ open, onOpenChange }: SecurityModalProps) {
  const { user } = useUser()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [notifyNewLeads, setNotifyNewLeads] = useState(true)
  const [notifyLeadApproved, setNotifyLeadApproved] = useState(true)
  const [notifyLeadDeclined, setNotifyLeadDeclined] = useState(true)
  const [notifyManualReview, setNotifyManualReview] = useState(true)
  const [notifyDailySummary, setNotifyDailySummary] = useState(false)
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(true)
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

    const loadSettings = async () => {
      try {
        const res = await fetch(`/api/settings/user`)
        const data = await res.json()
        
        if (data) {
          setNotificationsEnabled(data.notificationsEnabled ?? true)
          setNotifyNewLeads(data.notifyNewLeads ?? true)
          setNotifyLeadApproved(data.notifyLeadApproved ?? true)
          setNotifyLeadDeclined(data.notifyLeadDeclined ?? true)
          setNotifyManualReview(data.notifyManualReview ?? true)
          setNotifyDailySummary(data.notifyDailySummary ?? false)
          setNotifyWeeklyReport(data.notifyWeeklyReport ?? true)
        }
      } catch (err) {
        console.error("Failed to load security settings:", err)
        // Use defaults
      }
    }

    loadSettings()
  }, [user?.id, onOpenChange])

  const handleSave = async () => {
    if (!user?.id) return

    setIsSaving(true)
    try {
      const res = await fetch("/api/settings/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationsEnabled,
          notifyNewLeads,
          notifyLeadApproved,
          notifyLeadDeclined,
          notifyManualReview,
          notifyDailySummary,
          notifyWeeklyReport,
        }),
      })

      if (res.ok) {
        showToast("Security settings updated successfully", "success")
        onOpenChange(false)
      } else {
        showToast("Failed to update security settings", "error")
      }
    } catch (err) {
      console.error("Failed to update security settings:", err)
      showToast("Failed to update security settings", "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-6">
        <DialogHeader>
          <DialogTitle>Security & Privacy</DialogTitle>
          <DialogDescription>
            Configure your security and notification preferences
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="security-notifications">Email Notifications</Label>
            <div className="space-y-2">
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
              <p className="text-sm text-muted-foreground">
                Receive email notifications for account activities
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="lead-notifications">Lead Notifications</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">New Lead Alerts</span>
              </div>
              <Switch
                checked={notifyNewLeads}
                onCheckedChange={setNotifyNewLeads}
                disabled={!notificationsEnabled}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium">Approved Lead Alerts</span>
            </div>
            <Switch
              checked={notifyLeadApproved}
              onCheckedChange={setNotifyLeadApproved}
              disabled={!notificationsEnabled}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-sm font-medium">Declined Lead Alerts</span>
            </div>
            <Switch
              checked={notifyLeadDeclined}
              onCheckedChange={setNotifyLeadDeclined}
              disabled={!notificationsEnabled}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-sm font-medium">Manual Review Alerts</span>
            </div>
            <Switch
              checked={notifyManualReview}
              onCheckedChange={setNotifyManualReview}
              disabled={!notificationsEnabled}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium">Daily Summary</span>
            </div>
            <Switch
              checked={notifyDailySummary}
              onCheckedChange={setNotifyDailySummary}
              disabled={!notificationsEnabled}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100">
                <Bell className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium">Weekly Report</span>
            </div>
            <Switch
              checked={notifyWeeklyReport}
              onCheckedChange={setNotifyWeeklyReport}
              disabled={!notificationsEnabled}
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
            {toast.type === "info" && <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
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