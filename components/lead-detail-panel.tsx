"use client"

import { useState, useEffect } from "react"
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
  Trash2,
  MessageCircle,
  AtSign,
  Users,
  Heart,
  Filter,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import type { Lead, LeadStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"

interface LeadDetailPanelProps {
  lead: Lead
  onClose: () => void
  onUpdate: (updates: Partial<Lead>) => void
  onSendMessage: (action: "approve" | "decline" | "unrelated", message: string) => Promise<void>
  onDelete: () => Promise<void>
}

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  pending: { label: "Pending Review", className: "bg-chart-3/20 text-chart-3 border-chart-3/30" },
  approved: { label: "Approved", className: "bg-primary/20 text-primary border-primary/30" },
  declined: { label: "Declined", className: "bg-destructive/20 text-destructive border-destructive/30" },
  unrelated: { label: "Unrelated", className: "bg-muted/50 text-muted-foreground border-muted" },
}

function formatDate(dateString: string): string {
  return format(new Date(dateString), "EEEE, MMMM d, yyyy 'at' h:mm a")
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

export function LeadDetailPanel({ lead, onClose, onUpdate, onSendMessage, onDelete }: LeadDetailPanelProps) {
  const [approveMessage, setApproveMessage] = useState(lead.approveMessage)
  const [declineMessage, setDeclineMessage] = useState(lead.declineMessage)
  const [unrelatedMessage, setUnrelatedMessage] = useState(
    "This message doesn't seem to be related to our services. Thank you for reaching out!"
  )
  const [isSending, setIsSending] = useState<"approve" | "decline" | "unrelated" | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setApproveMessage(lead.approveMessage)
    setDeclineMessage(lead.declineMessage)
  }, [lead.approveMessage, lead.declineMessage])

  const handleSend = async (action: "approve" | "decline" | "unrelated") => {
    setIsSending(action)
    let message = ""
    if (action === "approve") {
      message = approveMessage
    } else if (action === "decline") {
      message = declineMessage
    } else {
      message = unrelatedMessage
    }
    try {
      await onSendMessage(action, message)
    } finally {
      setIsSending(null)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  const isPending = lead.status === "pending"
  const status = statusConfig[lead.status]

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 cursor-pointer" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl max-h-[90vh] rounded-xl border bg-background shadow-2xl overflow-hidden flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">Lead Details</h2>
          <Badge variant="outline" className={cn("text-xs", status.className)}>
            {status.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the lead
                  for {lead.name}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Contact Info */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold",
            lead.status === "approved" && "bg-primary/20 text-primary",
            lead.status === "pending" && "bg-chart-3/20 text-chart-3",
            lead.status === "declined" && "bg-destructive/20 text-destructive",
            lead.status === "unrelated" && "bg-muted text-muted-foreground"
          )}>
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

        {/* Prominent Received Date */}
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Received</p>
            <p className="text-lg font-semibold text-foreground">
              {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
            </p>
            <p className="text-sm text-muted-foreground">{formatDate(lead.createdAt)}</p>
          </div>
        </div>

        {/* Customer Type & Platform */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className={cn(
            "flex items-center gap-1.5",
            lead.contactPlatform === "whatsapp" ? "bg-green-500/10 text-green-600 border-green-500/30" : "bg-blue-500/10 text-blue-600 border-blue-500/30"
          )}>
            {lead.contactPlatform === "whatsapp" ? (
              <MessageCircle className="h-3 w-3" />
            ) : (
              <AtSign className="h-3 w-3" />
            )}
            {lead.contactPlatform === "whatsapp" ? "WhatsApp" : "Email"}
          </Badge>
          {lead.leadCount >= 3 && (
            <Badge variant="outline" className="flex items-center gap-1.5 bg-red-500/10 text-red-600 border-red-500/30">
              <Heart className="h-3 w-3 fill-red-500" />
              Loyal ({lead.leadCount} leads)
            </Badge>
          )}
          {lead.leadCount > 1 && lead.leadCount < 3 && (
            <Badge variant="outline" className="flex items-center gap-1.5 bg-primary/10 text-primary border-primary/30">
              <Users className="h-3 w-3" />
              Returning ({lead.leadCount} leads)
            </Badge>
          )}
          {lead.autoApproved && (
            <Badge variant="outline" className="flex items-center gap-1.5 bg-purple-500/10 text-purple-600 border-purple-500/30">
              Auto-Approved
            </Badge>
          )}
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

        {/* Action Buttons - Only show for pending leads */}
        {isPending && (
          <div className="mt-6 space-y-4">
            {/* Approve Message */}
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-primary cursor-pointer">
                  <Check className="h-4 w-4" />
                  Approval Message
                </label>
              </div>
              <Textarea
                value={approveMessage}
                onChange={(e) => setApproveMessage(e.target.value)}
                className="min-h-[80px] bg-secondary resize-none cursor-text border-border"
                placeholder="Enter approval message..."
              />
              <Button
                onClick={() => handleSend("approve")}
                disabled={isSending !== null || !approveMessage.trim()}
                className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
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
            </div>

            {/* Decline Message */}
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-destructive cursor-pointer">
                  <XCircle className="h-4 w-4" />
                  Decline Message
                </label>
              </div>
              <Textarea
                value={declineMessage}
                onChange={(e) => setDeclineMessage(e.target.value)}
                className="min-h-[80px] bg-secondary resize-none cursor-text border-border"
                placeholder="Enter decline message..."
              />
              <Button
                onClick={() => handleSend("decline")}
                disabled={isSending !== null || !declineMessage.trim()}
                variant="destructive"
                className="mt-2 w-full cursor-pointer"
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
            </div>

            {/* Mark as Unrelated */}
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <Filter className="h-4 w-4" />
                  Mark as Unrelated
                </label>
              </div>
              <Textarea
                value={unrelatedMessage}
                onChange={(e) => setUnrelatedMessage(e.target.value)}
                className="min-h-[60px] bg-secondary resize-none cursor-text border-border"
                placeholder="Optional message for unrelated..."
              />
              <Button
                onClick={() => handleSend("unrelated")}
                disabled={isSending !== null}
                variant="outline"
                className="mt-2 w-full cursor-pointer"
              >
                {isSending === "unrelated" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Marking...
                  </>
                ) : (
                  <>
                    <Filter className="mr-2 h-4 w-4" />
                    Mark as Unrelated
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Show status badges for non-pending leads */}
        {!isPending && (
          <div className="mt-6 rounded-lg bg-secondary p-4">
            <p className="text-sm text-muted-foreground">
              This lead has been <span className="font-medium text-foreground">{lead.status}</span>.
              {lead.status === "approved" && " An approval message was sent."}
              {lead.status === "declined" && " A decline message was sent."}
              {lead.status === "unrelated" && " This message was marked as unrelated."}
            </p>
          </div>
        )}

        {/* Timestamps */}
        <div className="mt-8 space-y-2 text-sm text-muted-foreground">
          {lead.updatedAt !== lead.createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Updated:</span> {formatDate(lead.updatedAt)}
            </div>
          )}
          {lead.lastContactedAt && (
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">Last Contacted:</span> {formatDate(lead.lastContactedAt)}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
