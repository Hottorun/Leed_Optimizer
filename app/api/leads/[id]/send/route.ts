import { NextResponse } from "next/server"
import { getLeadById, updateLeadSession, updateLead, getSettings } from "@/lib/supabase"
import type { SendMessageResponse } from "@/lib/types"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, message, teamId } = body as { action: "approve" | "decline" | "unrelated"; message: string; teamId: string }

    if (!action || !message || !teamId) {
      return NextResponse.json(
        { error: "Action, message, and teamId are required" },
        { status: 400 }
      )
    }

    const lead = await getLeadById(id)
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    const session = lead.session
    if (!session || !session.id) {
      return NextResponse.json({ error: "Lead session not found" }, { status: 404 })
    }

    const settings = await getSettings(teamId)
    const webhookUrl = settings.webhookUrl
    
    const chatbotPayload: SendMessageResponse = {
      leadId: lead.id,
      action,
      message,
      phone: lead.phone,
    }

    let webhookSent = false
    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chatbotPayload),
        })
        
        webhookSent = webhookResponse.ok
        if (!webhookResponse.ok) {
          console.error("Webhook failed:", webhookResponse.status, await webhookResponse.text())
        }
      } catch (webhookError) {
        console.error("Failed to send to webhook:", webhookError)
      }
    }

    let ratingReason = ""
    if (action === "approve") {
      ratingReason = "Approved by user"
    } else if (action === "decline") {
      ratingReason = "Declined by user"
    } else {
      ratingReason = "Marked as unrelated"
    }
    
    const updatedSession = await updateLeadSession(session.id, {
      status: "completed",
      rating: action === "approve",
      ratingReason,
    })

    await updateLead(id, {
      lastContactedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      lead,
      session: updatedSession,
      webhookSent,
    })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
