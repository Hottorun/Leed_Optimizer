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
  Clock,
  Sparkles,
  Zap,
  TrendingUp,
  AlertCircle,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import type { Lead, LeadStatus, LeadSource } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeadDetailPanelProps {
  lead: Lead
  onClose: () => void
  onUpdate: (updates: Partial<Lead>) => void
  onSendMessage: (action: "approve" | "decline", message: string) => Promise<void>
}

const statusConfig: Record<LeadStatus, { label: string; dotColor: string; textColor: string }> = {
  pending: { label: "Pending", dotColor: "bg-amber-500", textColor: "text-amber-600" },
  approved: { label: "Approved", dotColor: "bg-blue-500", textColor: "text-blue-600" },
  declined: { label: "Declined", dotColor: "bg-slate-400", textColor: "text-slate-500" },
  manual: { label: "Manual Review", dotColor: "bg-purple-500", textColor: "text-purple-600" },
}

const sourceConfig: Record<LeadSource, { label: string; color: string; iconColor: string }> = {
  whatsapp: { label: "WhatsApp", color: "bg-emerald-50 text-emerald-700", iconColor: "text-emerald-500" },
  email: { label: "Email", color: "bg-blue-50 text-blue-700", iconColor: "text-blue-500" },
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

  const isActionable = lead.status === "pending" || lead.status === "manual"
  const status = statusConfig[lead.status]
  const source = sourceConfig[lead.source]

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 p-4 bg-gradient-to-r from-white to-blue-50/30">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Lead Details</h2>
          <div className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", status.dotColor)} />
            <span className={cn("text-xs font-medium", status.textColor)}>{status.label}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 hover:bg-blue-50"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-xl font-semibold text-blue-700 shadow-sm">
            {lead.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-slate-800">{lead.name}</h3>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", source.color)}>
                {source.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 mt-1">
              <Briefcase className="h-4 w-4" />
              <span>{lead.workType}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < lead.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-700">{lead.rating}/5</span>
          </div>
          <div className="h-4 w-px bg-indigo-200" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <p className="text-sm text-indigo-600">{lead.ratingReason}</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <h4 className="font-semibold text-indigo-700">AI Analysis</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
                lead.rating >= 4 ? "bg-indigo-100" : lead.rating >= 3 ? "bg-blue-100" : "bg-slate-100"
              )}>
                <Target className={cn(
                  "h-4 w-4",
                  lead.rating >= 4 ? "text-indigo-600" : lead.rating >= 3 ? "text-blue-600" : "text-slate-500"
                )} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Priority Level</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lead.rating >= 4 ? "High priority - Immediate attention recommended" 
                    : lead.rating >= 3 ? "Medium priority - Follow up within 48 hours"
                    : "Low priority - Add to nurture sequence"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
                lead.status === "manual" ? "bg-violet-100" : "bg-emerald-100"
              )}>
                {lead.status === "manual" ? (
                  <AlertCircle className="h-4 w-4 text-violet-600" />
                ) : (
                  <Check className="h-4 w-4 text-emerald-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Status</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lead.status === "manual" ? "Requires human review before action" 
                    : lead.status === "pending" ? "Ready for automated processing"
                    : lead.status === "approved" ? "Approved and ready for follow-up"
                    : "Declined - May be reconsidered later"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 shrink-0">
                <TrendingUp className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Conversion Potential</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lead.rating >= 4 ? "High conversion likelihood - Strong interest signals" 
                    : lead.rating >= 3 ? "Moderate conversion potential - Standard follow-up"
                    : "Lower conversion probability - Consider automated nurture"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 shrink-0">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Recommended Action</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lead.rating >= 4 ? "Contact within 24 hours for best results" 
                    : lead.status === "manual" ? "Review and categorize before proceeding"
                    : lead.rating >= 3 ? "Schedule follow-up call within 48 hours"
                    : "Send welcome email sequence and periodic updates"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-200 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Phone className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Phone</p>
              <p className="font-medium text-slate-800">{lead.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-200 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-medium text-slate-800">{lead.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-200 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Location</p>
              <p className="font-medium text-slate-800">{lead.location}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <MessageSquare className="h-4 w-4" />
            Conversation Summary
          </div>
          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed">
            {lead.conversationSummary}
          </div>
        </div>

        {lead.status === "manual" && (
          <>
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <Check className="h-4 w-4" />
                  Approval Message
                </label>
          </div>
          <Textarea
            value={approveMessage}
            onChange={(e) => setApproveMessage(e.target.value)}
            className="mt-2 min-h-[120px] bg-white border-slate-200 resize-none focus:border-blue-400 focus:ring-blue-100 text-gray-950 placeholder:text-slate-500"
            placeholder="Enter approval message..."
            disabled={!isActionable}
          />
          {isActionable && (
            <Button
              onClick={() => handleSend("approve")}
              disabled={isSending !== null || !approveMessage.trim()}
              className="mt-3 w-full bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
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

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-red-600">
              <XCircle className="h-4 w-4" />
              Decline Message
            </label>
          </div>
          <Textarea
                value={declineMessage}
                onChange={(e) => setDeclineMessage(e.target.value)}
                className="mt-2 min-h-[120px] bg-white border-slate-200 resize-none focus:border-blue-400 focus:ring-blue-100 text-gray-950 placeholder:text-slate-500"
                placeholder="Enter decline message..."
                disabled={!isActionable}
              />
              {isActionable && (
            <button
              onClick={() => handleSend("decline")}
              disabled={isSending !== null || !declineMessage.trim()}
              className="mt-3 w-full px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
            </button>
          )}
        </div>
          </>
        )}

        <div className="mt-8 space-y-2 text-sm text-slate-500 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Received: {formatDate(lead.createdAt)}</span>
          {lead.updatedAt !== lead.createdAt && (
            <>
              <span className="text-slate-300">•</span>
              <span>Updated: {formatDate(lead.updatedAt)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
