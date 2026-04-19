export type LeadStatus = "pending" | "approved" | "declined" | "manual" | "active" | "completed" | "cancelled"
export type LeadSource = "whatsapp" | "email"

export interface LeadSession {
  id: string
  createdAt: string
  teamsId: string
  leadsId: string
  status: LeadStatus
  currentStep: string
  collectedData: CollectedData
  needsMoreInfo: boolean
  rating: number | null
  ratingReason: string | null
  forwardedAt: string | null
  updatedAt: string
}

export interface CollectedData {
  name?: string
  phone?: string
  email?: string
  location?: string
  workType?: string
  message?: string
  conversationSummary?: string
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
  leadCount: number
  isLoyal: boolean
  autoApproved: boolean
  lastContactedAt: string | null
  createdAt: string
  updatedAt: string
  teamId: string | undefined
  session?: LeadSession
  // Derived from session (for convenience)
  status: LeadStatus
  source: LeadSource
  rating: number
  ratingReason?: string
  workType?: string
  location?: string
  conversationSummary?: string
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

interface BaseSettings {
  notificationsEnabled?: boolean
  notifyNewLeads?: boolean
  notifyLeadApproved?: boolean
  notifyLeadDeclined?: boolean
  notifyManualReview?: boolean
  notifyDailySummary?: boolean
  notifyWeeklyReport?: boolean
  aiEnabled?: boolean
  autoApprove?: boolean
  autoDecline?: boolean
  autoManualReview?: boolean
  minRatingThreshold?: number
  autoResponseEnabled?: boolean
  sentimentAnalysis?: boolean
  priorityDetection?: boolean
  duplicateDetection?: boolean
  aiInstructions?: string
  autoApproveEnabled?: boolean
  autoApproveMinRating?: number
  autoDeclineUnrelated?: boolean
  followUpDays?: number
  followUpMessage?: string
  defaultApproveMessage?: string
  defaultDeclineMessage?: string
  defaultUnrelatedMessage?: string
  language?: "de" | "en"
}

export interface AppSettings extends BaseSettings {
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
  theme?: string
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

export type ContactPlatform = "whatsapp" | "email" | "sms" | "telegram"

export interface TeamSettings extends BaseSettings {
  teamId?: string
  autoDeleteDeclinedDays?: number
  webhookUrl?: string
}

export interface UserSettings {
  userId?: string
  theme?: string
  language?: string
  notifications?: {
    email: boolean
    push: boolean
    sms: boolean
  }
  notificationsEnabled?: boolean
  notifyNewLeads?: boolean
  notifyLeadApproved?: boolean
  notifyLeadDeclined?: boolean
  notifyManualReview?: boolean
  notifyDailySummary?: boolean
  notifyWeeklyReport?: boolean
  // Privacy
  showPhonePublic?: boolean
  showEmailPublic?: boolean
  showLocationPublic?: boolean
  autoDeleteOld?: boolean
  dataRetentionDays?: number
  analyticsEnabled?: boolean
  errorTracking?: boolean
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
  action: "approve" | "decline" | "unrelated"
  message: string
  phone: string
}
