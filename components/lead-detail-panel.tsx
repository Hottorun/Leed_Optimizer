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

function getLeadStatus(lead: Lead): string {
  return lead.session?.status || lead.status || "pending"
}

const STATUS_OPTIONS: { value: LeadStatus; label: string; className: string }[] = [
  { value: "pending", label: "Pending", className: "bg-[var(--status-pending-bg)] text-[var(--status-pending)]" },
  { value: "approved", label: "Approved", className: "bg-[var(--status-approved-bg)] text-[var(--status-approved)]" },
  { value: "declined", label: "Declined", className: "bg-[var(--status-declined-bg)] text-[var(--status-declined)]" },
  { value: "manual", label: "Manual", className: "bg-[var(--status-manual-bg)] text-[var(--status-manual)]" },
]

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
  const rating = lead.session?.rating ?? lead.rating ?? 0
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-lg border border-border bg-card shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium">Lead Details</h2>
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

        <div className="flex-1 overflow-y-auto p-5 space-y-5 max-h-[calc(90vh-56px)]">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-semibold">
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

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{rating}/5</span>
            {lead.session?.ratingReason && (
              <span className="text-sm text-muted-foreground">- {lead.session.ratingReason}</span>
            )}
          </div>

          {/* AI Analysis Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1 rounded-md border border-border bg-muted/50 p-3 text-center">
              <span className="text-base font-semibold">{collectedData.timeline || "N/A"}</span>
              <span className="text-xs text-muted-foreground">Timeline</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-md border border-border bg-muted/50 p-3 text-center">
              <span className="text-base font-semibold">{collectedData.budget || "N/A"}</span>
              <span className="text-xs text-muted-foreground">Budget</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-md border border-border bg-muted/50 p-3 text-center">
              <span className="text-base font-semibold">{lead.session?.needsMoreInfo ? "Info needed" : "Ready"}</span>
              <span className="text-xs text-muted-foreground">Info Status</span>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="rounded-md border border-border p-3">
            <div className="text-xs font-medium text-muted-foreground mb-1">AI Recommendation</div>
            <p className="text-sm">{lead.session?.ratingReason || lead.ratingReason || "No recommendation yet"}</p>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            {lead.phone && (
              <div className="flex items-center gap-3 rounded-md border border-border p-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
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
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground group-hover:underline">{lead.email}</p>
                </div>
              </a>
            )}
            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">{collectedData.location || lead.location || "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Conversation Summary */}
          <div className="rounded-md border border-border p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
              <MessageSquare className="h-3.5 w-3.5" />
              Conversation Summary
            </div>
            <p className="text-sm leading-relaxed">
              {lead.conversationSummary || collectedData.conversationSummary || "No conversation summary available"}
            </p>
          </div>

          {/* Action Section */}
          {status === "manual" && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Check className="h-4 w-4" />
                  Approval Message
                </label>
                <Textarea
                  value={approveMessage}
                  onChange={(e) => setApproveMessage(e.target.value)}
                  className="min-h-[80px] bg-background resize-none text-sm"
                  placeholder="Enter approval message..."
                  disabled={!isActionable}
                />
                {isActionable && (
                  <Button
                    onClick={() => handleSend("approve")}
                    disabled={isSending !== null || !approveMessage.trim()}
                    className="mt-2 w-full bg-foreground text-background hover:bg-foreground/90"
                  >
                    {isSending === "approve" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Send Approval
                  </Button>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <XCircle className="h-4 w-4" />
                  Decline Message
                </label>
                <Textarea
                  value={declineMessage}
                  onChange={(e) => setDeclineMessage(e.target.value)}
                  className="min-h-[80px] bg-background resize-none text-sm"
                  placeholder="Enter decline message..."
                  disabled={!isActionable}
                />
                {isActionable && (
                  <button
                    onClick={() => handleSend("decline")}
                    disabled={isSending !== null || !declineMessage.trim()}
                    className="mt-2 w-full px-4 py-2 bg-muted text-foreground text-sm font-medium rounded-md hover:bg-muted/80 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSending === "decline" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Send Decline
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Delete Button (for approved or declined leads) */}
          {(status === "approved" || status === "declined") && onDelete && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
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
