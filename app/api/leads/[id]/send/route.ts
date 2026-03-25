import { NextResponse } from "next/server"
import { getLeadById, updateLead, getSettings } from "@/lib/supabase"
import type { SendMessageResponse, LeadStatus } from "@/lib/types"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, message } = body as { action: "approve" | "decline" | "unrelated"; message: string }

    if (!action || !message) {
      return NextResponse.json(
        { error: "Action and message are required" },
        { status: 400 }
      )
    }

    const lead = await getLeadById(id)
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Get webhook URL from settings (database)
    const settings = await getSettings()
    const webhookUrl = settings.webhookUrl
    
    // Prepare the response to send to the chatbot
    const chatbotPayload: SendMessageResponse = {
      leadId: lead.id,
      action,
      message,
      phone: lead.phone,
    }

    // Send POST request to n8n webhook
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

    // Update lead status based on action
    let newStatus: LeadStatus
    if (action === "approve") {
      newStatus = "approved"
    } else if (action === "decline") {
      newStatus = "declined"
    } else {
      newStatus = "unrelated"
    }
    
    const updatedLead = await updateLead(id, { 
      status: newStatus,
      lastContactedAt: new Date().toISOString(),
      ...(action === "approve" ? { approveMessage: message } : { declineMessage: message })
    })

    return NextResponse.json({
      success: true,
      lead: updatedLead,
      webhookSent,
    })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
