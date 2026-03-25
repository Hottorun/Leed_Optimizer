"use client"

import { Users, Clock, CheckCircle, XCircle, Filter, MessageCircle, Mail, Globe } from "lucide-react"
import type { Lead, LeadStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StatsCardsProps {
  leads: Lead[]
  onStatsClick: (status: LeadStatus | null) => void
  onPlatformClick?: (platform: "whatsapp" | "email" | "all") => void
  activeStatus: LeadStatus | null
  activePlatform?: "whatsapp" | "email" | "all"
}

export function StatsCards({ leads, onStatsClick, activeStatus, onPlatformClick, activePlatform }: StatsCardsProps) {
  const total = leads.length
  const pending = leads.filter((l) => l.session?.status === "active").length
  const approved = leads.filter((l) => l.session?.rating === true).length
  const declined = leads.filter((l) => l.session?.rating === false).length
  const unrelated = leads.filter((l) => l.session?.rating === false).length
  const whatsappLeads = leads.filter((l) => l.session?.collectedData?.contactPlatform === "whatsapp").length
  const emailLeads = leads.filter((l) => l.session?.collectedData?.contactPlatform === "email").length

  const stats: {
    label: string
    value: number
    icon: typeof Users
    color: string
    bgColor: string
    status: LeadStatus | null
  }[] = [
    {
      label: "Total Leads",
      value: total,
      icon: Users,
      color: "text-foreground",
      bgColor: "bg-secondary",
      status: null,
    },
    {
      label: "Pending Review",
      value: pending,
      icon: Clock,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      status: "pending",
    },
    {
      label: "Approved",
      value: approved,
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
      status: "approved",
    },
    {
      label: "Declined",
      value: declined,
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      status: "declined",
    },
  ]

  const platformStats: {
    label: string
    value: number
    icon: typeof Globe
    color: string
    bgColor: string
  }[] = [
    {
      label: "All Platforms",
      value: total,
      icon: Globe,
      color: "text-foreground",
      bgColor: "bg-secondary",
    },
    {
      label: "WhatsApp",
      value: whatsappLeads,
      icon: MessageCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Email",
      value: emailLeads,
      icon: Mail,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon
          const isActive = activeStatus === stat.status
          return (
            <button
              key={stat.label}
              onClick={() => onStatsClick(stat.status)}
              className={cn(
                "rounded-xl border bg-card p-4 text-left transition-all cursor-pointer hover:border-primary/50",
                isActive ? "border-primary ring-1 ring-primary" : "border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-xl font-semibold text-card-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </button>
          )
        })}
        
        {/* Unrelated - shown separately */}
        <button
          onClick={() => onStatsClick("unrelated")}
          className={cn(
            "rounded-xl border bg-card p-4 text-left transition-all cursor-pointer hover:border-primary/50",
            activeStatus === "unrelated" ? "border-primary ring-1 ring-primary" : "border-border"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Unrelated</p>
              <p className="mt-1 text-xl font-semibold text-card-foreground">
                {unrelated}
              </p>
            </div>
            <div className="rounded-lg p-2 bg-muted/50">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </button>
      </div>
      
      {/* Platform Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {platformStats.map((stat) => {
          const Icon = stat.icon
          const platformKey = stat.label === "All Platforms" ? "all" : stat.label.toLowerCase() as "whatsapp" | "email"
          const isActive = activePlatform === platformKey
          return (
            <button
              key={stat.label}
              onClick={() => onPlatformClick?.(platformKey)}
              className={cn(
                "rounded-xl border bg-card p-4 text-left transition-all cursor-pointer hover:shadow-sm",
                isActive 
                  ? "border-green-500" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label} Leads</p>
                  <p className="mt-1 text-xl font-semibold text-card-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
