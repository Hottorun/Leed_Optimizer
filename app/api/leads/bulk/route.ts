import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { deleteAllLeads, deleteDeclinedLeadsOlderThan } from "@/lib/supabase"

interface User {
  teamId?: string
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
  const user = await getCurrentUser()
  if (!user?.teamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  if (action === "all") {
    const success = await deleteAllLeads()
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete all leads" },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  }

  if (action === "old-declined") {
    const days = parseInt(searchParams.get("days") || "30")
    const count = await deleteDeclinedLeadsOlderThan(user.teamId, days)
    return NextResponse.json({ success: true, deletedCount: count })
  }

  return NextResponse.json(
    { error: "Invalid action. Use 'all' or 'old-declined'" },
    { status: 400 }
  )
}
