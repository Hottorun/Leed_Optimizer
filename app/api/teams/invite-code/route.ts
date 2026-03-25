import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { updateTeamInviteCode } from "@/lib/supabase"

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

export async function POST() {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.teamId) {
      return NextResponse.json({ error: "Unauthorized or no team" }, { status: 401 })
    }

    if (user.teamRole !== "owner" && user.teamRole !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const inviteCode = await updateTeamInviteCode(user.teamId)
    
    if (!inviteCode) {
      return NextResponse.json({ error: "Failed to regenerate invite code" }, { status: 500 })
    }

    return NextResponse.json({ inviteCode })
  } catch (err) {
    console.error("Error regenerating invite code:", err)
    return NextResponse.json({ error: "Failed to regenerate invite code" }, { status: 500 })
  }
}
