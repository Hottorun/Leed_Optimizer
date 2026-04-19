"use client"

import { useState } from "react"
import {
  X,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  MessageSquare,
  Send,
  XCircle,
  Check,
  Loader2,
  Star,
  Clock,
  Pencil,
  Trash2,
  ChevronDown,
  Sparkles,
  DollarSign,
  Calendar,
  Zap,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Lead, LeadSource, LeadStatus, CollectedData } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getSafeString } from "@/lib/lead-utils"
import { toast } from "sonner"

interface LeadDetailPanelProps {
  lead: Lead
  onClose: () => void
  onUpdate: (updates: Partial<Lead>) => void
  onSendMessage: (action: "approve" | "decline", message: string) => Promise<void>
  onDelete?: (leadId: string) => Promise<void>
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getCollectedDataFirst(collectedData: CollectedData | CollectedData[] | null | undefined): CollectedData {
  if (!collectedData) return {}
  if (Array.isArray(collectedData)) return collectedData[0] || {}
  return collectedData
}

function getLeadSource(lead: Lead): LeadSource {
  const collectedData = getCollectedDataFirst(lead.session?.collectedData)
  const source = getSafeString(collectedData?.source)
  if (source === "whatsapp" || source === "email") return source
  if (lead.phone) return "whatsapp"
  return "email"
}

function getLeadRating(lead: Lead): number {
  return lead.session?.rating ?? lead.rating ?? 0
}

const STATUS_OPTIONS: { value: LeadStatus; label: string; className: string }[] = [
  { value: "pending", label: "Pending", className: "bg-[var(--status-pending-bg)] text-[var(--status-pending)]" },
  { value: "approved", label: "Approved", className: "bg-[var(--status-approved-bg)] text-[var(--status-approved)]" },
  { value: "declined", label: "Declined", className: "bg-[var(--status-declined-bg)] text-[var(--status-declined)]" },
  { value: "manual", label: "Manual", className: "bg-[var(--status-manual-bg)] text-[var(--status-manual)]" },
]

function AISignalTags({ lead, collectedData }: { lead: Lead; collectedData: CollectedData }) {
  const tags: { label: string; icon: React.ReactNode; variant: "positive" | "neutral" | "warning" }[] = []

  if (collectedData.budget) tags.push({ label: "Budget shared", icon: <DollarSign className="h-3 w-3" />, variant: "positive" })
  if (collectedData.timeline) tags.push({ label: "Timeline set", icon: <Calendar className="h-3 w-3" />, variant: "positive" })
  if (collectedData.location || lead.location) tags.push({ label: "Location known", icon: <MapPin className="h-3 w-3" />, variant: "positive" })
  if ((lead.session?.rating ?? 0) >= 4) tags.push({ label: "Strong signal", icon: <Zap className="h-3 w-3" />, variant: "positive" })
  if (lead.session?.needsMoreInfo) tags.push({ label: "Info needed", icon: <AlertCircle className="h-3 w-3" />, variant: "warning" })
  if (!collectedData.budget) tags.push({ label: "Budget unknown", icon: <DollarSign className="h-3 w-3" />, variant: "neutral" })

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.slice(0, 4).map((tag, i) => (
        <span
          key={i}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
            tag.variant === "positive" && "bg-[var(--status-approved-bg)] text-[var(--status-approved)]",
            tag.variant === "neutral" && "bg-muted text-muted-foreground",
            tag.variant === "warning" && "bg-[var(--status-pending-bg)] text-[var(--status-pending)]",
          )}
        >
          {tag.icon}
          {tag.label}
        </span>
      ))}
    </div>
  )
}

export function LeadDetailPanel({ lead, onClose, onUpdate, onSendMessage, onDelete }: LeadDetailPanelProps) {
  const [approveMessage, setApproveMessage] = useState("")
  const [declineMessage, setDeclineMessage] = useState("")
  const [isSending, setIsSending] = useState<"approve" | "decline" | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editForm, setEditForm] = useState({
    name: lead.name,
    workType: getSafeString(getCollectedDataFirst(lead.session?.collectedData).workType) || lead.workType || "",
    location: getSafeString(getCollectedDataFirst(lead.session?.collectedData).location) || lead.location || "",
    conversationSummary: lead.conversationSummary || getSafeString(getCollectedDataFirst(lead.session?.collectedData).conversationSummary) || "",
    budget: getSafeString(getCollectedDataFirst(lead.session?.collectedData).budget) || "",
    timeline: getSafeString(getCollectedDataFirst(lead.session?.collectedData).timeline) || "",
  })

  const status = lead.session?.status || lead.status
  const rating = getLeadRating(lead)
  const source = getLeadSource(lead)
  const collectedData = getCollectedDataFirst(lead.session?.collectedData)

  const handleSend = async (action: "approve" | "decline") => {
    setIsSending(action)
    const message = action === "approve" ? approveMessage : declineMessage
    try {
      await onSendMessage(action, message)
      toast.success(`Message ${action === "approve" ? "approval" : "decline"} sent`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send message"
      toast.error(msg)
    } finally {
      setIsSending(null)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || !confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return
    setIsDeleting(true)
    try {
      await onDelete(lead.id)
      onClose()
    } catch {
      toast.error("Failed to delete lead")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveEdit = async () => {
    const updatedCollectedData = {
      ...collectedData,
      workType: editForm.workType,
      location: editForm.location,
      conversationSummary: editForm.conversationSummary,
      budget: editForm.budget,
      timeline: editForm.timeline,
    }

    try {
      await onUpdate({
        name: editForm.name,
        workType: editForm.workType,
        location: editForm.location,
        conversationSummary: editForm.conversationSummary,
      } as Partial<Lead>)

      if (lead.session?.id) {
        const res = await fetch(`/api/leads/${lead.id}/session`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collectedData: updatedCollectedData }),
        })
        if (!res.ok) throw new Error("Failed to save session data")
      }

      toast.success("Lead updated")
      setIsEditing(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save changes"
      toast.error(msg)
    }
  }

  const isActionable = status === "pending" || status === "manual"
  const sourceLabel = source === "whatsapp" ? "WhatsApp" : "Email"
  const currentStatusOption = STATUS_OPTIONS.find(s => s.value === status)
  const ratingReason = lead.session?.ratingReason || lead.ratingReason

  // Convert 1-5 rating to 0-100 score
  const aiScore = Math.round((rating / 5) * 100)

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

      {/* Panel */}
      <div
        className="relative w-full max-w-md h-full overflow-hidden bg-card border-l border-border shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Lead Details</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Header — Name, Source, Status */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold">{lead.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {sourceLabel}
                </span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full capitalize font-medium",
                    currentStatusOption?.className
                  )}
                >
                  {status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{collectedData.workType || lead.workType || "Not specified"}</span>
              </div>
            </div>
          </div>

          {/* AI Score + Stars */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{rating}/5</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">AI Score</span>
              <span className={cn(
                "text-sm font-semibold tabular-nums px-2 py-0.5 rounded-md",
                aiScore >= 70 ? "bg-[var(--status-approved-bg)] text-[var(--status-approved)]" :
                aiScore >= 40 ? "bg-[var(--status-pending-bg)] text-[var(--status-pending)]" :
                "bg-muted text-muted-foreground"
              )}>
                {aiScore}
              </span>
            </div>
          </div>

          {/* AI Signal Tags */}
          <AISignalTags lead={lead} collectedData={collectedData} />

          {/* Edit Form */}
          {isEditing && (
            <div className="rounded-md border border-border p-4 space-y-3 bg-muted/30">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Edit Lead
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Work Type</label>
                  <input
                    type="text"
                    value={editForm.workType}
                    onChange={(e) => setEditForm({ ...editForm, workType: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background"
                    placeholder="e.g. Home Renovation"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background"
                    placeholder="e.g. New York, NY"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Budget</label>
                  <input
                    type="text"
                    value={editForm.budget}
                    onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background"
                    placeholder="e.g. $10,000 - $20,000"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Timeline</label>
                  <input
                    type="text"
                    value={editForm.timeline}
                    onChange={(e) => setEditForm({ ...editForm, timeline: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background"
                    placeholder="e.g. Within 2 months"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Conversation Summary</label>
                  <textarea
                    value={editForm.conversationSummary}
                    onChange={(e) => setEditForm({ ...editForm, conversationSummary: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background resize-none"
                    placeholder="Brief summary of the lead's inquiry..."
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* Key Data Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1 rounded-md border border-border bg-muted/50 p-3 text-center">
              <span className={cn(
                "text-sm font-semibold",
                !collectedData.timeline && "text-muted-foreground"
              )}>
                {collectedData.timeline || "—"}
              </span>
              <span className="text-xs text-muted-foreground">Timeline</span>
              {!collectedData.timeline && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[10px] text-muted-foreground/60 hover:text-foreground transition-colors underline"
                >
                  Add
                </button>
              )}
            </div>
            <div className="flex flex-col items-center gap-1 rounded-md border border-border bg-muted/50 p-3 text-center">
              <span className={cn(
                "text-sm font-semibold",
                !collectedData.budget && "text-muted-foreground"
              )}>
                {collectedData.budget || "—"}
              </span>
              <span className="text-xs text-muted-foreground">Budget</span>
              {!collectedData.budget && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[10px] text-muted-foreground/60 hover:text-foreground transition-colors underline"
                >
                  Add
                </button>
              )}
            </div>
            <div className="flex flex-col items-center gap-1 rounded-md border border-border bg-muted/50 p-3 text-center">
              <span className="text-sm font-semibold">{lead.session?.needsMoreInfo ? "Needed" : "Ready"}</span>
              <span className="text-xs text-muted-foreground">Info</span>
            </div>
          </div>

          {/* AI Recommendation */}
          {ratingReason && (
            <div className="rounded-md border border-border p-3 bg-muted/20">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                AI Recommendation
              </div>
              <p className="text-sm leading-relaxed">{ratingReason}</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-2">
            {lead.phone && (
              <div className="flex items-center gap-3 rounded-md border border-border p-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{lead.phone}</p>
                </div>
              </div>
            )}
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-3 rounded-md border border-border p-3 hover:bg-muted/50 transition-colors group"
              >
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground group-hover:underline">{lead.email}</p>
                </div>
              </a>
            )}
            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">
                  {collectedData.location || lead.location || (
                    <button onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-foreground underline">
                      Not detected — add
                    </button>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Conversation Summary */}
          {(lead.conversationSummary || collectedData.conversationSummary) && (
            <div className="rounded-md border border-border p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <MessageSquare className="h-3.5 w-3.5" />
                Conversation Summary
              </div>
              <p className="text-sm leading-relaxed">
                {lead.conversationSummary || collectedData.conversationSummary}
              </p>
            </div>
          )}

          {/* AI Draft Reply */}
          {isActionable && (collectedData.workType || lead.workType) && (
            <div className="rounded-md border border-border bg-muted/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Draft Reply
                </div>
                <button
                  onClick={() => {
                    const workType = collectedData.workType || lead.workType || "your project"
                    const location = collectedData.location || lead.location
                    const budget = collectedData.budget
                    const draft = `Hi ${lead.name.split(" ")[0]}, thank you for reaching out about ${workType}${location ? ` in ${location}` : ""}. ${budget ? `Your budget of ${budget} fits well with our services. ` : ""}We'd love to discuss your project further. When would be a good time to connect?`
                    setApproveMessage(draft)
                  }}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  Use as approval message
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                {`Hi ${lead.name.split(" ")[0]}, thank you for reaching out about ${collectedData.workType || lead.workType}${collectedData.location || lead.location ? ` in ${collectedData.location || lead.location}` : ""}. ${collectedData.budget ? `Your budget of ${collectedData.budget} fits well with our services. ` : ""}We'd love to discuss your project further. When would be a good time to connect?`}
              </p>
            </div>
          )}

          {/* Action Section — for pending and manual */}
          {isActionable && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Respond to Lead
              </div>

              <div>
                <Textarea
                  value={approveMessage}
                  onChange={(e) => setApproveMessage(e.target.value)}
                  className="min-h-[72px] bg-background resize-none text-sm mb-2"
                  placeholder="Approval message..."
                />
                <Button
                  onClick={() => handleSend("approve")}
                  disabled={isSending !== null || !approveMessage.trim()}
                  className="w-full bg-foreground text-background hover:bg-foreground/90"
                  size="sm"
                >
                  {isSending === "approve" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send Approval
                </Button>
              </div>

              <div>
                <Textarea
                  value={declineMessage}
                  onChange={(e) => setDeclineMessage(e.target.value)}
                  className="min-h-[72px] bg-background resize-none text-sm mb-2"
                  placeholder="Decline message..."
                />
                <button
                  onClick={() => handleSend("decline")}
                  disabled={isSending !== null || !declineMessage.trim()}
                  className="w-full px-4 py-2 bg-muted text-foreground text-sm font-medium rounded-md hover:bg-muted/80 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isSending === "decline" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Send Decline
                </button>
              </div>
            </div>
          )}

          {/* Delete Button */}
          {(status === "approved" || status === "declined") && onDelete && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Remove Lead
            </Button>
          )}

          {/* Timestamps */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDate(lead.createdAt)}</span>
            {lead.updatedAt !== lead.createdAt && (
              <>
                <span className="text-border">|</span>
                <span>Updated {formatDate(lead.updatedAt)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
