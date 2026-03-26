export type LeadStatus = "pending" | "approved" | "declined" | "manual"
export type LeadSource = "whatsapp" | "email"

export interface LeadSession {
  id: string
  createdAt: string
  teamsId: string
  leadsId: string
  status: "active" | "completed" | "cancelled"
  currentStep: string
  collectedData: CollectedData
  needsMoreInfo: boolean
  rating?: boolean
  ratingReason?: string
  forwardedAt?: string
  updatedAt: string
}

export interface CollectedData {
  name?: string
  phone?: string
  email?: string
  location?: string
  workType?: string
  message?: string
  company?: string
  budget?: string
  timeline?: string
  contactPlatform?: string
  [key: string]: string | undefined
}

export interface Lead {
  id: string
  name: string
  phone: string
  email: string
  location?: string
  workType?: string
  conversationSummary?: string
  approveMessage?: string
  declineMessage?: string
  rating?: number
  ratingReason?: string
  status: LeadStatus
  source?: LeadSource
  isLoyal?: boolean
  createdAt: string
  updatedAt: string
  teamId?: string
  leadCount?: number
  autoApproved?: boolean
  lastContactedAt?: string
  session?: LeadSession
}

export type TeamRole = "owner" | "admin" | "member"

export interface Team {
  id: string
  name: string
  ownerId: string
  inviteCode: string
  createdAt: string
  updatedAt: string
  industry?: string
  defaultLanguage?: string
  active?: boolean
  phone?: string
  email?: string
}

export interface TeamMember {
  id: string
  email: string
  name: string
  role: TeamRole
  teamId: string
  createdAt: string
}

export interface AppSettings {
  autoDeleteDeclinedDays: number
  webhookUrl: string
  autoApproveEnabled: boolean
  autoApproveMinRating: number
  autoDeclineUnrelated: boolean
  followUpDays: number
  followUpMessage: string
  defaultApproveMessage: string
  defaultDeclineMessage: string
  defaultUnrelatedMessage: string
  language: "de" | "en"
}

export interface Message {
  id: string
  createdAt: string
  teamsId: string
  leadsId: string
  leadsSessionsId?: string
  direction: "incoming" | "outgoing"
  text?: string
}

export interface LeadStats {
  total: number
  pending: number
  approved: number
  declined: number
}

// Expected JSON structure from your backend
export interface IncomingLead {
  name: string
  phone: string
  email: string
  location: string
  workType: string
  conversationSummary: string
  approveMessage: string
  declineMessage: string
  rating: number // 1-5
  ratingReason: string // e.g., "Not in our area", "Perfect fit", etc.
}

// Response sent back to chatbot when user sends a message
export interface SendMessageResponse {
  leadId: string
  action: "approve" | "decline"
  message: string
  phone: string
}
