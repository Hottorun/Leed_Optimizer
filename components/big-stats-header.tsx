"use client"

import Link from "next/link"
import { Clock, CheckCircle, XCircle, UserCheck, LayoutGrid } from "lucide-react"
import { useThemeGradient } from "@/lib/use-theme-gradient"
import type { Lead, LeadStatus } from "@/lib/types"

interface BigStatsHeaderProps {
  leads: Lead[]
  onFilterClick: (filter: LeadStatus | null) => void
  activeFilter: LeadStatus | null
  companyName?: string
}

export function BigStatsHeader({ leads, onFilterClick, activeFilter, companyName }: BigStatsHeaderProps) {
  const { gradientColors, currentUIStyle } = useThemeGradient()
  
  const theme = "blue"
  const colors = gradientColors[theme] || { from: "#f8fafc", to: "#e2e8f0" }

  const getStatus = (lead: Lead): string => {
    return lead.session?.status || lead.status || "pending"
  }
  
  const pending = leads.filter((l) => getStatus(l) === "pending").length
  const approved = leads.filter((l) => getStatus(l) === "approved").length
  const declined = leads.filter((l) => getStatus(l) === "declined").length
  const review = leads.filter((l) => getStatus(l) === "manual").length
  const whatsapp = leads.filter((l) => l.source === "whatsapp").length
  const email = leads.filter((l) => l.source === "email").length

  const total = leads.length || 1

  const stats = [
    { icon: Clock, value: pending, label: "Pending", filter: "pending" as LeadStatus },
    { icon: CheckCircle, value: approved, label: "Approved", filter: "approved" as LeadStatus },
    { icon: XCircle, value: declined, label: "Declined", filter: "declined" as LeadStatus },
    { icon: UserCheck, value: review, label: "Review", filter: "manual" as LeadStatus },
  ]

  return (
    <div 
      className="border-b border-slate-300 dark:border-slate-700"
      style={{ 
        background: currentUIStyle === "minimal" 
          ? undefined 
          : `linear-gradient(to bottom right, ${colors.from}, ${colors.to})` 
      }}
    >
      <div className="px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Welcome back{companyName ? `, ${companyName}` : ""}
            </h1>
            <p className="text-slate-600 mt-1">Manage and track your leads</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/kanban"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="font-medium">Kanban</span>
            </Link>

            <div className="flex items-stretch rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <button
                onClick={() => onFilterClick(null)}
                className={`flex items-center gap-3 px-5 py-3 transition-all cursor-pointer ${
                  activeFilter === null
                    ? "bg-slate-800 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className={`text-xl font-bold ${activeFilter === null ? "text-white" : "text-slate-800"}`}>
                  {leads.length}
                </span>
                <span className="text-sm font-medium">All</span>
              </button>

              {stats.map((stat, index) => {
                const Icon = stat.icon
                const isActive = activeFilter === stat.filter
                
                return (
                  <button
                    key={stat.label}
                    onClick={() => onFilterClick(stat.filter)}
                    className={`flex items-center gap-3 px-5 py-3 border-l border-slate-200 transition-all cursor-pointer ${
                      isActive
                        ? "bg-slate-800 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <div className="text-left">
                      <p className={`text-xl font-bold ${isActive ? "text-white" : "text-slate-800"}`}>{stat.value}</p>
                      <p className={`text-xs font-medium ${isActive ? "text-slate-300" : "text-slate-500"}`}>{stat.label}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Source Stats */}
        <div className="flex items-center gap-6 mt-4 py-3 border-t border-slate-200/50">
          <span className="text-sm text-slate-600">{whatsapp} from WhatsApp</span>
          <span className="text-slate-400">•</span>
          <span className="text-sm text-slate-600">{email} from Email</span>
        </div>
      </div>
    </div>
  )
}
