import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getLeads, addLead, getSettings } from "@/lib/supabase"
import type { CollectedData } from "@/lib/types"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  teamId?: string
  teamRole?: "owner" | "admin" | "member"
}

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")
  if (!token) return null
  try {
    return JSON.parse(token.value) as User
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    const leads = await getLeads(user?.teamId)
    return NextResponse.json(leads)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
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
