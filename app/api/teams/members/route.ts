import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getTeamMembers, addTeamMember, updateTeamMemberRole, removeTeamMember, transferTeamOwnership, deleteUserAccount } from "@/lib/supabase"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
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
    
    if (!user || !user.teamId) {
      return NextResponse.json({ error: "Unauthorized or no team" }, { status: 401 })
    }

    const members = await getTeamMembers(user.teamId)
    return NextResponse.json({ members })
  } catch (err) {
    console.error("Error fetching team members:", err)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.teamId) {
      return NextResponse.json({ error: "Unauthorized or no team" }, { status: 401 })
    }

    // Only owner and admin can add members
    if (!["owner", "admin"].includes(user.teamRole || "")) {
      return NextResponse.json({ error: "Not authorized to add members" }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, password, role } = body

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Email, name, and password are required" }, { status: 400 })
    }

    const member = await addTeamMember(user.teamId, email, name, password, role || "member")
    
    if (!member) {
      return NextResponse.json({ error: "Failed to add member" }, { status: 500 })
    }

    return NextResponse.json({ member })
  } catch (err) {
    console.error("Error adding team member:", err)
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.teamId) {
      return NextResponse.json({ error: "Unauthorized or no team" }, { status: 401 })
    }

    const body = await request.json()
    const { memberId, action } = body

    if (!memberId || !action) {
      return NextResponse.json({ error: "Member ID and action are required" }, { status: 400 })
    }

    // Handle role update
    if (action === "updateRole") {
      // Only owner can change roles
      if (user.teamRole !== "owner") {
        return NextResponse.json({ error: "Only owner can change roles" }, { status: 403 })
      }
      const { newRole } = body
      if (!newRole) {
        return NextResponse.json({ error: "New role is required" }, { status: 400 })
      }
      const success = await updateTeamMemberRole(memberId, newRole)
      return NextResponse.json({ success })
    }

    // Handle ownership transfer
    if (action === "transferOwnership") {
      if (user.teamRole !== "owner") {
        return NextResponse.json({ error: "Only owner can transfer ownership" }, { status: 403 })
      }
      const success = await transferTeamOwnership(user.teamId, memberId)
      return NextResponse.json({ success })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (err) {
    console.error("Error updating team member:", err)
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.teamId) {
      return NextResponse.json({ error: "Unauthorized or no team" }, { status: 401 })
    }

    // Only owner and admin can remove members
    if (!["owner", "admin"].includes(user.teamRole || "")) {
      return NextResponse.json({ error: "Not authorized to remove members" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get("memberId")
    const deleteAccount = searchParams.get("deleteAccount") === "true"

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 })
    }

    // Cannot remove yourself if you're the only owner
    if (memberId === user.id && user.teamRole === "owner") {
      const members = await getTeamMembers(user.teamId)
      const owners = members.filter(m => m.role === "owner")
      if (owners.length === 1) {
        return NextResponse.json({ error: "Cannot remove the only owner. Transfer ownership first." }, { status: 400 })
      }
    }

    if (deleteAccount) {
      // Delete the account completely
      const success = await deleteUserAccount(memberId)
      if (!success) {
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
      }
      return NextResponse.json({ success: true, deletedAccount: true })
    }

    // Just remove from team (keep account)
    const success = await removeTeamMember(memberId)
    return NextResponse.json({ success })
  } catch (err) {
    console.error("Error removing team member:", err)
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 })
  }
}
