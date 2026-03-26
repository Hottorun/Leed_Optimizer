import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  teamId?: string
  teamRole?: "owner" | "admin" | "member"
}

interface DbUser extends User {
  password: string
  team_id?: string
  team_role?: string
}

interface TeamInfo {
  team_id?: string
  team_role?: string
}

function getSupabase(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return null
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

async function getUserByEmail(email: string): Promise<DbUser | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase.rpc('get_user_by_email', { p_email: email })
  
  if (error || !data || data.length === 0) return null
  return data[0]
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Authentication not configured. Please contact administrator." },
        { status: 500 }
      )
    }

    const userData = await getUserByEmail(email)
    
    if (!userData) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }
    
    const passwordValid = await verifyPassword(password, userData.password)
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }
    
    console.log("Auth - userData from DB:", userData)
    
    // Fetch fresh team info from database
    let teamId = userData.team_id
    let teamRole = userData.team_role
    
    const supabaseClient = getSupabase()
    if (supabaseClient && userData.id) {
      const { data: freshData } = await supabaseClient
        .from("users")
        .select("team_id, team_role")
        .eq("id", userData.id)
        .single()
      
      if (freshData) {
        teamId = freshData.team_id
        teamRole = freshData.team_role
      }
    }
    
    const user: User = { 
      id: userData.id, 
      email: userData.email, 
      name: userData.name, 
      role: userData.role,
      teamId: teamId,
      teamRole: teamRole as "owner" | "admin" | "member" | undefined,
    }

    console.log("Auth - created user object with team:", user)
    
    const cookieStore = await cookies()
    cookieStore.set("auth_token", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return NextResponse.json({ user })
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
  return NextResponse.json({ success: true })
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")

  if (!token) {
    return NextResponse.json({ user: null })
  }

  try {
    const user = JSON.parse(token.value) as User
    
    // Refresh team info from database
    const supabase = getSupabase()
    if (supabase && user.id) {
      const { data } = await supabase
        .from("users")
        .select("team_id, team_role")
        .eq("id", user.id)
        .single()
      
      if (data) {
        user.teamId = data.team_id
        user.teamRole = data.team_role
      }
    }
    
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}
