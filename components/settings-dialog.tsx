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
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Loader2, Link, Clock, AlertTriangle, Zap, Sparkles, Sun, Moon, Globe } from "lucide-react"
import type { AppSettings } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: AppSettings
  onUpdateSettings: (settings: Partial<AppSettings>) => Promise<void>
  onDeleteAllLeads: () => Promise<void>
  onDeleteOldDeclined: () => Promise<number>
  teamRole?: "owner" | "admin" | "member"
}

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
  onDeleteAllLeads,
  onDeleteOldDeclined,
  teamRole,
}: SettingsDialogProps) {
  const isAdminOrOwner = teamRole === "admin" || teamRole === "owner"
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl)
  const [autoDeleteDays, setAutoDeleteDays] = useState(settings.autoDeleteDeclinedDays.toString())
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(settings.autoApproveEnabled)
  const [autoApproveMinRating, setAutoApproveMinRating] = useState(settings.autoApproveMinRating.toString())
  const [autoDeclineUnrelated, setAutoDeclineUnrelated] = useState(settings.autoDeclineUnrelated)
  const [followUpDays, setFollowUpDays] = useState(settings.followUpDays.toString())
  const [followUpMessage, setFollowUpMessage] = useState(settings.followUpMessage)
  const [language, setLanguage] = useState<"de" | "en">(settings.language || "de")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingOld, setIsDeletingOld] = useState(false)
  const [deletedCount, setDeletedCount] = useState<number | null>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (open) {
      setWebhookUrl(settings.webhookUrl)
      setAutoDeleteDays(settings.autoDeleteDeclinedDays.toString())
      setAutoApproveEnabled(settings.autoApproveEnabled)
      setAutoApproveMinRating(settings.autoApproveMinRating.toString())
      setAutoDeclineUnrelated(settings.autoDeclineUnrelated)
      setFollowUpDays(settings.followUpDays.toString())
      setFollowUpMessage(settings.followUpMessage)
      setLanguage(settings.language || "de")
    }
  }, [open, settings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdateSettings({
        webhookUrl,
        autoDeleteDeclinedDays: parseInt(autoDeleteDays) || 0,
        autoApproveEnabled,
        autoApproveMinRating: parseInt(autoApproveMinRating) || 4,
        autoDeclineUnrelated,
        followUpDays: parseInt(followUpDays) || 3,
        followUpMessage,
        language,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAll = async () => {
    setIsDeleting(true)
    try {
      await onDeleteAllLeads()
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteOldDeclined = async () => {
    setIsDeletingOld(true)
    try {
      const count = await onDeleteOldDeclined()
      setDeletedCount(count)
    } finally {
      setIsDeletingOld(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your lead management preferences and automation rules
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className={`grid w-full ${isAdminOrOwner ? "grid-cols-3" : "grid-cols-1"}`}>
            <TabsTrigger value="general" className="cursor-pointer">General</TabsTrigger>
            {isAdminOrOwner && (
              <TabsTrigger value="automation" className="cursor-pointer">
                <Zap className="h-4 w-4 mr-1" />
                Automation
              </TabsTrigger>
            )}
            {isAdminOrOwner && (
              <TabsTrigger value="danger" className="cursor-pointer">Danger</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="general" className="space-y-6 py-4">
            {/* Webhook Configuration */}
            {isAdminOrOwner && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Link className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Webhook Configuration</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-url" className="text-xs text-muted-foreground">
                    n8n Webhook URL
                  </Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-n8n-instance.com/webhook/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Messages will be sent to this webhook when you approve or decline leads
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* Theme Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Sun className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Label className="text-sm font-medium">Dark Mode</Label>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Toggle between dark and light mode
              </p>
            </div>

            {/* Language Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Language</Label>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage("de")}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors cursor-pointer",
                      language === "de"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-background border-border hover:border-emerald-600/50"
                    )}
                  >
                    Deutsch
                  </button>
                  <button
                    onClick={() => setLanguage("en")}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors cursor-pointer",
                      language === "en"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-background border-border hover:border-emerald-600/50"
                    )}
                  >
                    English
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select your preferred language for the interface
                </p>
              </div>
            </div>

            <Separator />

            {/* Auto-delete Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Auto-delete Declined Leads</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="auto-delete-days" className="text-xs text-muted-foreground">
                  Delete declined leads after (days)
                </Label>
                <Input
                  id="auto-delete-days"
                  type="number"
                  min="0"
                  placeholder="0 = disabled"
                  value={autoDeleteDays}
                  onChange={(e) => setAutoDeleteDays(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Set to 0 to disable automatic deletion. Declined leads older than this will be removed.
                </p>
              </div>
              {parseInt(autoDeleteDays) > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteOldDeclined}
                  disabled={isDeletingOld}
                  className="cursor-pointer"
                >
                  {isDeletingOld ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Old Declined Now
                    </>
                  )}
                </Button>
              )}
              {deletedCount !== null && (
                <p className="text-xs text-primary">
                  Deleted {deletedCount} old declined lead{deletedCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="automation" className="space-y-6 py-4">
            {/* Auto-Approve Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-medium">Auto-Approve High-Quality Leads</Label>
                </div>
                <Switch
                  checked={autoApproveEnabled}
                  onCheckedChange={setAutoApproveEnabled}
                />
              </div>
              
              {autoApproveEnabled && (
                <div className="pl-6 space-y-3 border-l-2 border-primary/20">
                  <p className="text-xs text-muted-foreground">
                    Automatically approve leads that meet your quality criteria and send them directly to n8n.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="min-rating" className="text-xs text-muted-foreground">
                      Minimum Rating to Auto-Approve
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="min-rating"
                        type="number"
                        min="1"
                        max="5"
                        className="w-20"
                        value={autoApproveMinRating}
                        onChange={(e) => setAutoApproveMinRating(e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground">stars or higher</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Auto-Decline Unrelated */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Auto-Mark Unrelated Messages</Label>
                </div>
                <Switch
                  checked={autoDeclineUnrelated}
                  onCheckedChange={setAutoDeclineUnrelated}
                />
              </div>
              
              {autoDeclineUnrelated && (
                <div className="pl-6 border-l-2 border-muted">
                  <p className="text-xs text-muted-foreground">
                    Automatically mark messages that don&apos;t appear to be leads as &quot;Unrelated&quot;.
                    These will be stored separately and can be deleted automatically.
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Follow-up Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Auto Follow-up Pending Leads</Label>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="followup-days" className="text-xs text-muted-foreground">
                    Days to wait before follow-up
                  </Label>
                  <Input
                    id="followup-days"
                    type="number"
                    min="1"
                    className="w-24"
                    value={followUpDays}
                    onChange={(e) => setFollowUpDays(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followup-message" className="text-xs text-muted-foreground">
                    Follow-up Message Template
                  </Label>
                  <Textarea
                    id="followup-message"
                    placeholder="Hi {name}, just checking in..."
                    value={followUpMessage}
                    onChange={(e) => setFollowUpMessage(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use &#123;name&#125; to insert the customer&apos;s name
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="danger" className="space-y-6 py-4">
            {/* Danger Zone */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <Label className="text-sm font-medium text-destructive">Danger Zone</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                These actions are irreversible. Please proceed with caution.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All Leads
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all leads
                      from your database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAll}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete All Leads"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>
        </Tabs>

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
