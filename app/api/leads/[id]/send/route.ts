import { NextResponse } from "next/server";
import { getLeadById, updateLead } from "@/lib/supabase";
import type { SendMessageResponse, LeadStatus } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, message } = body as {
      action: "approve" | "decline";
      message: string;
    };

    if (!action || !message) {
      return NextResponse.json(
        { error: "Action and message are required" },
        { status: 400 },
      );
    }

    const lead = await getLeadById(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Prepare the response to send to the chatbot
    const chatbotPayload: SendMessageResponse = {
      leadId: lead.id,
      action,
      message,
      phone: lead.phone,
    };

    // Send POST request to n8n webhook
    const webhookUrl = process.env.CHATBOT_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("CHATBOT_WEBHOOK_URL environment variable is not set");
      return NextResponse.json(
        { error: "Webhook URL not configured" },
        { status: 500 },
      );
    }

    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatbotPayload),
      });

      if (!webhookResponse.ok) {
        console.error(
          "Webhook failed:",
          webhookResponse.status,
          await webhookResponse.text(),
        );
      }
    } catch (webhookError) {
      console.error("Failed to send to webhook:", webhookError);
      // Continue even if webhook fails - we still want to update the lead status
    }

    // Update lead status
    const newStatus: LeadStatus =
      action === "approve" ? "approved" : "declined";
    const updatedLead = await updateLead(id, {
      status: newStatus,
      ...(action === "approve"
        ? { approveMessage: message }
        : { declineMessage: message }),
    });

    return NextResponse.json({
      success: true,
      lead: updatedLead,
      webhookSent: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
