"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { useProfile } from "@/lib/use-profile"
import { useUser } from "@/lib/use-user"
import { cn } from "@/lib/utils"
import { 
  Zap, TrendingUp, Clock, Heart, Star, ArrowRight,
  ChevronRight, Sparkles, Target, AlertCircle, CheckCircle
} from "lucide-react"
import type { Lead } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function TopPage() {
  const { data: leads = [] } = useSWR<Lead[]>("/api/leads", fetcher)
  const { profile } = useProfile()
  const { user } = useUser()
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const aiRecommendations = useMemo(() => {
    const activeLeads = leads.filter(l => {
      const session = l.session
      return session?.status === "active" && session?.currentStep !== "completed" && session?.currentStep !== "cancelled"
    })
    
    const sortedActiveLeads = [...activeLeads].sort((a, b) => {
      const aRating = a.session?.rating ?? 0
      const bRating = b.session?.rating ?? 0
      if (bRating !== aRating) return bRating - aRating
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    const topLeads = sortedActiveLeads.slice(0, 3)
    
    const urgentLeads = [...leads]
      .filter(l => {
        const session = l.session
        const rating = session?.rating ?? 0
        const updatedAt = new Date(l.updatedAt)
        const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceUpdate > 2 || rating >= 4
      })
      .sort((a, b) => {
        const aRating = a.session?.rating ?? 0
        const bRating = b.session?.rating ?? 0
        const aUpdated = new Date(a.updatedAt).getTime()
        const bUpdated = new Date(b.updatedAt).getTime()
        if (bRating !== aRating) return bRating - aRating
        return bUpdated - aUpdated
      })
      .slice(0, 3)

    return { 
      topLeads, 
      urgentLeads, 
      totalLeads: leads.length, 
      newToday: leads.filter(l => {
        const today = new Date()
        const created = new Date(l.createdAt)
        return created.toDateString() === today.toDateString()
      }).length,
      needsReview: activeLeads.length,
      priority: leads.filter(l => l.isLoyal).length
    }
  }, [leads])

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2)
  }

  const getRating = (lead: Lead): number => {
    return lead.session?.rating ?? 0
  }

  const getAiCta = (lead: Lead) => {
    const rating = getRating(lead)
    if (rating >= 4) return "Contact today"
    if (rating >= 3) return "Schedule follow-up"
    return "Send newsletter"
  }

  const renderLeadCard = (lead: Lead, index?: number) => (
    <button
      key={lead.id}
      onClick={() => setSelectedLead(lead)}
      className={cn(
        "w-full text-left p-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800",
        "hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-500 transition-all cursor-pointer"
      )}
    >
      <div className="flex items-center gap-3">
        {index !== undefined && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-bold">
            {index + 1}
          </div>
        )}
        <div className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          lead.isLoyal 
            ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200" 
            : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200"
        )}>
          {getInitials(lead.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{lead.name}</p>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{lead.phone}</p>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn(
              "h-3.5 w-3.5", i < getRating(lead) ? "text-slate-500 fill-slate-500" : "text-slate-300"
            )} />
          ))}
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={cn(
          "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border",
          getRating(lead) >= 4 
            ? "border-indigo-200 bg-indigo-50 text-indigo-600" 
            : getRating(lead) >= 3 
              ? "border-blue-200 bg-blue-50 text-blue-600"
              : "border-slate-200 bg-slate-50 text-slate-500"
        )}>
          <Sparkles className="h-3 w-3" />
          {getRating(lead) >= 4 ? "High priority" : getRating(lead) >= 3 ? "Medium priority" : "Nurture"}
        </span>
        <span className={cn(
          "text-xs font-medium",
          getRating(lead) >= 4 
            ? "text-indigo-500" 
            : getRating(lead) >= 3 
              ? "text-blue-500"
              : "text-slate-400"
        )}>{getAiCta(lead)}</span>
      </div>
    </button>
  )

  return (
    <ThemeBackground>
      <AppHeader onRefresh={() => {}} isRefreshing={false} user={user ? { name: user.name, email: user.email } : undefined} />

      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 mb-4">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-600">AI-Powered Lead Management</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"},{" "}
            {user?.name?.split(' ')[0] || profile.firstName}
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Here's your lead overview for today</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row">
            <div className="flex items-center gap-4 px-6 py-5 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 flex-1">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700">
                <Target className="h-6 w-6 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Leads</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{aiRecommendations.totalLeads}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 py-5 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 flex-1">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700">
                <TrendingUp className="h-6 w-6 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">New Today</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{aiRecommendations.newToday}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 py-5 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 flex-1">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700">
                <Clock className="h-6 w-6 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Sessions</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{aiRecommendations.needsReview}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 py-5 flex-1">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700">
                <Heart className="h-6 w-6 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Priority</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{aiRecommendations.priority}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-indigo-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <Zap className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100">Top 3 Leads</h2>
                    <p className="text-sm text-slate-500">Highest rated, active sessions</p>
                  </div>
                </div>
                <Link href="/leads" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {aiRecommendations.topLeads.length > 0 ? (
                aiRecommendations.topLeads.map((lead, index) => renderLeadCard(lead, index))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active leads</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-amber-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100">Needs Attention</h2>
                    <p className="text-sm text-slate-500">Overdue or high-value leads</p>
                  </div>
                </div>
                <Link href="/leads" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {aiRecommendations.urgentLeads.length > 0 ? (
                aiRecommendations.urgentLeads.map((lead) => renderLeadCard(lead))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ThemeBackground>
  )
}
