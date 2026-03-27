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
  Sparkles,
  TrendingUp,
  DollarSign,
  Zap,
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
  const [approveMessage, setApproveMessage] = useState(lead.approveMessage || "")
  const [declineMessage, setDeclineMessage] = useState(lead.declineMessage || "")
  const [isSending, setIsSending] = useState<"approve" | "decline" | null>(null)

  const status = getLeadStatus(lead)
  const rating = getLeadRating(lead)
  const source = getLeadSource(lead)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">Lead Details</h2>
            <span className="text-xs text-slate-500 capitalize">{status}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-80px)]">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-600">
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
              <span className="text-xs text-slate-500">{sourceLabel}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 mt-1">
              <Briefcase className="h-4 w-4" />
              <span>{lead.session?.collectedData?.workType || lead.workType || "Not specified"}</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < rating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-700">{rating}/5</span>
            {lead.session?.ratingReason && (
              <span className="text-sm text-slate-500">- {lead.session.ratingReason}</span>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4" style={{ color: "#818cf8" }} />
            <span className="text-sm font-semibold" style={{ background: "linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #c084fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              AI Analysis
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
              <TrendingUp className="h-5 w-5 text-slate-500" />
              <span className="text-lg font-bold text-slate-700">{lead.session?.conversionProbability ?? 0}%</span>
              <span className="text-xs text-slate-500">Conversion</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
              <DollarSign className="h-5 w-5 text-slate-500" />
              <span className="text-lg font-bold text-slate-700">${(lead.session?.dealValue ?? 0).toLocaleString()}</span>
              <span className="text-xs text-slate-500">Deal Value</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
              <Zap className="h-5 w-5 text-slate-500" />
              <span className="text-lg font-bold text-slate-700">{lead.session?.urgency ?? "N/A"}</span>
              <span className="text-xs text-slate-500">Urgency</span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4" style={{ color: "#818cf8" }} />
            <span className="text-sm font-semibold" style={{ background: "linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #c084fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              AI Recommendation
            </span>
          </div>
          <p className="text-sm text-slate-600">{lead.session?.aiRecommendation || lead.ratingReason || "No recommendation yet"}</p>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
            <Phone className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Phone</p>
              <p className="font-medium text-slate-800">{lead.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
            <Mail className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-medium text-slate-800">{lead.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
            <MapPin className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Location</p>
              <p className="font-medium text-slate-800">{lead.session?.collectedData?.location || lead.location || "Not specified"}</p>
            </div>
          </div>
        </div>

        {lead.conversationSummary && (
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <MessageSquare className="h-4 w-4" />
              Conversation Summary
            </div>
            <div className="mt-2 rounded-lg border border-slate-200 p-4 text-sm text-slate-600 leading-relaxed">
              {lead.conversationSummary}
            </div>
          </div>
        )}

        {status === "manual" && (
          <>
            <div className="mt-6">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Check className="h-4 w-4" />
                Approval Message
              </label>
              <Textarea
                value={approveMessage}
                onChange={(e) => setApproveMessage(e.target.value)}
                className="mt-2 min-h-[120px] bg-white border-slate-200 resize-none focus:border-slate-400 text-slate-800 placeholder:text-slate-500"
                placeholder="Enter approval message..."
                disabled={!isActionable}
              />
              {isActionable && (
                <Button
                  onClick={() => handleSend("approve")}
                  disabled={isSending !== null || !approveMessage.trim()}
                  className="mt-3 w-full bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
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
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <XCircle className="h-4 w-4" />
                Decline Message
              </label>
              <Textarea
                value={declineMessage}
                onChange={(e) => setDeclineMessage(e.target.value)}
                className="mt-2 min-h-[120px] bg-white border-slate-200 resize-none focus:border-slate-400 text-slate-800 placeholder:text-slate-500"
                placeholder="Enter decline message..."
                disabled={!isActionable}
              />
              {isActionable && (
                <button
                  onClick={() => handleSend("decline")}
                  disabled={isSending !== null || !declineMessage.trim()}
                  className="mt-3 w-full px-4 py-2.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
    </div>
  )
}
