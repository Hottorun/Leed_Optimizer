"use client"

import { useState } from "react"
import {
  X,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  MessageSquare,
  Send,
  XCircle,
  Check,
  Loader2,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import type { Lead, LeadStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeadDetailPanelProps {
  lead: Lead
  onClose: () => void
  onUpdate: (updates: Partial<Lead>) => void
  onSendMessage: (action: "approve" | "decline", message: string) => Promise<void>
}

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  pending: { label: "Pending Review", className: "bg-chart-3/20 text-chart-3 border-chart-3/30" },
  approved: { label: "Approved", className: "bg-primary/20 text-primary border-primary/30" },
  declined: { label: "Declined", className: "bg-destructive/20 text-destructive border-destructive/30" },
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

function getRatingColor(rating: number): string {
  if (rating >= 4) return "text-primary"
  if (rating >= 3) return "text-chart-3"
  return "text-destructive"
}

function getRatingBgColor(rating: number): string {
  if (rating >= 4) return "bg-primary/10 border-primary/20"
  if (rating >= 3) return "bg-chart-3/10 border-chart-3/20"
  return "bg-destructive/10 border-destructive/20"
}

export function LeadDetailPanel({ lead, onClose, onSendMessage }: LeadDetailPanelProps) {
  const [approveMessage, setApproveMessage] = useState(lead.approveMessage)
  const [declineMessage, setDeclineMessage] = useState(lead.declineMessage)
  const [isSending, setIsSending] = useState<"approve" | "decline" | null>(null)

  const handleSend = async (action: "approve" | "decline") => {
    setIsSending(action)
    const message = action === "approve" ? approveMessage : declineMessage
    try {
      await onSendMessage(action, message)
    } finally {
      setIsSending(null)
    }
  }

  const isPending = lead.status === "pending"
  const status = statusConfig[lead.status]

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-background shadow-xl">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">Lead Details</h2>
          <Badge variant="outline" className={cn("text-xs", status.className)}>
            {status.label}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Contact Info */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-xl font-semibold text-foreground">
            {lead.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">{lead.name}</h3>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>{lead.workType}</span>
            </div>
          </div>
        </div>

        {/* AI Rating Section */}
        <div className={cn("mt-6 rounded-lg border p-4", getRatingBgColor(lead.rating))}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">AI Rating</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < lead.rating ? getRatingColor(lead.rating) : "text-muted-foreground/30"
                    )}
                    fill={i < lead.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className={cn("text-sm font-semibold", getRatingColor(lead.rating))}>
                {lead.rating}/5
              </span>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{lead.ratingReason}</p>
        </div>

        {/* Contact Details */}
        <div className="mt-6 grid gap-3">
          <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium text-foreground">{lead.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{lead.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium text-foreground">{lead.location}</p>
            </div>
          </div>
        </div>

        {/* Conversation Summary */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            Conversation Summary
          </div>
          <div className="mt-2 rounded-lg bg-secondary p-4 text-sm text-foreground leading-relaxed">
            {lead.conversationSummary}
          </div>
        </div>

        {/* Approve Message */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-primary">
              <Check className="h-4 w-4" />
              Approval Message
            </label>
            {!isPending && lead.status === "approved" && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                Sent
              </Badge>
            )}
          </div>
          <Textarea
            value={approveMessage}
            onChange={(e) => setApproveMessage(e.target.value)}
            className="mt-2 min-h-[120px] bg-secondary resize-none"
            placeholder="Enter approval message..."
            disabled={!isPending}
          />
          {isPending && (
            <Button
              onClick={() => handleSend("approve")}
              disabled={isSending !== null || !approveMessage.trim()}
              className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSending === "approve" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Approval
                </>
              )}
            </Button>
          )}
        </div>

        {/* Decline Message */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-destructive">
              <XCircle className="h-4 w-4" />
              Decline Message
            </label>
            {!isPending && lead.status === "declined" && (
              <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
                Sent
              </Badge>
            )}
          </div>
          <Textarea
            value={declineMessage}
            onChange={(e) => setDeclineMessage(e.target.value)}
            className="mt-2 min-h-[120px] bg-secondary resize-none"
            placeholder="Enter decline message..."
            disabled={!isPending}
          />
          {isPending && (
            <Button
              onClick={() => handleSend("decline")}
              disabled={isSending !== null || !declineMessage.trim()}
              variant="destructive"
              className="mt-3 w-full"
            >
              {isSending === "decline" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Send Decline
                </>
              )}
            </Button>
          )}
        </div>

        {/* Timestamps */}
        <div className="mt-8 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Received: {formatDate(lead.createdAt)}
          </div>
          {lead.updatedAt !== lead.createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Updated: {formatDate(lead.updatedAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
