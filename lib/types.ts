export type LeadStatus = "pending" | "approved" | "declined" | "unrelated"
export type ContactPlatform = "whatsapp" | "email"
export type ViewMode = "grid" | "list" | "squares"
export type CustomerType = "all" | "first-time" | "returning" | "loyal"
export type RatingFilter = "all" | 1 | 2 | 3 | 4 | 5
export type GroupByOption = "none" | "rating" | "status" | "platform" | "customerType" | "date"
export type TeamRole = "owner" | "admin" | "member"

export interface Team {
  id: string
  name: string
  ownerId?: string
  inviteCode?: string
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: string
  email: string
  name: string
  role: TeamRole
  teamId: string
  createdAt: string
}

export interface Lead {
  id: string
  name: string
  phone: string
  email: string
  location: string
  workType: string
  conversationSummary: string
  approveMessage: string
  declineMessage: string
  rating: number // 1-5 star rating from AI
  ratingReason: string // AI explanation for the rating
  status: LeadStatus
  contactPlatform: ContactPlatform // whatsapp or email
  leadCount: number // Number of leads from this customer (1 = first-time, 2+ = returning)
  isLoyal: boolean // True if leadCount >= 3
  createdAt: string
  updatedAt: string
  lastContactedAt?: string // For follow-up tracking
  autoApproved?: boolean // If true, was auto-approved based on rules
  originalMessage?: string // The original incoming message
  teamId?: string // Team this lead belongs to
}

export interface AppSettings {
  autoDeleteDeclinedDays: number // 0 = disabled
  webhookUrl: string
  autoApproveEnabled: boolean
  autoApproveMinRating: number // Minimum rating to auto-approve (1-5)
  autoDeclineUnrelated: boolean // Auto-mark unrelated messages
  followUpDays: number // Days to wait before follow-up on pending leads
  followUpMessage: string // Custom follow-up message template
  defaultApproveMessage: string
  defaultDeclineMessage: string
  defaultUnrelatedMessage: string
  language: "de" | "en" // User interface language
}

export interface AutoApproveRule {
  id: string
  name: string
  conditions: {
    minRating?: number
    maxRating?: number
    workTypes?: string[]
    locations?: string[]
    platforms?: ContactPlatform[]
  }
  action: "approve" | "decline" | "mark_unrelated"
  customMessage?: string
  enabled: boolean
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
  contactPlatform?: ContactPlatform // whatsapp or email, defaults to whatsapp
}

// Response sent back to chatbot when user sends a message
export interface SendMessageResponse {
  leadId: string
  action: "approve" | "decline"
  message: string
  phone: string
}
