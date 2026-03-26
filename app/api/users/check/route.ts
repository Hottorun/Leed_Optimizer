import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ exists: false })
    }

    const { createClient } = await import("@supabase/supabase-js")
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ exists: false })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data } = await supabase
      .from("users")
      .select("id")
      .ilike("email", email)
      .limit(1)

    return NextResponse.json({ exists: data && data.length > 0 })
  } catch (err) {
    console.error("Check email error:", err)
    return NextResponse.json({ exists: false })
  }
}
