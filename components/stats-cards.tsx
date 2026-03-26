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
    {
      label: "Total Leads",
      value: total,
      icon: Users,
      color: "text-foreground",
      bgColor: "bg-secondary",
    },
    {
      label: "Pending Review",
      value: pending,
      icon: Clock,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      label: "Approved",
      value: approved,
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Declined",
      value: declined,
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold text-card-foreground">
                  {stat.value}
                </p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
