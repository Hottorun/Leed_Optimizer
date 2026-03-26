export type LeadStatus = "pending" | "approved" | "declined" | "manual"
export type LeadSource = "whatsapp" | "email"

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
  rating: number
  ratingReason: string
  status: LeadStatus
  source: LeadSource
  isLoyal: boolean
  createdAt: string
  updatedAt: string
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
