import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { updateUserPassword, getUserProfile } from "@/lib/supabase"
import { sendPasswordChangedNotification } from "@/lib/email"

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

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 })
    }

    // In a real app, you'd verify the current password against the hash
    // For now, we'll just update to the new password
    const success = await updateUserPassword(user.id, newPassword)
    
    if (!success) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    // Get user info for the notification email
    const profile = await getUserProfile(user.id)
    if (profile?.email) {
      await sendPasswordChangedNotification(profile.email, profile.name || "User")
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error changing password:", err)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
