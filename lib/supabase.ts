import { createClient, SupabaseClient } from "@supabase/supabase-js"
import type { Lead, AppSettings, TeamSettings, UserSettings, LeadStatus, Team, TeamMember, TeamRole, LeadSession, Message, CollectedData } from "./types"
import bcrypt from "bcryptjs"

let supabase: SupabaseClient | null = null

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return null
  }
  
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  
  return supabase
}

let inMemoryLeads: Lead[] = []

let inMemorySettings: AppSettings = {
  autoDeleteDeclinedDays: 0,
  webhookUrl: process.env.N8N_WEBHOOK_URL || process.env.CHATBOT_WEBHOOK_URL || "",
  autoApproveEnabled: false,
  autoApproveMinRating: 4,
  autoDeclineUnrelated: false,
  followUpDays: 3,
  followUpMessage: "Hi {name}, just checking in on your inquiry. Are you still interested?",
  defaultApproveMessage: "Thank you for your interest! We'd love to work with you.",
  defaultDeclineMessage: "Thank you for reaching out. Unfortunately, we're not able to help at this time.",
  defaultUnrelatedMessage: "This message doesn't seem to be related to our services.",
  theme: "light",
  language: "de",
  notificationsEnabled: true,
  notifyNewLeads: true,
  notifyLeadApproved: true,
  notifyLeadDeclined: true,
  notifyManualReview: true,
  notifyDailySummary: false,
  notifyWeeklyReport: true,
  aiEnabled: true,
  autoApprove: false,
  autoDecline: false,
  autoManualReview: true,
  minRatingThreshold: 3,
  autoResponseEnabled: false,
  sentimentAnalysis: true,
  priorityDetection: true,
  duplicateDetection: true,
  aiInstructions: "",
}

export async function getLeads(teamId?: string): Promise<Lead[]> {
  const client = getSupabase()
  
  if (!client) {
    let leads = inMemoryLeads
    if (teamId) {
      leads = leads.filter(lead => lead.teamId === teamId)
    }
    return leads.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  const leadsQuery = client
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })

  if (teamId) {
    leadsQuery.eq("teams_id", teamId)
  }

  const { data: leadsData, error: leadsError } = await leadsQuery

  if (leadsError) {
    console.error("Error fetching leads:", leadsError)
    return []
  }

  if (!leadsData || leadsData.length === 0) {
    return []
  }

  const leadIds = leadsData.map(l => l.id)

  const { data: sessionsData, error: sessionsError } = await client
    .from("leads_sessions")
    .select("*")
    .in("leads_id", leadIds)
    .order("created_at", { ascending: false })

  if (sessionsError) {
    console.error("Error fetching sessions:", sessionsError)
  }

  const sessionsByLeadId = new Map<string, LeadSession>()
  if (sessionsData) {
    for (const session of sessionsData) {
      if (!sessionsByLeadId.has(session.leads_id)) {
        sessionsByLeadId.set(session.leads_id, mapDbSessionToSession(session))
      }
    }
  }

  return leadsData.map(lead => mapDbLeadToLead(lead, sessionsByLeadId.get(lead.id)))
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const client = getSupabase()
  
  if (!client) {
    return inMemoryLeads.find((lead) => lead.id === id) || null
  }

  const { data: leadData, error: leadError } = await client
    .from("leads")
    .select("*")
    .eq("id", id)
    .single()

  if (leadError) {
    console.error("Error fetching lead:", leadError)
    return null
  }

  const { data: sessionData } = await client
    .from("leads_sessions")
    .select("*")
    .eq("leads_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  const session = sessionData ? mapDbSessionToSession(sessionData) : undefined
  return mapDbLeadToLead(leadData, session)
}

export async function addLead(lead: {
  name: string
  phone: string
  email: string
  collectedData?: CollectedData
  teamId?: string
}): Promise<Lead | null> {
  const client = getSupabase()
  
  let leadCount = 1
  let isLoyal = false

  if (client && lead.teamId) {
    let query = client.from("leads").select("lead_count").eq("teams_id", lead.teamId)
    
    if (lead.phone && lead.email) {
      query = query.or(`phone.eq.${lead.phone},email.eq.${lead.email}`)
    } else if (lead.phone) {
      query = query.eq("phone", lead.phone)
    } else if (lead.email) {
      query = query.eq("email", lead.email)
    }

    const { data: existingLeads } = await query
    
    if (existingLeads && existingLeads.length > 0) {
      const maxCount = Math.max(...existingLeads.map(l => l.lead_count || 1))
      leadCount = maxCount + 1
      isLoyal = leadCount >= 3
    }
  } else {
    const existingLeads = await getLeads(lead.teamId)
    const matches = existingLeads.filter(l => 
      (lead.phone && l.phone === lead.phone) || 
      (lead.email && l.email === lead.email)
    )
    if (matches.length > 0) {
      const maxCount = Math.max(...matches.map(l => l.leadCount || 1))
      leadCount = maxCount + 1
      isLoyal = leadCount >= 3
    }
  }

  const sourceFromCollected = lead.collectedData?.source as "whatsapp" | "email" | undefined
  const derivedSource: "whatsapp" | "email" = sourceFromCollected || (lead.phone ? "whatsapp" : "email")

  if (!client) {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      leadCount,
      isLoyal,
      autoApproved: false,
      lastContactedAt: null,
      teamId: lead.teamId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending",
      source: derivedSource,
      rating: 0,
    }
    inMemoryLeads.unshift(newLead)
    return newLead
  }

  const { data: leadData, error: leadError } = await client
    .from("leads")
    .insert({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      lead_count: leadCount,
      is_loyal: isLoyal,
      auto_approved: false,
      teams_id: lead.teamId,
    })
    .select()
    .single()

  if (leadError) {
    console.error("Error adding lead:", leadError)
    return null
  }

  if (!leadData) return null

  const { data: sessionData, error: sessionError } = await client
    .from("leads_sessions")
    .insert({
      teams_id: lead.teamId,
      leads_id: leadData.id,
      status: "active",
      current_step: "start",
      collected_data: lead.collectedData || {
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
      },
      needs_more_info: false,
    })
    .select()
    .single()

  if (sessionError) {
    console.error("Error creating session:", sessionError)
  }

  const session = sessionData ? mapDbSessionToSession(sessionData) : undefined
  return mapDbLeadToLead(leadData, session)
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  const client = getSupabase()
  
  if (!client) {
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
  if (updates.leadCount !== undefined) dbUpdates.lead_count = updates.leadCount
  if (updates.isLoyal !== undefined) dbUpdates.is_loyal = updates.isLoyal
  if (updates.autoApproved !== undefined) dbUpdates.auto_approved = updates.autoApproved
  if (updates.lastContactedAt !== undefined) dbUpdates.last_contacted_at = updates.lastContactedAt

  const needsSessionUpdate = updates.status !== undefined

  if (needsSessionUpdate) {
    const { data: sessionData } = await client
      .from("leads_sessions")
      .select("id")
      .eq("leads_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
    
    const now = new Date().toISOString()
    
    if (sessionData?.id) {
      await client
        .from("leads_sessions")
        .update({ 
          status: updates.status,
          updated_at: now
        })
        .eq("id", sessionData.id)
    }
    
    await client
      .from("leads")
      .update({ updated_at: now })
      .eq("id", id)
  }

  if (Object.keys(dbUpdates).length === 0) {
    return getLeadById(id)
  }

  const { data, error } = await client
    .from("leads")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating lead:", error)
    return null
  }

  return getLeadById(id)
}

export async function updateLeadSession(
  sessionId: string,
  updates: Partial<{
    status: string
    currentStep: string
    collectedData: CollectedData
    needsMoreInfo: boolean
    rating: number | boolean
    ratingReason: string
    forwardedAt: string
  }>
): Promise<LeadSession | null> {
  const client = getSupabase()
  
  if (!client) {
    return null
  }

  const dbUpdates: Record<string, unknown> = {}
  
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.currentStep !== undefined) dbUpdates.current_step = updates.currentStep
  if (updates.collectedData !== undefined) dbUpdates.collected_data = updates.collectedData
  if (updates.needsMoreInfo !== undefined) dbUpdates.needs_more_info = updates.needsMoreInfo
  if (updates.rating !== undefined) dbUpdates.rating = updates.rating
  if (updates.ratingReason !== undefined) dbUpdates.rating_reason = updates.ratingReason
  if (updates.forwardedAt !== undefined) dbUpdates.forwarded_at = updates.forwardedAt

  if (Object.keys(dbUpdates).length === 0) {
    return null
  }

  const { data, error } = await client
    .from("leads_sessions")
    .update(dbUpdates)
    .eq("id", sessionId)
    .select()
    .single()

  if (error) {
    console.error("Error updating lead session:", error)
    return null
  }

  return mapDbSessionToSession(data)
}

export async function deleteLead(id: string): Promise<boolean> {
  const client = getSupabase()
  
  if (!client) {
    const index = inMemoryLeads.findIndex((lead) => lead.id === id)
    if (index === -1) return false
    inMemoryLeads.splice(index, 1)
    return true
  }

  const { error } = await client
    .from("leads")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting lead:", error)
    return false
  }

  return true
}

export async function deleteAllLeads(teamId: string): Promise<boolean> {
  const client = getSupabase()

  if (!client) {
    inMemoryLeads = inMemoryLeads.filter((l) => l.teamId !== teamId)
    return true
  }

  const { error } = await client
    .from("leads")
    .delete()
    .eq("team_id", teamId)

  if (error) {
    console.error("Error deleting all leads:", error)
    return false
  }

  return true
}

export async function deleteDeclinedLeadsOlderThan(teamId: string, days: number): Promise<number> {
  const client = getSupabase()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  if (!client) {
    const initialLength = inMemoryLeads.length
    inMemoryLeads = inMemoryLeads.filter(
      (lead) => {
        if (lead.teamId !== teamId) return true
        const session = lead.session
        return !(session?.status === "completed" && new Date(lead.updatedAt) < cutoffDate)
      }
    )
    return initialLength - inMemoryLeads.length
  }

  const { data: sessions, error } = await client
    .from("leads_sessions")
    .select("leads_id")
    .eq("teams_id", teamId)
    .eq("status", "completed")
    .lt("updated_at", cutoffDate.toISOString())

  if (error || !sessions) {
    console.error("Error finding declined leads:", error)
    return 0
  }

  if (sessions.length === 0) return 0

  const leadIds = sessions.map(s => s.leads_id)

  const { data, error: deleteError } = await client
    .from("leads")
    .delete()
    .in("id", leadIds)
    .select()

  if (deleteError) {
    console.error("Error deleting old declined leads:", deleteError)
    return 0
  }

  return data?.length || 0
}

export async function getSettings(teamId?: string): Promise<AppSettings> {
  const client = getSupabase()
  
  if (!client || !teamId) {
    return inMemorySettings
  }

  const { data, error } = await client
    .from("settings")
    .select("*")
    .eq("team_id", teamId)
    .single()

  if (error || !data) {
    return inMemorySettings
  }

  return {
    autoDeleteDeclinedDays: data.auto_delete_declined_days || 0,
    webhookUrl: data.webhook_url || "",
    autoApproveEnabled: data.auto_approve_enabled || false,
    autoApproveMinRating: data.auto_approve_min_rating || 4,
    autoDeclineUnrelated: data.auto_decline_unrelated || false,
    followUpDays: data.follow_up_days || 3,
    followUpMessage: data.follow_up_message || "Hi {name}, just checking in on your inquiry. Are you still interested?",
    defaultApproveMessage: data.default_approve_message || "Thank you for your interest! We'd love to work with you.",
    defaultDeclineMessage: data.default_decline_message || "Thank you for reaching out. Unfortunately, we're not able to help at this time.",
    defaultUnrelatedMessage: data.default_unrelated_message || "This message doesn't seem to be related to our services.",
    theme: (data.theme as "light" | "dark") || "light",
    language: (data.language as "de" | "en") || "de",
    notificationsEnabled: data.notifications_enabled ?? true,
    notifyNewLeads: data.notify_new_leads ?? true,
    notifyLeadApproved: data.notify_lead_approved ?? true,
    notifyLeadDeclined: data.notify_lead_declined ?? true,
    notifyManualReview: data.notify_manual_review ?? true,
    notifyDailySummary: data.notify_daily_summary ?? false,
    notifyWeeklyReport: data.notify_weekly_report ?? true,
    aiEnabled: data.ai_enabled ?? true,
    autoApprove: data.auto_approve ?? false,
    autoDecline: data.auto_decline ?? false,
    autoManualReview: data.auto_manual_review ?? true,
    minRatingThreshold: data.min_rating_threshold ?? 3,
    autoResponseEnabled: data.auto_response_enabled ?? false,
    sentimentAnalysis: data.sentiment_analysis ?? true,
    priorityDetection: data.priority_detection ?? true,
    duplicateDetection: data.duplicate_detection ?? true,
    aiInstructions: data.ai_instructions || "",
  }
}

export async function updateSettings(teamId: string, settings: Partial<AppSettings>): Promise<AppSettings> {
  const client = getSupabase()
  
  if (!client) {
    inMemorySettings = { ...inMemorySettings, ...settings }
    return inMemorySettings
  }

  const { data, error } = await client
    .from("settings")
    .upsert({
      team_id: teamId,
      auto_delete_declined_days: settings.autoDeleteDeclinedDays,
      webhook_url: settings.webhookUrl,
      auto_approve_enabled: settings.autoApproveEnabled,
      auto_approve_min_rating: settings.autoApproveMinRating,
      auto_decline_unrelated: settings.autoDeclineUnrelated,
      follow_up_days: settings.followUpDays,
      follow_up_message: settings.followUpMessage,
      default_approve_message: settings.defaultApproveMessage,
      default_decline_message: settings.defaultDeclineMessage,
      default_unrelated_message: settings.defaultUnrelatedMessage,
      language: settings.language,
      notifications_enabled: settings.notificationsEnabled,
      notify_new_leads: settings.notifyNewLeads,
      notify_lead_approved: settings.notifyLeadApproved,
      notify_lead_declined: settings.notifyLeadDeclined,
      notify_manual_review: settings.notifyManualReview,
      notify_daily_summary: settings.notifyDailySummary,
      notify_weekly_report: settings.notifyWeeklyReport,
      ai_enabled: settings.aiEnabled,
      auto_approve: settings.autoApprove,
      auto_decline: settings.autoDecline,
      auto_manual_review: settings.autoManualReview,
      min_rating_threshold: settings.minRatingThreshold,
      auto_response_enabled: settings.autoResponseEnabled,
      sentiment_analysis: settings.sentimentAnalysis,
      priority_detection: settings.priorityDetection,
      duplicate_detection: settings.duplicateDetection,
      ai_instructions: settings.aiInstructions,
    })
    .select()
    .single()

  if (error) {
    console.error("Error updating settings:", error)
    return inMemorySettings
  }

  return {
    autoDeleteDeclinedDays: data.auto_delete_declined_days || 0,
    webhookUrl: data.webhook_url || "",
    autoApproveEnabled: data.auto_approve_enabled || false,
    autoApproveMinRating: data.auto_approve_min_rating || 4,
    autoDeclineUnrelated: data.auto_decline_unrelated || false,
    followUpDays: data.follow_up_days || 3,
    followUpMessage: data.follow_up_message || "Hi {name}, just checking in on your inquiry. Are you still interested?",
    defaultApproveMessage: data.default_approve_message || "Thank you for your interest! We'd love to work with you.",
    defaultDeclineMessage: data.default_decline_message || "Thank you for reaching out. Unfortunately, we're not able to help at this time.",
    defaultUnrelatedMessage: data.default_unrelated_message || "This message doesn't seem to be related to our services.",
    theme: (data.theme as "light" | "dark") || "light",
    language: (data.language as "de" | "en") || "de",
    notificationsEnabled: data.notifications_enabled ?? true,
    notifyNewLeads: data.notify_new_leads ?? true,
    notifyLeadApproved: data.notify_lead_approved ?? true,
    notifyLeadDeclined: data.notify_lead_declined ?? true,
    notifyManualReview: data.notify_manual_review ?? true,
    notifyDailySummary: data.notify_daily_summary ?? false,
    notifyWeeklyReport: data.notify_weekly_report ?? true,
    aiEnabled: data.ai_enabled ?? true,
    autoApprove: data.auto_approve ?? false,
    autoDecline: data.auto_decline ?? false,
    autoManualReview: data.auto_manual_review ?? true,
    minRatingThreshold: data.min_rating_threshold ?? 3,
    autoResponseEnabled: data.auto_response_enabled ?? false,
    sentimentAnalysis: data.sentiment_analysis ?? true,
    priorityDetection: data.priority_detection ?? true,
    duplicateDetection: data.duplicate_detection ?? true,
    aiInstructions: data.ai_instructions || "",
  }
}

let inMemoryUserSettings: UserSettings = {
  theme: "light",
  language: "de",
  notificationsEnabled: true,
  notifyNewLeads: true,
  notifyLeadApproved: true,
  notifyLeadDeclined: true,
  notifyManualReview: true,
  notifyDailySummary: false,
  notifyWeeklyReport: true,
}

export async function getUserSettings(userId?: string): Promise<UserSettings> {
  const client = getSupabase()
  
  if (!client || !userId) {
    return inMemoryUserSettings
  }

  const { data, error } = await client
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error || !data) {
    return inMemoryUserSettings
  }

  return {
    theme: (data.theme as "light" | "dark") || "light",
    language: (data.language as "de" | "en") || "de",
    notificationsEnabled: data.notifications_enabled ?? true,
    notifyNewLeads: data.notify_new_leads ?? true,
    notifyLeadApproved: data.notify_lead_approved ?? true,
    notifyLeadDeclined: data.notify_lead_declined ?? true,
    notifyManualReview: data.notify_manual_review ?? true,
    notifyDailySummary: data.notify_daily_summary ?? false,
    notifyWeeklyReport: data.notify_weekly_report ?? true,
  }
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
  const client = getSupabase()
  
  if (!client) {
    inMemoryUserSettings = { ...inMemoryUserSettings, ...settings }
    return inMemoryUserSettings
  }

  const { data, error } = await client
    .from("user_settings")
    .upsert({
      user_id: userId,
      theme: settings.theme,
      language: settings.language,
      notifications_enabled: settings.notificationsEnabled,
      notify_new_leads: settings.notifyNewLeads,
      notify_lead_approved: settings.notifyLeadApproved,
      notify_lead_declined: settings.notifyLeadDeclined,
      notify_manual_review: settings.notifyManualReview,
      notify_daily_summary: settings.notifyDailySummary,
      notify_weekly_report: settings.notifyWeeklyReport,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
      ignoreDuplicates: false,
    })
    .select()
    .single()

  if (error) {
    console.error("Error updating user settings:", error)
    return inMemoryUserSettings
  }

  return {
    theme: (data.theme as "light" | "dark") || "light",
    language: (data.language as "de" | "en") || "de",
    notificationsEnabled: data.notifications_enabled ?? true,
    notifyNewLeads: data.notify_new_leads ?? true,
    notifyLeadApproved: data.notify_lead_approved ?? true,
    notifyLeadDeclined: data.notify_lead_declined ?? true,
    notifyManualReview: data.notify_manual_review ?? true,
    notifyDailySummary: data.notify_daily_summary ?? false,
    notifyWeeklyReport: data.notify_weekly_report ?? true,
  }
}

function getCollectedDataFirst(collectedData: CollectedData | CollectedData[] | null | undefined): CollectedData {
  if (!collectedData) return {}
  if (Array.isArray(collectedData)) return collectedData[0] || {}
  return collectedData
}

function mapDbLeadToLead(
  row: {
    id: string
    name: string
    phone: string
    email: string
    lead_count?: number | null
    is_loyal?: boolean | null
    auto_approved?: boolean | null
    last_contacted_at?: string | null
    created_at: string
    updated_at: string
    teams_id?: string | null
  },
  session?: LeadSession
): Lead {
  const collected = getCollectedDataFirst(session?.collectedData)
  const sourceFromSession = collected.source as "whatsapp" | "email" | undefined
  const derivedSource: "whatsapp" | "email" = sourceFromSession || (row.phone ? "whatsapp" : "email")
  return {
    id: row.id,
    name: row.name || "",
    phone: row.phone || "",
    email: row.email || "",
    leadCount: row.lead_count ?? 1,
    isLoyal: row.is_loyal ?? false,
    autoApproved: row.auto_approved ?? false,
    lastContactedAt: row.last_contacted_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    teamId: row.teams_id ?? undefined,
    session,
    status: session?.status || "pending",
    source: derivedSource,
    rating: session?.rating ?? 0,
    ratingReason: session?.ratingReason ?? undefined,
    workType: collected.workType,
    location: collected.location,
    conversationSummary: collected.conversationSummary,
  }
}

function mapDbSessionToSession(row: {
  id: string
  created_at: string
  teams_id: string
  leads_id: string
  status: string
  current_step: string
  collected_data: CollectedData
  needs_more_info: boolean
  rating?: number
  rating_reason?: string
  forwarded_at?: string
  updated_at: string
}): LeadSession {
  return {
    id: row.id,
    createdAt: row.created_at,
    teamsId: row.teams_id,
    leadsId: row.leads_id,
    status: row.status as LeadSession["status"],
    currentStep: row.current_step,
    collectedData: getCollectedDataFirst(row.collected_data),
    needsMoreInfo: row.needs_more_info ?? true,
    rating: row.rating ?? null,
    ratingReason: row.rating_reason ?? null,
    forwardedAt: row.forwarded_at ?? null,
    updatedAt: row.updated_at,
  }
}

function mapDbMessageToMessage(row: {
  id: string
  created_at: string
  teams_id: string
  leads_id: string
  leads_sessions_id?: string
  direction: string
  text?: string
}): Message {
  return {
    id: row.id,
    createdAt: row.created_at,
    teamsId: row.teams_id,
    leadsId: row.leads_id,
    leadsSessionsId: row.leads_sessions_id,
    direction: row.direction as Message["direction"],
    text: row.text,
  }
}

export async function getTeamById(teamId: string): Promise<Team | null> {
  const client = getSupabase()
  
  if (!client) {
    return null
  }

  const { data, error } = await client
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    name: data.name,
    ownerId: data.owner_id,
    inviteCode: data.invite_code,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    industry: data.industry,
    defaultLanguage: data.default_language,
    active: data.active,
    phone: data.phone,
    email: data.email,
  }
}

export async function getTeamByUserId(userId: string): Promise<Team | null> {
  const client = getSupabase()
  
  if (!client) {
    return null
  }

  const { data: userData, error: userError } = await client
    .from("users")
    .select("team_id")
    .eq("id", userId)
    .single()

  if (userError || !userData?.team_id) {
    return null
  }

  return getTeamById(userData.team_id)
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segments = 4
  const segmentLength = 4
  const codeParts: string[] = []
  
  for (let i = 0; i < segments; i++) {
    let segment = ''
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    codeParts.push(segment)
  }
  
  return codeParts.join('-')
}

export async function createTeam(name: string, ownerId: string): Promise<Team | null> {
  const client = getSupabase()
  
  if (!client) {
    return null
  }

  const inviteCode = generateInviteCode()

  const { data: teamData, error: teamError } = await client
    .from("teams")
    .insert({ name, owner_id: ownerId, invite_code: inviteCode })
    .select()
    .single()

  if (teamError || !teamData) {
    console.error("Error creating team:", teamError)
    return null
  }

  await client
    .from("users")
    .update({ team_id: teamData.id, team_role: "owner" })
    .eq("id", ownerId)

  await client
    .from("settings")
    .insert({
      team_id: teamData.id,
      webhook_url: "",
      auto_delete_declined_days: 0,
      auto_approve_enabled: false,
      auto_approve_min_rating: 4,
      auto_decline_unrelated: false,
      follow_up_days: 3,
      follow_up_message: "Hi {name}, just checking in on your inquiry. Are you still interested?",
      default_approve_message: "Thank you for your interest! We'd love to work with you.",
      default_decline_message: "Thank you for reaching out. Unfortunately, we're not able to help at this time.",
      default_unrelated_message: "This message doesn't seem to be related to our services.",
    })

  return {
    id: teamData.id,
    name: teamData.name,
    ownerId: teamData.owner_id,
    inviteCode: teamData.invite_code,
    createdAt: teamData.created_at,
    updatedAt: teamData.updated_at,
  }
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const client = getSupabase()
  
  if (!client) {
    return []
  }

  const { data, error } = await client
    .from("users")
    .select("id, email, name, team_role, team_id, created_at")
    .eq("team_id", teamId)

  if (error || !data) {
    return []
  }

  return data.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.team_role as TeamRole,
    teamId: user.team_id,
    createdAt: user.created_at,
  }))
}

export async function updateTeamInviteCode(teamId: string): Promise<string | null> {
  const client = getSupabase()
  
  if (!client) {
    return null
  }

  const newCode = generateInviteCode()

  const { data, error } = await client
    .from("teams")
    .update({ invite_code: newCode })
    .eq("id", teamId)
    .select("invite_code")
    .single()

  if (error || !data) {
    console.error("Error updating team invite code:", error)
    return null
  }

  return data.invite_code
}

export async function addTeamMember(
  teamId: string,
  email: string,
  name: string,
  password: string,
  role: TeamRole = "member"
): Promise<TeamMember | null> {
  const client = getSupabase()
  
  if (!client) {
    return null
  }

  const hashedPassword = await hashPassword(password)

  const { data: userData, error: userError } = await client
    .from("users")
    .insert({
      email,
      name,
      password: hashedPassword,
      role: "user",
      team_id: teamId,
      team_role: role,
    })
    .select()
    .single()

  if (userError || !userData) {
    console.error("Error adding team member:", userError)
    return null
  }

  return {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    role: userData.team_role as TeamRole,
    teamId: userData.team_id,
    createdAt: userData.created_at,
  }
}

export async function updateTeamMemberRole(
  memberId: string,
  newRole: TeamRole
): Promise<boolean> {
  const client = getSupabase()
  
  if (!client) {
    return false
  }

  const { error } = await client
    .from("users")
    .update({ team_role: newRole })
    .eq("id", memberId)

  if (error) {
    console.error("Error updating team member role:", error)
    return false
  }

  return true
}

export async function removeTeamMember(memberId: string): Promise<boolean> {
  const client = getSupabase()
  
  if (!client) {
    return false
  }

  const { error } = await client
    .from("users")
    .update({ team_id: null, team_role: null })
    .eq("id", memberId)

  if (error) {
    console.error("Error removing team member:", error)
    return false
  }

  return true
}

export async function transferTeamOwnership(
  teamId: string,
  newOwnerId: string
): Promise<boolean> {
  const client = getSupabase()
  
  if (!client) {
    return false
  }

  const { error: newOwnerError } = await client
    .from("users")
    .update({ team_role: "owner" })
    .eq("id", newOwnerId)

  if (newOwnerError) {
    console.error("Error transferring ownership:", newOwnerError)
    return false
  }

  const { data: currentOwner } = await client
    .from("teams")
    .select("owner_id")
    .eq("id", teamId)
    .single()

  if (currentOwner?.owner_id && currentOwner.owner_id !== newOwnerId) {
    await client
      .from("users")
      .update({ team_role: "admin" })
      .eq("id", currentOwner.owner_id)
  }

  await client
    .from("teams")
    .update({ owner_id: newOwnerId })
    .eq("id", teamId)

  return true
}

export async function updateTeam(teamId: string, name: string): Promise<boolean> {
  const client = getSupabase()
  
  if (!client) {
    return false
  }

  const { error } = await client
    .from("teams")
    .update({ name })
    .eq("id", teamId)

  if (error) {
    console.error("Error updating team:", error)
    return false
  }

  return true
}

export async function getUserTeamRole(userId: string): Promise<TeamRole | null> {
  const client = getSupabase()
  
  if (!client) {
    return null
  }

  const { data, error } = await client
    .from("users")
    .select("team_role")
    .eq("id", userId)
    .single()

  if (error || !data) {
    return null
  }

  return data.team_role as TeamRole
}

export async function deleteUserAccount(userId: string): Promise<boolean> {
  const client = getSupabase()
  
  if (!client) {
    return false
  }

  const { error } = await client
    .from("users")
    .delete()
    .eq("id", userId)

  if (error) {
    console.error("Error deleting user account:", error)
    return false
  }

  return true
}

export async function deleteTeamAndMembers(teamId: string, ownerId: string): Promise<boolean> {
  const client = getSupabase()
  
  if (!client) {
    return false
  }

  const { error: usersError } = await client
    .from("users")
    .delete()
    .eq("team_id", teamId)

  if (usersError) {
    console.error("Error deleting team users:", usersError)
    return false
  }

  const { error: settingsError } = await client
    .from("settings")
    .delete()
    .eq("team_id", teamId)

  if (settingsError) {
    console.error("Error deleting team settings:", settingsError)
  }

  const { error: teamError } = await client
    .from("teams")
    .delete()
    .eq("id", teamId)

  if (teamError) {
    console.error("Error deleting team:", teamError)
    return false
  }

  return true
}

export interface UserProfile {
  id: string
  email: string
  name: string
  industry?: string
  teamName?: string
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const client = getSupabase()
  
  if (!client) {
    return null
  }

  // First try to get basic user info (these columns should always exist)
  const { data, error } = await client
    .from("users")
    .select("id, email, name, team_id")
    .eq("id", userId)
    .single()

  if (error || !data) {
    console.error("Error fetching user profile:", error)
    return null
  }

  // Get team info (teamName, industry from teams table)
  let industry = ""
  let teamName = ""
  
  if (data.team_id) {
    const { data: teamData } = await client
      .from("teams")
      .select("name, industry")
      .eq("id", data.team_id)
      .single()
    
    if (teamData) {
      teamName = teamData.name || ""
      industry = teamData.industry || ""
    }
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    industry,
    teamName,
  }
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  const client = getSupabase()
  
  if (!client) {
    return false
  }

  const hashedPassword = await hashPassword(newPassword)

  const { error } = await client
    .from("users")
    .update({ password: hashedPassword })
    .eq("id", userId)

  if (error) {
    console.error("Error updating password:", error)
    return false
  }

  return true
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const client = getSupabase()
  
  if (!client) {
    return null
  }

  // First get the user's team_id
  const { data: userData } = await client
    .from("users")
    .select("team_id")
    .eq("id", userId)
    .single()

  if (!userData?.team_id) {
    // No team, just update user name
    await client
      .from("users")
      .update({ name: updates.name })
      .eq("id", userId)
  } else {
    // Update user name
    await client
      .from("users")
      .update({ name: updates.name })
      .eq("id", userId)

    // Update team industry only (company is the team name)
    if (updates.industry !== undefined) {
      await client
        .from("teams")
        .update({ industry: updates.industry })
        .eq("id", userData.team_id)
    }
  }

  // Fetch and return updated profile
  return getUserProfile(userId)
}
