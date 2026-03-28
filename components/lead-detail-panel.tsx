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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Lead, LeadSource } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeadDetailPanelProps {
  lead: Lead
  onClose: () => void
  onUpdate: (updates: Partial<Lead>) => void
  onSendMessage: (action: "approve" | "decline", message: string) => Promise<void>
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

function getLeadSource(lead: Lead): LeadSource {
  if (lead.phone) return "whatsapp"
  return "email"
}

function getLeadRating(lead: Lead): number {
  return lead.session?.rating ?? lead.rating ?? 0
}

function getLeadStatus(lead: Lead): string {
  return lead.session?.status || lead.status || "pending"
}

export function LeadDetailPanel({ lead, onClose, onSendMessage }: LeadDetailPanelProps) {
  const [approveMessage, setApproveMessage] = useState("")
  const [declineMessage, setDeclineMessage] = useState("")
  const [isSending, setIsSending] = useState<"approve" | "decline" | null>(null)

  const status = lead.session?.status || lead.status
  const rating = lead.session?.rating ?? lead.rating ?? 0
  const source = lead.phone ? "whatsapp" : "email"
  const collectedData = lead.session?.collectedData || {}

  const handleSend = async (action: "approve" | "decline") => {
    setIsSending(action)
    const message = action === "approve" ? approveMessage : declineMessage
    try {
      await onSendMessage(action, message)
    } finally {
      setIsSending(null)
    }
  }

  const isActionable = status === "pending" || status === "manual"
  const sourceLabel = source === "whatsapp" ? "WhatsApp" : "Email"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-lg border border-border bg-card shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">Lead Details</h2>
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
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full capitalize font-medium",
                  status === "approved" && "bg-[var(--status-approved-bg)] text-[var(--status-approved)]",
                  status === "pending" && "bg-[var(--status-pending-bg)] text-[var(--status-pending)]",
                  status === "manual" && "bg-[var(--status-manual-bg)] text-[var(--status-manual)]",
                  status === "declined" && "bg-[var(--status-declined-bg)] text-[var(--status-declined)]",
                )}>
                  {status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{collectedData.workType || lead.workType || "Not specified"}</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < rating ? "text-foreground fill-foreground" : "text-muted"
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
              <span className="text-xs text-muted-foreground">Status</span>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="rounded-md border border-border p-3">
            <div className="text-xs font-medium text-muted-foreground mb-1">AI Recommendation</div>
            <p className="text-sm">{lead.session?.ratingReason || lead.ratingReason || "No recommendation yet"}</p>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{lead.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{lead.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">{collectedData.location || lead.location || "Not specified"}</p>
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
