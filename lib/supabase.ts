import { createClient, SupabaseClient } from "@supabase/supabase-js"
import type { Lead, AppSettings, LeadStatus, Team, TeamMember, TeamRole, LeadSession, Message, CollectedData } from "./types"
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
  language: "de",
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

  console.log("getLeads: teamId =", teamId)
  
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
  
  const existingLeads = await getLeads(lead.teamId)
  const leadCount = existingLeads.filter(l => l.phone === lead.phone).length + 1
  const isLoyal = leadCount >= 3

  if (!client) {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      leadCount,
      isLoyal,
      autoApproved: false,
      teamId: lead.teamId,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

  return mapDbLeadToLead(data)
}

export async function updateLeadSession(
  sessionId: string,
  updates: Partial<{
    status: string
    currentStep: string
    collectedData: CollectedData
    needsMoreInfo: boolean
    rating: boolean
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

export async function deleteAllLeads(): Promise<boolean> {
  const client = getSupabase()
  
  if (!client) {
    inMemoryLeads = []
    return true
  }

  const { error } = await client
    .from("leads")
    .delete()
    .neq("id", "")

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
    language: (data.language as "de" | "en") || "de",
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
    language: (data.language as "de" | "en") || "de",
  }
}

function mapDbLeadToLead(
  row: {
    id: string
    name: string
    phone: string
    email: string
    lead_count?: number
    is_loyal?: boolean
    auto_approved?: boolean
    last_contacted_at?: string
    status?: string
    created_at: string
    updated_at: string
    teams_id?: string
  },
  session?: LeadSession
): Lead {
  const collectedData = session?.collectedData || {}
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    location: collectedData.location,
    workType: collectedData.workType,
    conversationSummary: collectedData.message,
    leadCount: row.lead_count || 1,
    isLoyal: row.is_loyal || false,
    autoApproved: row.auto_approved || false,
    lastContactedAt: row.last_contacted_at,
    status: (session?.status as Lead["status"]) || "pending",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    teamId: row.teams_id,
    session,
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
    collectedData: row.collected_data,
    needsMoreInfo: row.needs_more_info,
    rating: row.rating,
    ratingReason: row.rating_reason,
    forwardedAt: row.forwarded_at,
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
