import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSettings, updateSettings } from "@/lib/supabase"

interface User {
  id: string
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

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.teamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const settings = await getSettings(user.teamId)
  return NextResponse.json(settings)
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user?.teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const settings = await updateSettings(user.teamId, body)
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
