"use client"

import Link from "next/link"
import { Clock, CheckCircle, XCircle, UserCheck } from "lucide-react"
import type { Lead, LeadStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BigStatsHeaderProps {
  leads: Lead[]
  onFilterClick: (filter: LeadStatus | null) => void
  activeFilter: LeadStatus | null
  companyName?: string
}

export function BigStatsHeader({ leads, onFilterClick, activeFilter, companyName }: BigStatsHeaderProps) {
  const getStatus = (lead: Lead): string => {
    return lead.session?.status || lead.status || "pending"
  }

  const pending = leads.filter((l) => getStatus(l) === "pending").length
  const approved = leads.filter((l) => getStatus(l) === "approved").length
  const declined = leads.filter((l) => getStatus(l) === "declined").length
  const review = leads.filter((l) => getStatus(l) === "manual").length
  const whatsapp = leads.filter((l) => l.source === "whatsapp" || l.phone).length
  const email = leads.filter((l) => l.source === "email" || l.email).length

  const stats = [
    { icon: Clock, value: pending, label: "Pending", filter: "pending" as LeadStatus },
    { icon: CheckCircle, value: approved, label: "Approved", filter: "approved" as LeadStatus },
    { icon: XCircle, value: declined, label: "Declined", filter: "declined" as LeadStatus },
    { icon: UserCheck, value: review, label: "Review", filter: "manual" as LeadStatus },
  ]

  return (
    <div className="border-b border-border bg-background">
      <div className="px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Welcome back{companyName ? `, ${companyName}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and track your leads</p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">{whatsapp} WhatsApp</span>
              <span className="text-border">|</span>
              <span className="text-muted-foreground">{email} Email</span>
            </div>

            <div className="flex items-center rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => onFilterClick(null)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm transition-colors",
                  activeFilter === null
                    ? "bg-foreground text-background"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="font-semibold">{leads.length}</span>
                <span>All</span>
              </button>

              {stats.map((stat) => {
                const Icon = stat.icon
                const isActive = activeFilter === stat.filter

                return (
                  <button
                    key={stat.label}
                    onClick={() => onFilterClick(stat.filter)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm border-l border-border transition-colors",
                      isActive
                        ? "bg-foreground text-background"
                        : "bg-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="font-semibold">{stat.value}</span>
                    <span className="hidden sm:inline">{stat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
