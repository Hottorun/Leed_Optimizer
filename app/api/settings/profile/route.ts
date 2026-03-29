import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserProfile, updateUserProfile } from "@/lib/supabase"

interface User {
  id: string
  email: string
  name: string
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
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await getUserProfile(user.id)

    // If no profile found, return basic info from auth
    if (!profile) {
      const cookieStore = await cookies()
      const token = cookieStore.get("auth_token")
      let userData = user
      if (token) {
        try {
          userData = JSON.parse(token.value) as User
        } catch {
          // malformed cookie — fall back to in-memory user
        }
      }
      return NextResponse.json({
        name: userData.name || "",
        email: userData.email || "",
        phone: "",
        location: "",
        company: ""
      })
    }

    return NextResponse.json(profile)
  } catch (err) {
    console.error("Error fetching profile:", err)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const profile = await updateUserProfile(user.id, body)
    
    if (!profile) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json(profile)
  } catch (err) {
    console.error("Error updating profile:", err)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
