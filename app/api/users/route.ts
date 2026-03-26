import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
}

interface DbUser extends User {
  password: string
}

const mockUsers: DbUser[] = []

async function getMockAdminPassword(): Promise<string> {
  if (mockUsers.length === 0) {
    const hash = await bcrypt.hash("admin123", 10)
    mockUsers.push({
      id: "1",
      email: "admin@leadflow.com",
      password: hash,
      name: "Admin User",
      role: "admin"
    })
  }
  return mockUsers[0].password
}

function getSupabase(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return null
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")
  if (!token) return null
  try {
    return JSON.parse(token.value)
  } catch {
    return null
  }
}

async function getUsers(): Promise<User[]> {
  const supabase = getSupabase()
  
  if (!supabase) {
    return mockUsers.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role }))
  }
  
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, role")
    .order("created_at", { ascending: true })
  
  if (error) {
    console.error("Error fetching users:", error)
    return []
  }
  
  return data
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const users = await getUsers()
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create users" }, { status: 403 })
    }
    
    const body = await request.json()
    const { email, password, name, role } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      )
    }

    if (!["admin", "user"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be 'admin' or 'user'" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    const hashedPassword = await hashPassword(password)
    
    if (!supabase) {
      const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (existingUser) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 })
      }
      
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password: hashedPassword,
        name,
        role
      }
      mockUsers.push(newUser)
      
      return NextResponse.json({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }, { status: 201 })
    }

    const { data, error } = await supabase
      .from("users")
      .insert({ email, password: hashedPassword, name, role })
      .select("id, email, name, role")
      .single()

    if (error) {
      console.error("Error creating user:", error)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Only admins can update users" }, { status: 403 })
    }
    
    const body = await request.json()
    const { id, email, name, role, password } = body

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    
    if (!supabase) {
      const index = mockUsers.findIndex(u => u.id === id)
      if (index === -1) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      
      if (email) mockUsers[index].email = email
      if (name) mockUsers[index].name = name
      if (role) mockUsers[index].role = role
      if (password) mockUsers[index].password = await hashPassword(password)
      
      return NextResponse.json({
        id: mockUsers[index].id,
        email: mockUsers[index].email,
        name: mockUsers[index].name,
        role: mockUsers[index].role
      })
    }

    const updates: Record<string, string> = {}
    if (email) updates.email = email
    if (name) updates.name = name
    if (role) updates.role = role
    if (password) updates.password = await hashPassword(password)

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select("id, email, name, role")
      .single()

    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete users" }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (id === currentUser.id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
    }

    const supabase = getSupabase()
    
    if (!supabase) {
      const index = mockUsers.findIndex(u => u.id === id)
      if (index === -1) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      
      mockUsers.splice(index, 1)
      return NextResponse.json({ success: true })
    }

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting user:", error)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
