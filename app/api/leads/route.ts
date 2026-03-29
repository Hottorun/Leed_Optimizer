import { NextResponse } from "next/server"
import { getLeads, addLead } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import type { CollectedData, Lead } from "@/lib/types"

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
      source, conversationSummary
    } = body

    if (!name) {
      return NextResponse.json(
        { error: "Missing required fields", required: ["name"] },
        { status: 400 }
      )
    }

    if (!phone && !email) {
      return NextResponse.json(
        { error: "Either email or phone is required" },
        { status: 400 }
      )
    }

    const collectedData: CollectedData = {
      source: source || "email",
      name,
      ...(phone && { phone }),
      ...(email && { email }),
      ...(location && { location }),
      ...(workType && { workType }),
      ...(message && { message }),
      ...(conversationSummary && { conversationSummary }),
      ...(company && { company }),
      ...(budget && { budget }),
      ...(timeline && { timeline }),
    }

    const newLead = await addLead({
      name,
      phone: phone || "",
      email: email || "",
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
