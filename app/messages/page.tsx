"use client"

import { useState, useRef, useEffect } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { useUser } from "@/lib/use-user"
import { cn } from "@/lib/utils"
import type { Lead } from "@/lib/types"
import { getSafeString } from "@/lib/lead-utils"
import {
  Search,
  Send,
  Paperclip,
  Smile,
  MessageSquare,
  ExternalLink,
  Check,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type LocalMessage = {
  id: number
  from: "me" | "client" | "system"
  text: string
  time: string
}

type ConversationMap = Record<string, LocalMessage[]>

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FEF9C3", text: "#713F12" },
  { bg: "#FCE7F3", text: "#831843" },
  { bg: "#E0E7FF", text: "#3730A3" },
  { bg: "#DBEAFE", text: "#1E3A8A" },
  { bg: "#FEE2E2", text: "#7F1D1D" },
]

const TEMPLATES = [
  {
    label: "👋 Introduction",
    text: "Hi {name}, I'm reaching out because your profile caught our attention. We'd love to explore how we can work together. Would you be open to a brief chat?",
  },
  {
    label: "📅 Schedule a call",
    text: "Hi {name}, I'd love to set up a quick call to learn more about {company}'s goals. Are you free for 20 minutes this week?",
  },
  {
    label: "📄 Send proposal",
    text: "Hi {name}, following our conversation, I've put together a proposal tailored for {company}. I'll send it over shortly — let me know if you have any questions.",
  },
  {
    label: "🙏 Follow up",
    text: "Hi {name}, just following up on my previous message. I'd love to connect when the time is right for you.",
  },
  {
    label: "✅ Confirm meeting",
    text: "Hi {name}, just confirming our meeting — looking forward to speaking with you. Let me know if anything changes on your end.",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function getAvatarStyle(name: string): { bg: string; text: string } {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function getChannel(lead: Lead): "WhatsApp" | "Email" {
  return lead.phone ? "WhatsApp" : "Email"
}

function normalizeScore(lead: Lead): number {
  const raw = lead.session?.rating ?? lead.rating ?? 0
  if (raw <= 5) return raw * 20
  return raw
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#16A34A"
  if (score >= 60) return "#D97706"
  return "#DC2626"
}

function getCompany(lead: Lead): string {
  const cd = lead.session?.collectedData
  if (cd && !Array.isArray(cd) && cd.company) return getSafeString(cd.company)
  return ""
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function isApprovedLead(lead: Lead): boolean {
  return lead.session?.status === "approved" || lead.status === "approved"
}

function getConversationSummary(lead: Lead): string {
  const cd = lead.session?.collectedData
  if (cd && !Array.isArray(cd) && cd.conversationSummary) return cd.conversationSummary
  return lead.conversationSummary ?? ""
}

function buildInitialConversations(leads: Lead[]): ConversationMap {
  const map: ConversationMap = {}
  for (const lead of leads) {
    map[lead.id] = [
      {
        id: 1,
        from: "system",
        text: "Lead approved by AI",
        time: formatTime(new Date(lead.updatedAt || lead.createdAt)),
      },
    ]
  }
  return map
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  name,
  size = 36,
}: {
  name: string
  size?: number
}) {
  const { bg, text } = getAvatarStyle(name)
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: text,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {getInitials(name)}
    </div>
  )
}

function SystemDivider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 py-2 px-4">
      <div className="flex-1 h-px bg-border" />
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
          <Check className="h-2.5 w-2.5 text-green-600 dark:text-green-400" />
        </div>
        {text}
      </div>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

function ConversationSummaryCard({ summary }: { summary: string }) {
  if (!summary) return null
  return (
    <div className="mx-auto max-w-[75%] my-2">
      <div className="bg-background border border-border rounded-xl px-4 py-3">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
          AI Conversation Summary
        </p>
        <p className="text-sm text-foreground leading-relaxed">{summary}</p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MessagesPage() {
  const router = useRouter()
  const { user } = useUser()
  const { data: leadsData } = useSWR<Lead[]>("/api/leads", fetcher, {
    refreshInterval: 30000,
  })

  const allLeads = Array.isArray(leadsData) ? leadsData : []
  const approvedLeads = allLeads.filter(isApprovedLead)

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState<ConversationMap>({})
  const [composerText, setComposerText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialise conversations once approved leads are loaded
  useEffect(() => {
    if (approvedLeads.length > 0 && Object.keys(conversations).length === 0) {
      setConversations(buildInitialConversations(approvedLeads))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvedLeads.length])

  // Auto-scroll to bottom when messages change or lead changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedLeadId, conversations])

  const selectedLead = selectedLeadId
    ? approvedLeads.find((l) => l.id === selectedLeadId) ?? null
    : null

  const filteredLeads = approvedLeads.filter((lead) => {
    const q = searchQuery.toLowerCase()
    if (!q) return true
    return (
      lead.name.toLowerCase().includes(q) ||
      getCompany(lead).toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q)
    )
  })

  const messages: LocalMessage[] = selectedLeadId
    ? (conversations[selectedLeadId] ?? [])
    : []

  function sendMessage(text: string) {
    if (!selectedLeadId || !text.trim()) return
    const newMsg: LocalMessage = {
      id: Date.now(),
      from: "me",
      text: text.trim(),
      time: formatTime(new Date()),
    }
    setConversations((prev) => ({
      ...prev,
      [selectedLeadId]: [...(prev[selectedLeadId] ?? []), newMsg],
    }))
    setComposerText("")
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(composerText)
    }
  }

  function applyTemplate(template: (typeof TEMPLATES)[number]) {
    if (!selectedLead) return
    const company = getCompany(selectedLead) || selectedLead.name
    const filled = template.text
      .replace(/{name}/g, selectedLead.name)
      .replace(/{company}/g, company)
    sendMessage(filled)
  }

  function handleViewLead(lead: Lead) {
    router.push(`/leads?id=${lead.id}`)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader
        onRefresh={() => {}}
        isRefreshing={false}
        user={user ?? undefined}
        leads={allLeads}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="w-[300px] shrink-0 bg-background border-r border-border flex flex-col overflow-hidden">
          {/* Sidebar header */}
          <div className="px-4 pt-4 pb-3 border-b border-border shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Approved Clients</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                {approvedLeads.length}
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Client list */}
          <div className="flex-1 overflow-y-auto">
            {approvedLeads.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">No approved leads yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Once the AI approves leads, they'll appear here.
                </p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-muted-foreground">No results for "{searchQuery}"</p>
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const isActive = lead.id === selectedLeadId
                const score = normalizeScore(lead)
                const scoreColor = getScoreColor(score)
                const company = getCompany(lead)
                const hasUnread = false // local state — extend as needed

                return (
                  <button
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border transition-colors relative",
                      isActive
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-foreground rounded-r" />
                    )}

                    <Avatar name={lead.name} size={36} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-medium truncate">{lead.name}</span>
                        {/* Score pill */}
                        <span
                          className="text-[10px] font-semibold shrink-0 px-1.5 py-0.5 rounded-full"
                          style={{ color: scoreColor, backgroundColor: `${scoreColor}18` }}
                        >
                          {score}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {company || lead.email || "—"}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {hasUnread && (
                      <div className="h-2 w-2 rounded-full bg-foreground shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* ── Chat area ───────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
          {selectedLead === null ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted border border-border">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">No conversation selected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a client from the sidebar to start messaging
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <ChatHeader
                lead={selectedLead}
                onViewLead={() => handleViewLead(selectedLead)}
              />

              {/* Messages thread */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                {messages.map((msg) => {
                  if (msg.from === "system") {
                    const summary = getConversationSummary(selectedLead)
                    return (
                      <div key={msg.id}>
                        <SystemDivider text={msg.text} />
                        <ConversationSummaryCard summary={summary} />
                      </div>
                    )
                  }

                  const isSent = msg.from === "me"
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-end gap-2 max-w-[75%]",
                        isSent ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      {!isSent && (
                        <div className="mb-1 shrink-0">
                          <Avatar name={selectedLead.name} size={24} />
                        </div>
                      )}
                      <div>
                        <div
                          className={cn(
                            isSent
                              ? "bg-foreground text-background rounded-2xl rounded-br-sm px-3.5 py-2.5"
                              : "bg-background border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5"
                          )}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                        </div>
                        <p
                          className={cn(
                            "text-[10px] text-muted-foreground mt-1",
                            isSent ? "text-right" : "text-left"
                          )}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Template chips */}
              <div className="px-4 py-2 border-t border-border shrink-0">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.label}
                      onClick={() => applyTemplate(tpl)}
                      className="border border-border rounded-full px-3 py-1 text-xs font-semibold hover:border-foreground hover:bg-muted transition-colors whitespace-nowrap shrink-0"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Composer */}
              <div className="px-4 pb-4 pt-2 shrink-0">
                <div className="bg-background border-2 border-border rounded-2xl focus-within:border-foreground transition-colors">
                  <textarea
                    ref={textareaRef}
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${selectedLead.name}...`}
                    rows={3}
                    className="w-full px-4 pt-3 pb-1 text-sm bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground"
                  />
                  <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                        <Smile className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-muted-foreground hidden sm:block">
                        ↵ Enter to send
                      </span>
                      <button
                        onClick={() => sendMessage(composerText)}
                        disabled={!composerText.trim()}
                        className="bg-foreground text-background rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-opacity"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Chat Header ─────────────────────────────────────────────────────────────

function ChatHeader({
  lead,
  onViewLead,
}: {
  lead: Lead
  onViewLead: () => void
}) {
  const channel = getChannel(lead)
  const score = normalizeScore(lead)
  const scoreColor = getScoreColor(score)
  const company = getCompany(lead)

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 bg-background border-b border-border shrink-0">
      <Avatar name={lead.name} size={40} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">{lead.name}</span>
          {/* Channel badge */}
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
              channel === "WhatsApp"
                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
            )}
          >
            {channel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {[company, lead.email].filter(Boolean).join(" · ")}
        </p>
      </div>

      {/* AI score pill */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted border border-border rounded-lg text-xs font-semibold shrink-0">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
          style={{ backgroundColor: scoreColor }}
        >
          AI
        </div>
        <span style={{ color: scoreColor }}>{score}%</span>
      </div>

      {/* View Lead button */}
      <button
        onClick={onViewLead}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted transition-colors shrink-0"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        View Lead
      </button>
    </div>
  )
}
