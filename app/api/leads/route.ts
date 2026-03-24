import { NextResponse } from "next/server"
import { getLeads, addLead } from "@/lib/supabase"
import type { IncomingLead } from "@/lib/types"

export async function GET() {
  const leads = await getLeads()
  return NextResponse.json(leads)
}

export async function POST(request: Request) {
  try {
    const body: IncomingLead = await request.json()

    const { name, phone, email, location, workType, conversationSummary, approveMessage, declineMessage, rating, ratingReason } = body

    // Validate required fields
    if (!name || !phone || !email || !location || !workType || !conversationSummary || !approveMessage || !declineMessage || !rating || !ratingReason) {
      return NextResponse.json(
        { 
          error: "Missing required fields",
          required: ["name", "phone", "email", "location", "workType", "conversationSummary", "approveMessage", "declineMessage", "rating", "ratingReason"]
        },
        { status: 400 }
      )
    }

    // Validate rating is between 1-5
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    const newLead = await addLead({
      name,
      phone,
      email,
      location,
      workType,
      conversationSummary,
      approveMessage,
      declineMessage,
      rating,
      ratingReason,
    })

    if (!newLead) {
      return NextResponse.json(
        { error: "Failed to create lead" },
        { status: 500 }
      )
    }

    return NextResponse.json(newLead, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
