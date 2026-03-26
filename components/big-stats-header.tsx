"use client"

import { Clock, CheckCircle, XCircle, UserCheck, MessageCircle, Mail } from "lucide-react"
import type { Lead, LeadStatus } from "@/lib/types"

interface BigStatsHeaderProps {
  leads: Lead[]
  onFilterClick: (filter: LeadStatus | null) => void
  activeFilter: LeadStatus | null
  companyName?: string
}

export function BigStatsHeader({ leads, onFilterClick, activeFilter, companyName }: BigStatsHeaderProps) {
  const pending = leads.filter((l) => l.status === "pending").length
  const approved = leads.filter((l) => l.status === "approved").length
  const declined = leads.filter((l) => l.status === "declined").length
  const manual = leads.filter((l) => l.status === "manual").length
  const whatsapp = leads.filter((l) => l.source === "whatsapp").length
  const email = leads.filter((l) => l.source === "email").length

  const stats = [
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      iconBg: "bg-amber-500",
      filter: "pending" as LeadStatus,
    },
    {
      label: "Manual Review",
      value: manual,
      icon: UserCheck,
      iconBg: "bg-purple-500",
      filter: "manual" as LeadStatus,
    },
    {
      label: "Approved",
      value: approved,
      icon: CheckCircle,
      iconBg: "bg-blue-600",
      filter: "approved" as LeadStatus,
    },
    {
      label: "Declined",
      value: declined,
      icon: XCircle,
      iconBg: "bg-slate-400",
      filter: "declined" as LeadStatus,
    },
  ]

  const sourceStats = [
    {
      label: "WhatsApp",
      value: whatsapp,
      icon: MessageCircle,
      color: "text-emerald-500",
    },
    {
      label: "Email",
      value: email,
      icon: Mail,
      color: "text-blue-400",
    },
  ]

  return (
    <div className="bg-gradient-to-br from-slate-50/80 to-blue-50/40 border-b border-slate-200/50 backdrop-blur-sm">
      <div className="px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Welcome back{companyName ? `, ${companyName}` : ""}
            </h1>
            <p className="text-slate-500 mt-1">Manage and track your leads</p>
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => onFilterClick(null)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 min-w-[140px] shadow-sm transition-all duration-200 shrink-0 ${
                activeFilter === null
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white border-slate-200 hover:shadow-md hover:border-blue-200 cursor-pointer"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                <span className="text-sm font-bold">{leads.length}</span>
              </div>
              <div className="text-left">
                <p className="text-base font-bold text-slate-800">All Leads</p>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">View All</p>
              </div>
            </button>

            {stats.map((stat) => {
              const Icon = stat.icon
              const isActive = activeFilter === stat.filter
              return (
                <button
                  key={stat.label}
                  onClick={() => onFilterClick(stat.filter)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 min-w-[130px] shadow-sm transition-all duration-200 cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-slate-200 hover:shadow-md hover:border-blue-200"
                  }`}
                >
                  <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-5 pt-5 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Sources</span>
          {sourceStats.map((stat) => {
            const Icon = stat.icon
            return (
              <button
                key={stat.label}
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors duration-200"
              >
                <Icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-sm font-medium">{stat.value}</span>
                <span className="text-xs text-slate-400">{stat.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
