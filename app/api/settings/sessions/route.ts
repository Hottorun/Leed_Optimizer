import { NextResponse } from "next/server"
import { cookies } from "next/headers"

interface User {
  id: string
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
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In a real app, you'd fetch from a sessions table in the database
    // For now, return mock data
    const sessions = [
      {
        id: "1",
        device: "MacBook Pro",
        browser: "Chrome",
        ip: "192.168.1.1",
        location: "Berlin, Germany",
        lastActive: new Date().toISOString(),
        current: true,
      },
    ]

    return NextResponse.json({ sessions })
  } catch (err) {
    console.error("Error fetching sessions:", err)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    // In a real app, you'd delete the session from the database
    // For now, just return success
    console.log("Revoking session:", sessionId, "for user:", user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error revoking session:", err)
    return NextResponse.json({ error: "Failed to revoke session" }, { status: 500 })
  }
}
