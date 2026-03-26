import type { Lead } from "./types"
import { mockLeads } from "./mock-data"

let leads: Lead[] = mockLeads

function cleanupOldDeclinedLeads() {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  
  leads = leads.filter(lead => {
    if (lead.status !== "declined") return true
    const declinedDate = new Date(lead.updatedAt)
    return declinedDate > oneMonthAgo
  })
}

cleanupOldDeclinedLeads()

export function getAllLeads(): Lead[] {
  return leads
}

export function getLeadById(id: string): Lead | undefined {
  return leads.find((lead) => lead.id === id)
}

export function updateLead(id: string, updates: Partial<Lead>): Lead | undefined {
  const index = leads.findIndex((lead) => lead.id === id)
  if (index === -1) return undefined
  
  leads[index] = { ...leads[index], ...updates, updatedAt: new Date().toISOString() }
  return leads[index]
}

export function deleteLead(id: string): boolean {
  const index = leads.findIndex((lead) => lead.id === id)
  if (index === -1) return false
  
  leads = leads.filter((lead) => lead.id !== id)
  return true
}

export function addLead(lead: Omit<Lead, "id" | "createdAt" | "updatedAt">): Lead {
  const newLead: Lead = {
    ...lead,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  leads.unshift(newLead)
  return newLead
}
