import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getLeads, addLead, getSettings, getSupabase } from "@/lib/supabase"
import type { CollectedData, Lead } from "@/lib/types"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  teamId?: string
  teamRole?: "owner" | "admin" | "member"
}

const mockLeads: Lead[] = [
  { id: "1", name: "Sarah Johnson", phone: "+1 555-123-4567", email: "sarah.j@techcorp.com", location: "San Francisco, CA", workType: "Enterprise Software", conversationSummary: "Sarah is interested in our enterprise solution. She's the VP of Engineering at TechCorp and mentioned they have a Q2 budget for new tools.", status: "approved", source: "whatsapp", rating: 5, ratingReason: "VP-level contact with clear Q2 budget", leadCount: 1, isLoyal: true, autoApproved: false, lastContactedAt: null, teamId: "mock", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), session: { id: "s1", createdAt: new Date().toISOString(), teamsId: "mock", leadsId: "1", status: "approved", currentStep: "review", collectedData: { name: "Sarah Johnson", phone: "+1 555-123-4567", email: "sarah.j@techcorp.com", location: "San Francisco, CA", workType: "Enterprise Software", message: "Sarah is interested in our enterprise solution." }, needsMoreInfo: false, rating: 5, ratingReason: "VP-level contact with clear Q2 budget", forwardedAt: null, updatedAt: new Date().toISOString() } },
  { id: "2", name: "Michael Chen", phone: "+1 555-234-5678", email: "mchen@startup.io", location: "Austin, TX", workType: "SaaS Platform", conversationSummary: "Michael reached out about integrating our API into his startup's platform.", status: "approved", source: "whatsapp", rating: 4, ratingReason: "Tech-focused, API integration interest", leadCount: 1, isLoyal: false, autoApproved: false, lastContactedAt: null, teamId: "mock", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), session: { id: "s2", createdAt: new Date().toISOString(), teamsId: "mock", leadsId: "2", status: "approved", currentStep: "review", collectedData: { name: "Michael Chen", phone: "+1 555-234-5678", email: "mchen@startup.io", location: "Austin, TX", workType: "SaaS Platform" }, needsMoreInfo: false, rating: 4, ratingReason: "Tech-focused, API integration interest", forwardedAt: null, updatedAt: new Date().toISOString() } },
  { id: "13", name: "Thomas Anderson", phone: "+1 555-444-5555", email: "tanderson@matrix.com", location: "Portland, OR", workType: "Cybersecurity", conversationSummary: "Thomas claims to represent a Fortune 500 company but provided a personal email. Company details don't match public records.", status: "manual", source: "whatsapp", rating: 3, ratingReason: "Company verification needed", leadCount: 1, isLoyal: false, autoApproved: false, lastContactedAt: null, teamId: "mock", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), session: { id: "s13", createdAt: new Date().toISOString(), teamsId: "mock", leadsId: "13", status: "manual", currentStep: "review", collectedData: { name: "Thomas Anderson", phone: "+1 555-444-5555", email: "tanderson@matrix.com", location: "Portland, OR", workType: "Cybersecurity" }, needsMoreInfo: true, rating: 3, ratingReason: "Company verification needed", forwardedAt: null, updatedAt: new Date().toISOString() } },
  { id: "16", name: "Rachel Green", phone: "+1 555-777-8888", email: "rgreen@fashion.com", location: "London, UK", workType: "Fashion & Retail", conversationSummary: "Rachel is based in UK and needs EU data center compliance. We only offer US-based hosting.", status: "declined", source: "whatsapp", rating: 1, ratingReason: "Outside service area (EU)", leadCount: 1, isLoyal: false, autoApproved: false, lastContactedAt: null, teamId: "mock", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), session: { id: "s16", createdAt: new Date().toISOString(), teamsId: "mock", leadsId: "16", status: "declined", currentStep: "completed", collectedData: { name: "Rachel Green", phone: "+1 555-777-8888", email: "rgreen@fashion.com", location: "London, UK", workType: "Fashion & Retail" }, needsMoreInfo: false, rating: 1, ratingReason: "Outside service area (EU)", forwardedAt: null, updatedAt: new Date().toISOString() } },
]

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")
  if (!token) return null
  try {
    const user = JSON.parse(token.value) as User
    
    // Refresh team info from database
    const supabase = getSupabase()
    if (supabase && user.id) {
      const { data } = await supabase
        .from("users")
        .select("team_id, team_role")
        .eq("id", user.id)
        .single()
      
      if (data) {
        user.teamId = data.team_id
        user.teamRole = data.team_role
      }
    }
    
    return user
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const leads = await getLeads(user.teamId)
    
    const filteredLeads = (leads || []).filter((l: Lead) => {
      const status = l.session?.status
      return status !== "cancelled"
    })
    
    return NextResponse.json(filteredLeads)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { 
      name, phone, email, location, workType, message, company, budget, timeline,
      contactPlatform
    } = body

    if (!name || !phone || !email) {
      return NextResponse.json(
        { 
          error: "Missing required fields",
          required: ["name", "phone", "email"]
        },
        { status: 400 }
      )
    }

    const settings = await getSettings(user.teamId)

    const collectedData: CollectedData = {
      name,
      phone,
      email,
      ...(location && { location }),
      ...(workType && { workType }),
      ...(message && { message }),
      ...(company && { company }),
      ...(budget && { budget }),
      ...(timeline && { timeline }),
      ...(contactPlatform && { contactPlatform }),
    }

    const newLead = await addLead({
      name,
      phone,
      email,
      collectedData,
      teamId: user.teamId,
    })

    if (!newLead) {
      return NextResponse.json(
        { error: "Failed to create lead" },
        { status: 500 }
      )
    }

    return NextResponse.json(newLead)
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
