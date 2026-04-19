import type { Lead } from "@/lib/types"

export function getSafeString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

export function getLeadStatus(lead: Lead): string {
  return lead.session?.status || lead.status || "pending"
}

export function getLeadRating(lead: Lead): number {
  return lead.session?.rating ?? lead.rating ?? 0
}

export function getLeadInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2)
}

export function getCollectedDataFirst(
  collectedData: Record<string, unknown> | Record<string, unknown>[] | null | undefined
): Record<string, unknown> {
  if (!collectedData) return {}
  if (Array.isArray(collectedData)) return collectedData[0] || {}
  return collectedData
}

export function getLeadSource(lead: Lead): string {
  const collectedData = getCollectedDataFirst(lead.session?.collectedData)
  if (typeof collectedData?.source === "string") return collectedData.source
  if (lead.phone) return "whatsapp"
  if (lead.email) return "email"
  return ""
}

export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}
