export type LeadStatus = "active" | "pending" | "approved" | "declined" | "unrelated" | "forwarded" | "completed"
export type ContactPlatform = "whatsapp" | "email"
export type ViewMode = "grid" | "list" | "squares"
export type CustomerType = "all" | "first-time" | "returning" | "loyal"
export type RatingFilter = "all" | 1 | 2 | 3 | 4 | 5
export type GroupByOption = "none" | "rating" | "status" | "platform" | "customerType" | "date"
export type TeamRole = "owner" | "admin" | "member"
export type SessionStatus = "active" | "completed" | "forwarded"
export type FlowType = "qualification" | "support" | "contact"

export interface Team {
  id: string
  name: string
  ownerId?: string
  inviteCode?: string
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

export interface CollectedData {
  name?: string
  phone?: string
  email?: string
  location?: string
  workType?: string
  company?: string
  budget?: string
  timeline?: string
  message?: string
  [key: string]: string | undefined
}

export interface LeadSession {
  id: string
  createdAt: string
  teamsId: string
  leadsId: string
  status: SessionStatus
  currentStep: string
  collectedData: CollectedData
  needsMoreInfo: boolean
  rating?: boolean
  ratingReason?: string
  forwardedAt?: string
  updatedAt: string
}

export interface Lead {
  id: string
  name: string
  phone: string
  email: string
  leadCount: number
  isLoyal: boolean
  autoApproved: boolean
  lastContactedAt?: string
  createdAt: string
  updatedAt: string
  teamId?: string
  session?: LeadSession
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

export interface TeamConfig {
  id: string
  createdAt: string
  teamsId: string
  flowType: FlowType
  welcomeMessage?: string
  aiSystemPrompt?: string
  requiredFields: string[]
  qualificationRules: QualificationRule[]
  redirectLead: "email" | "phone" | "none"
  toneOfVoice?: string
  qualificationQuestions: QualificationQuestion[]
}

export interface QualificationRule {
  field: string
  operator: "equals" | "contains" | "greater_than" | "less_than"
  value: string
  action: "approve" | "decline" | "needs_review"
}

export interface QualificationQuestion {
  id: string
  field: string
  question: string
  required: boolean
  options?: string[]
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

export interface LeadStats {
  total: number
  pending: number
  approved: number
  declined: number
}

export interface IncomingLead {
  name: string
  phone: string
  email: string
  location: string
  workType: string
  message: string
}

export interface SendMessageResponse {
  leadId: string
  action: "approve" | "decline" | "unrelated"
  message: string
  phone: string
}
