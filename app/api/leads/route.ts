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
  { id: "1", name: "Sarah Johnson", phone: "+1 555-123-4567", email: "sarah.j@techcorp.com", location: "San Francisco, CA", workType: "Enterprise Software", conversationSummary: "Sarah is interested in our enterprise solution. She's the VP of Engineering at TechCorp and mentioned they have a Q2 budget for new tools. Ready to schedule a demo call next week.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), collectedData: {}, teamId: "mock", isLoyal: true, session: { status: "approved", currentStep: "review", rating: 5, ratingReason: "VP-level contact with clear Q2 budget", aiRecommendation: "Contact immediately - high intent", needsMoreInfo: false, conversionProbability: 92, dealValue: 45000, urgency: "High" } },
  { id: "2", name: "Michael Chen", phone: "+1 555-234-5678", email: "mchen@startup.io", location: "Austin, TX", workType: "SaaS Platform", conversationSummary: "Michael reached out about integrating our API into his startup's platform. They're currently in beta and looking to scale. Budget is flexible depending on pricing model.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), collectedData: {}, teamId: "mock", isLoyal: false, session: { status: "approved", currentStep: "review", rating: 4, ratingReason: "Tech-focused, API integration interest", aiRecommendation: "Schedule follow-up call", needsMoreInfo: false, conversionProbability: 78, dealValue: 24000, urgency: "Medium" } },
  { id: "3", name: "Emily Watson", phone: "+1 555-345-6789", email: "emily.w@design.co", location: "New York, NY", workType: "Creative Agency", conversationSummary: "Emily runs a creative design agency and wants our collaboration tools. She specifically mentioned needing better client handoff features. Already using similar tools and looking to switch.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), collectedData: {}, teamId: "mock", isLoyal: true, session: { status: "approved", currentStep: "follow_up", rating: 4, ratingReason: "Active buyer, switching from competitor", aiRecommendation: "Send proposal document", needsMoreInfo: false, conversionProbability: 85, dealValue: 18000, urgency: "High" } },
  { id: "4", name: "David Kim", phone: "+1 555-456-7890", email: "dkim@enterprise.net", location: "Seattle, WA", workType: "Cloud Services", conversationSummary: "David inquired about our cloud integration services. His company is mid-migration to AWS and needs additional support. No urgent timeline mentioned.", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), collectedData: {}, teamId: "mock", isLoyal: false, session: { status: "approved", currentStep: "review", rating: 3, ratingReason: "Mid-migration, no urgent timeline", aiRecommendation: "Send newsletter", needsMoreInfo: false, conversionProbability: 55, dealValue: 15000, urgency: "Low" } },
  { id: "5", name: "Jessica Martinez", phone: "+1 555-567-8901", email: "jmartinez@agency.com", location: "Miami, FL", workType: "Marketing Agency", conversationSummary: "Jessica is ready to sign! She needs our enterprise plan with white-label options for her 50+ client accounts. Legal review in progress, expecting contract by end of week.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), collectedData: {}, teamId: "mock", isLoyal: true, session: { status: "approved", currentStep: "proposal", rating: 5, ratingReason: "Ready to sign, 50+ client accounts", aiRecommendation: "Close deal - ready to sign", needsMoreInfo: false, conversionProbability: 95, dealValue: 62000, urgency: "High" } },
  { id: "6", name: "Robert Taylor", phone: "+1 555-678-9012", email: "rtaylor@consulting.biz", location: "Chicago, IL", workType: "Management Consulting", conversationSummary: "Robert is evaluating multiple vendors for his consulting firm. He mentioned competitor pricing and wants to understand our differentiation. Initial interest but needs more info.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), collectedData: {}, teamId: "mock", isLoyal: false, session: { status: "approved", currentStep: "contact", rating: 3, ratingReason: "Evaluating vendors, needs differentiation", aiRecommendation: "Schedule initial call", needsMoreInfo: true, conversionProbability: 48, dealValue: 22000, urgency: "Medium" } },
  { id: "7", name: "Amanda Foster", phone: "+1 555-789-0123", email: "afoster@retail.com", location: "Denver, CO", workType: "E-commerce", conversationSummary: "Amanda runs an e-commerce store and is looking for basic inventory management. Budget is limited ($500/month max). Interested but price-sensitive, may need smaller tier option.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), collectedData: {}, teamId: "mock", isLoyal: false, session: { status: "approved", currentStep: "review", rating: 2, ratingReason: "Limited budget, price-sensitive", aiRecommendation: "Nurture with email sequence", needsMoreInfo: false, conversionProbability: 28, dealValue: 6000, urgency: "Low" } },
  { id: "8", name: "Christopher Lee", phone: "+1 555-890-1234", email: "clee@finance.org", location: "Boston, MA", workType: "Financial Services", conversationSummary: "Christopher's firm needs compliance-ready software for their trading desk. They have strict security requirements and need SOC2 certification proof. High priority internal project.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), collectedData: {}, teamId: "mock", isLoyal: true, session: { status: "approved", currentStep: "negotiation", rating: 5, ratingReason: "High priority internal project, compliance needs", aiRecommendation: "Prepare final contract", needsMoreInfo: false, conversionProbability: 88, dealValue: 38000, urgency: "High" } },
  { id: "9", name: "Nicole Brown", phone: "+1 555-901-2345", email: "nbrown@media.net", location: "Los Angeles, CA", workType: "Media Production", conversationSummary: "Nicole leads a media production company looking for team collaboration tools. They work with remote teams across time zones and need async communication features.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), collectedData: {}, teamId: "mock", isLoyal: false, session: { status: "approved", currentStep: "review", rating: 3, ratingReason: "Remote team, async communication needs", aiRecommendation: "Send case studies", needsMoreInfo: false, conversionProbability: 62, dealValue: 14000, urgency: "Medium" } },
  { id: "10", name: "Daniel Garcia", phone: "+1 555-012-3456", email: "dgarcia@healthcare.io", location: "Phoenix, AZ", workType: "Healthcare Tech", conversationSummary: "Daniel sent a generic inquiry without specific requirements. No response to follow-up questions. Likely a cold lead or competitor research. Low engagement.", createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), collectedData: {}, teamId: "mock", isLoyal: false, session: { status: "approved", currentStep: "follow_up", rating: 1, ratingReason: "Cold lead, no response to follow-ups", aiRecommendation: "Low priority - cold lead", needsMoreInfo: true, conversionProbability: 12, dealValue: 8000, urgency: "Low" } },
  { id: "11", name: "Michelle Davis", phone: "+1 555-111-2222", email: "mdavis@realestate.com", location: "Dallas, TX", workType: "Real Estate", conversationSummary: "Michelle is a broker with 20 agents under her. Interested in our CRM features for lead tracking. Mentioned she's willing to pay for excellent support.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), collectedData: {}, teamId: "mock", isLoyal: true, session: { status: "approved", currentStep: "review", rating: 4, ratingReason: "20 agents, willing to pay for support", aiRecommendation: "Book property tour", needsMoreInfo: false, conversionProbability: 82, dealValue: 28000, urgency: "High" } },
  { id: "12", name: "Steven Wilson", phone: "+1 555-333-4444", email: "swilson@logistics.co", location: "Atlanta, GA", workType: "Logistics & Shipping", conversationSummary: "Steven manages logistics for a mid-sized company. Needs route optimization features integrated with their existing TMS. Timeline: implement within 3 months.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), collectedData: {}, teamId: "mock", isLoyal: false, session: { status: "approved", currentStep: "proposal", rating: 4, ratingReason: "Clear timeline, mid-sized company", aiRecommendation: "Send logistics proposal", needsMoreInfo: false, conversionProbability: 76, dealValue: 32000, urgency: "High" } },
  { id: "13", name: "Thomas Anderson", phone: "+1 555-444-5555", email: "tanderson@matrix.com", location: "Portland, OR", workType: "Cybersecurity", conversationSummary: "Thomas claims to represent a Fortune 500 company but provided a personal email. Company details don't match public records. Possible misrepresentation or test lead.", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), collectedData: {}, teamId: "mock", isLoyal: false, session: { status: "manual", currentStep: "review", rating: 3, ratingReason: "Company verification needed", aiRecommendation: "Verify company details - needs human check", needsMoreInfo: true, conversionProbability: 45, dealValue: 50000, urgency: "Medium" } },
  { id: "14", name: "Lisa Wang", phone: "+1 555-555-6666", email: "lwang@techstart.io", location: "San Diego, CA", workType: "AI/ML Startup", conversationSummary: "Lisa is the CEO of an AI startup seeking enterprise features. Very interested but didn't specify budget range. Could be high-value but needs qualification call.", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), collectedData: {}, teamId: "mock", isLoyal: false, session: { status: "manual", currentStep: "review", rating: 4, ratingReason: "CEO, enterprise interest, budget unclear", aiRecommendation: "High value but budget unclear - review manually", needsMoreInfo: true, conversionProbability: 58, dealValue: 40000, urgency: "Medium" } },
  { id: "15", name: "Marcus Johnson", phone: "+1 555-666-7777", email: "mjohnson@corp.net", location: "Philadelphia, PA", workType: "Corporate Services", conversationSummary: "Marcus requested enterprise pricing but also asked about free trial. Mixed signals - possibly just comparing options or has budget constraints. Company size unclear.", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), collectedData: {}, teamId: "mock", isLoyal: true, session: { status: "manual", currentStep: "review", rating: 2, ratingReason: "Conflicting signals on budget", aiRecommendation: "Conflicting info - requires human judgment", needsMoreInfo: true, conversionProbability: 35, dealValue: 18000, urgency: "Low" } },
  { id: "16", name: "Rachel Green", phone: "+1 555-777-8888", email: "rgreen@fashion.com", location: "London, UK", workType: "Fashion & Retail", conversationSummary: "Rachel is based in UK and needs EU data center compliance. We only offer US-based hosting. Lead declined as outside service scope.", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), collectedData: {}, teamId: "mock", isLoyal: false, session: { status: "declined", currentStep: "completed", rating: 1, ratingReason: "Outside service area (EU)", aiRecommendation: "Outside service area", needsMoreInfo: false, conversionProbability: 0, dealValue: 0, urgency: "Low" } },
  { id: "17", name: "Kevin Miller", phone: "+1 555-888-9999", email: "kmiller@budget.net", location: "Houston, TX", workType: "Small Business", conversationSummary: "Kevin is a solo entrepreneur with $100/month budget, asking for enterprise features. Our minimum tier is $299/month. Declined due to budget mismatch.", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), collectedData: {}, teamId: "mock", isLoyal: false, session: { status: "declined", currentStep: "completed", rating: 1, ratingReason: "Budget too low for our services", aiRecommendation: "Budget too low for services", needsMoreInfo: false, conversionProbability: 0, dealValue: 0, urgency: "Low" } },
  { id: "18", name: "Diana Prince", phone: "+1 555-999-0000", email: "dprince@themys.com", location: "Washington, DC", workType: "Government Consulting", conversationSummary: "Diana asked for FedRAMP compliance which we don't currently have. Requested services outside our roadmap. Lead declined.", createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), collectedData: {}, teamId: "mock", isLoyal: false, session: { status: "declined", currentStep: "completed", rating: 2, ratingReason: "FedRAMP not available", aiRecommendation: "Requested services not offered", needsMoreInfo: false, conversionProbability: 0, dealValue: 0, urgency: "Low" } },
  { id: "19", name: "Bruce Banner", phone: "+1 555-000-1111", email: "bbanner@science.io", location: "Research Triangle, NC", workType: "Research Institution", conversationSummary: "Just started intake conversation. Need to complete the questionnaire to determine fit.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), collectedData: {}, teamId: "mock", isLoyal: false, session: { status: "pending", currentStep: "initial", rating: 0, ratingReason: "Pending AI analysis", aiRecommendation: "Awaiting initial AI processing", needsMoreInfo: true, conversionProbability: 0, dealValue: 0, urgency: "Low" } },
  { id: "20", name: "Clark Kent", phone: "+1 555-111-2222", email: "ckent@dailyplanet.com", location: "Metropolis, NY", workType: "Media & Publishing", conversationSummary: "New inquiry just received. Initial message looks promising but questionnaire not yet started.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), collectedData: {}, teamId: "mock", isLoyal: false, session: { status: "pending", currentStep: "initial", rating: 0, ratingReason: "Pending AI analysis", aiRecommendation: "New lead - pending analysis", needsMoreInfo: true, conversionProbability: 0, dealValue: 0, urgency: "Low" } },
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
    const leads = await getLeads(user?.teamId)
    
    const filteredLeads = (leads || []).filter((l: Lead) => {
      const status = l.session?.status
      return status !== "active" && status !== "closed"
    })
    
    const allLeads = [...mockLeads, ...filteredLeads]
    
    return NextResponse.json(allLeads)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(mockLeads)
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
