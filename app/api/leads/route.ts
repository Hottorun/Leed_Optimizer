import { NextResponse } from "next/server"
import { mockLeads } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockLeads)
}
