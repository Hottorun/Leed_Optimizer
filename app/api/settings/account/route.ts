import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { deleteUserAccount, deleteTeamAndMembers } from "@/lib/supabase"

interface User {
  id: string
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

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const deleteTeam = body.deleteTeam === true

    if (user.teamRole === "owner" && !deleteTeam) {
      return NextResponse.json({ 
        error: "As a team owner, you must delete the team first or transfer ownership" 
      }, { status: 400 })
    }

    if (deleteTeam && user.teamId) {
      const success = await deleteTeamAndMembers(user.teamId, user.id)
      if (!success) {
        return NextResponse.json({ error: "Failed to delete team" }, { status: 500 })
      }
    } else {
      const success = await deleteUserAccount(user.id)
      if (!success) {
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error deleting account:", err)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
