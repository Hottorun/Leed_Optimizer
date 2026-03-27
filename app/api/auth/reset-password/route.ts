import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Auth not configured" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, reset_expires")
      .eq("reset_token", token)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid reset token" },
        { status: 400 }
      )
    }

    const now = new Date()
    const expires = new Date(user.reset_expires)

    if (expires < now) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await supabase
      .from("users")
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_expires: null,
      })
      .eq("id", user.id)

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (err) {
    console.error("Reset password error:", err)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
