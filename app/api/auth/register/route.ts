import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  teamId?: string
  teamRole?: "owner" | "admin" | "member"
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, inviteCode } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, E-Mail und Passwort sind erforderlich" },
        { status: 400 }
      )
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/
    if (password.length < 8 || !passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Passwort erfullt nicht die Anforderungen" },
        { status: 400 }
      )
    }

    const { createClient, SupabaseClient } = await import("@supabase/supabase-js")
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Authentifizierung nicht konfiguriert. Bitte kontaktieren Sie den Administrator." },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .ilike("email", email)
      .limit(1)

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: "Diese E-Mail-Adresse ist bereits registriert" },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    let teamId: string | undefined
    let teamRole: "owner" | "admin" | "member" = "member"

    if (inviteCode) {
      const { data: teamData } = await supabase
        .from("teams")
        .select("id, invite_code")
        .eq("invite_code", inviteCode)
        .single()

      if (teamData) {
        teamId = teamData.id
        teamRole = "member"
      } else {
        return NextResponse.json(
          { error: "Ungultiger Einladungscode" },
          { status: 400 }
        )
      }
    }

    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        email,
        name,
        password: hashedPassword,
        role: "user",
        team_id: teamId,
        team_role: teamId ? teamRole : null,
      })
      .select()
      .single()

    if (createError || !newUser) {
      console.error("Error creating user:", createError)
      return NextResponse.json(
        { error: "Fehler beim Erstellen des Kontos" },
        { status: 500 }
      )
    }

    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      teamId: newUser.team_id,
      teamRole: newUser.team_role,
    }

    const cookieStore = await cookies()
    cookieStore.set("auth_token", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    if (!teamId) {
      return NextResponse.json({ user, needsTeam: true })
    }

    return NextResponse.json({ user })
  } catch (err) {
    console.error("Registration error:", err)
    return NextResponse.json(
      { error: "Registrierung fehlgeschlagen" },
      { status: 500 }
    )
  }
}
