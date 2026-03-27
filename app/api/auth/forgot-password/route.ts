import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
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
      .select("id, email")
      .ilike("email", email)
      .limit(1)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 404 }
      )
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetExpires = new Date(Date.now() + 3600000)

    await supabase
      .from("users")
      .update({
        reset_token: resetToken,
        reset_expires: resetExpires.toISOString(),
      })
      .eq("id", user.id)

    sendPasswordResetEmail(email, resetToken).catch(console.error)

    return NextResponse.json({ message: "Password reset email sent" })
  } catch (err) {
    console.error("Forgot password error:", err)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
