"use client"

import { useState } from "react"
import useSWR from "swr"
import { AppHeader } from "@/components/app-header"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"
import { Clock, CheckCircle, XCircle, Heart, ChevronRight } from "lucide-react"
import type { Lead } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type FunnelStage = "manual" | "approved" | "declined"

const stages: { id: FunnelStage; name: string; icon: typeof Clock; bgColor: string }[] = [
  { id: "manual", name: "Review", icon: Clock, bgColor: "bg-slate-100" },
  { id: "approved", name: "Approved", icon: CheckCircle, bgColor: "bg-slate-100" },
  { id: "declined", name: "Declined", icon: XCircle, bgColor: "bg-slate-100" },
]

export default function KanbanPage() {
  const { data: leads = [] } = useSWR<Lead[]>("/api/leads", fetcher)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const getLeadsByStage = (stage: FunnelStage) => {
    return leads.filter((lead) => lead.status === stage)
  }

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2)
  }

  const renderLeadCard = (lead: Lead) => {
    return (
      <button
        key={lead.id}
        onClick={() => setSelectedLead(lead)}
        className={cn(
          "w-full text-left p-3 rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700",
          "hover:shadow-md transition-all cursor-pointer"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            lead.isLoyal 
              ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200" 
              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200"
          )}>
            {getInitials(lead.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{lead.name}</p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{lead.workType}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
        </div>
      </button>
    )
  }

  return (
    <ThemeBackground>
      <AppHeader onRefresh={() => {}} isRefreshing={false} />

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Lead Funnel</h1>
          <p className="text-slate-500 mt-1">Kanban view of your leads by stage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stages.map((stage) => {
            const stageLeads = getLeadsByStage(stage.id)
            const Icon = stage.icon

            return (
              <div key={stage.id} className="flex flex-col">
                <div className={cn(
                  "flex items-center gap-3 p-4 rounded-t-xl border border-b-0",
                  stage.bgColor, "dark:bg-slate-800 dark:border-slate-700"
                )}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-slate-700">
                    <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100">{stage.name}</h2>
                    <p className="text-sm text-slate-500">{stageLeads.length} leads</p>
                  </div>
                </div>

                <div className={cn(
                  "flex-1 p-4 rounded-b-xl border space-y-3 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700 min-h-[400px]"
                )}>
                  {stageLeads.length > 0 ? (
                    stageLeads.map((lead) => renderLeadCard(lead))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                      <Icon className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">No leads</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ThemeBackground>
  )
}
