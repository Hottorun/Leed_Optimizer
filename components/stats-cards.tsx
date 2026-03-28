"use client"

import { Users, Clock, CheckCircle, XCircle } from "lucide-react"
import type { Lead } from "@/lib/types"

interface StatsCardsProps {
  leads: Lead[]
}

export function StatsCards({ leads }: StatsCardsProps) {
  const total = leads.length
  const pending = leads.filter((l) => l.status === "pending").length
  const approved = leads.filter((l) => l.status === "approved").length
  const declined = leads.filter((l) => l.status === "declined").length

  const stats = [
    { label: "Total", value: total, icon: Users },
    { label: "Pending", value: pending, icon: Clock },
    { label: "Approved", value: approved, icon: CheckCircle },
    { label: "Declined", value: declined, icon: XCircle },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
              </div>
              <Icon className="h-5 w-5 text-muted-foreground/50" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
