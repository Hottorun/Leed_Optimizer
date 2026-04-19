import { NextResponse } from "next/server"
import { getLeadById, updateLead, deleteLead } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const lead = await getLeadById(id)

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  // Prevent cross-team data access
  if (lead.teamId && user.teamId && lead.teamId !== user.teamId) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  return NextResponse.json(lead)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params

    const existing = await getLeadById(id)
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }
    if (existing.teamId && user.teamId && existing.teamId !== user.teamId) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    const body = await request.json()

    // Allowlist only fields clients are permitted to update
    const ALLOWED_FIELDS = ["name", "phone", "email", "status", "isLoyal", "autoApproved", "lastContactedAt"] as const
    const safeUpdates: Partial<import("@/lib/types").Lead> = {}
    for (const key of ALLOWED_FIELDS) {
      if (key in body) (safeUpdates as Record<string, unknown>)[key] = body[key]
    }

    const updatedLead = await updateLead(id, safeUpdates)

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(updatedLead)
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const existing = await getLeadById(id)
  if (!existing) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }
  if (existing.teamId && user.teamId && existing.teamId !== user.teamId) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  const success = await deleteLead(id)
  if (!success) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
