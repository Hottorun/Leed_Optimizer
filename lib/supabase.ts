import { createClient, SupabaseClient } from "@supabase/supabase-js"
import type { Lead } from "./types"
import { mockLeads } from "./mock-data"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create client only if configured
let supabase: SupabaseClient | null = null
if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

// In-memory store for mock mode
let inMemoryLeads = [...mockLeads]

// Database functions with fallback to mock data
export async function getLeads(): Promise<Lead[]> {
  if (!supabase) {
    // Return mock data sorted by createdAt
    return inMemoryLeads.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching leads:", error)
    return []
  }

  return data.map(mapDbLeadToLead)
}

export async function getLeadById(id: string): Promise<Lead | null> {
  if (!supabase) {
    return inMemoryLeads.find((lead) => lead.id === id) || null
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching lead:", error)
    return null
  }

  return mapDbLeadToLead(data)
}

export async function addLead(lead: Omit<Lead, "id" | "status" | "createdAt" | "updatedAt">): Promise<Lead | null> {
  if (!supabase) {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      ...lead,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    inMemoryLeads.unshift(newLead)
    return newLead
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      location: lead.location,
      work_type: lead.workType,
      conversation_summary: lead.conversationSummary,
      approve_message: lead.approveMessage,
      decline_message: lead.declineMessage,
      rating: lead.rating,
      rating_reason: lead.ratingReason,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding lead:", error)
    return null
  }

  return mapDbLeadToLead(data)
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  if (!supabase) {
    const index = inMemoryLeads.findIndex((lead) => lead.id === id)
    if (index === -1) return null
    
    inMemoryLeads[index] = {
      ...inMemoryLeads[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return inMemoryLeads[index]
  }

  const dbUpdates: Record<string, unknown> = {}
  
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone
  if (updates.email !== undefined) dbUpdates.email = updates.email
  if (updates.location !== undefined) dbUpdates.location = updates.location
  if (updates.workType !== undefined) dbUpdates.work_type = updates.workType
  if (updates.conversationSummary !== undefined) dbUpdates.conversation_summary = updates.conversationSummary
  if (updates.approveMessage !== undefined) dbUpdates.approve_message = updates.approveMessage
  if (updates.declineMessage !== undefined) dbUpdates.decline_message = updates.declineMessage
  if (updates.rating !== undefined) dbUpdates.rating = updates.rating
  if (updates.ratingReason !== undefined) dbUpdates.rating_reason = updates.ratingReason
  if (updates.status !== undefined) dbUpdates.status = updates.status

  const { data, error } = await supabase
    .from("leads")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating lead:", error)
    return null
  }

  return mapDbLeadToLead(data)
}

export async function deleteLead(id: string): Promise<boolean> {
  if (!supabase) {
    const index = inMemoryLeads.findIndex((lead) => lead.id === id)
    if (index === -1) return false
    inMemoryLeads.splice(index, 1)
    return true
  }

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting lead:", error)
    return false
  }

  return true
}

// Map database row to Lead type
function mapDbLeadToLead(row: {
  id: string
  name: string
  phone: string
  email: string
  location: string
  work_type: string
  conversation_summary: string
  approve_message: string
  decline_message: string
  rating: number
  rating_reason: string
  status: string
  created_at: string
  updated_at: string
}): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    location: row.location,
    workType: row.work_type,
    conversationSummary: row.conversation_summary,
    approveMessage: row.approve_message,
    declineMessage: row.decline_message,
    rating: row.rating,
    ratingReason: row.rating_reason,
    status: row.status as Lead["status"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
