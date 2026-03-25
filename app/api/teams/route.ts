import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getTeamById, updateTeam } from "@/lib/supabase"

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
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // If user has a team, return it
    if (user.teamId) {
      const team = await getTeamById(user.teamId)
      return NextResponse.json({ team, hasTeam: true })
    }

    // User has no team
    return NextResponse.json({ team: null, hasTeam: false })
  } catch (err) {
    console.error("Error fetching team:", err)
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already has a team
    if (user.teamId) {
      return NextResponse.json({ error: "You already have a team" }, { status: 400 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    const { createTeam } = await import("@/lib/supabase")
    const team = await createTeam(name.trim(), user.id)
    
    if (!team) {
      return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
    }

    return NextResponse.json({ team, hasTeam: true })
  } catch (err) {
    console.error("Error creating team:", err)
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only owner and admin can update team
    if (!user.teamId || !["owner", "admin"].includes(user.teamRole || "")) {
      return NextResponse.json({ error: "Not authorized to update team" }, { status: 403 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    await updateTeam(user.teamId, name.trim())
    const team = await getTeamById(user.teamId)

    return NextResponse.json({ team })
  } catch (err) {
    console.error("Error updating team:", err)
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 })
  }
}
