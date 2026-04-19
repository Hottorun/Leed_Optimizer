"use client"

import { useState, useMemo } from "react"
import { Download } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { cn } from "@/lib/utils"
import type { Lead } from "@/lib/types"
import { getSafeString } from "@/lib/lead-utils"
import { useTheme } from "next-themes"

interface AnalyticsProps {
  leads: Lead[]
}

export function Analytics({ leads }: AnalyticsProps) {
  const { theme } = useTheme()
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week")
  const isDark = theme === "dark"

  const getLeadStatus = (lead: Lead) => lead.session?.status || lead.status || "pending"
  const getLeadRating = (lead: Lead) => lead.session?.rating ?? lead.rating ?? 0

  const pending = leads.filter(l => getLeadStatus(l) === "pending")
  const approved = leads.filter(l => getLeadStatus(l) === "approved")
  const declined = leads.filter(l => getLeadStatus(l) === "declined")
  const manual = leads.filter(l => getLeadStatus(l) === "manual")

  const avgRating = leads.length > 0
    ? (leads.reduce((sum, l) => sum + getLeadRating(l), 0) / leads.length).toFixed(1)
    : "0"

  const approvalRate = leads.length > 0
    ? Math.round((approved.length / leads.length) * 100)
    : 0

  const statBlocks = [
    { label: "Total Leads", value: leads.length },
    { label: "Approved", value: approved.length },
    { label: "Pending", value: pending.length },
    { label: "Declined", value: declined.length },
    { label: "Avg Rating", value: `${avgRating}/5` },
    { label: "Approval Rate", value: `${approvalRate}%` },
  ]

  const getCollectedDataFirst = (collectedData: Record<string, unknown> | Record<string, unknown>[] | null | undefined): Record<string, unknown> => {
    if (!collectedData) return {}
    if (Array.isArray(collectedData)) return collectedData[0] || {}
    return collectedData
  }

  const getLeadSource = (lead: Lead): string => {
    const collectedData = getCollectedDataFirst(lead.session?.collectedData)
    if (typeof collectedData?.source === "string") return collectedData.source
    if (lead.phone) return "whatsapp"
    return "email"
  }

  const sourceData = useMemo(() => {
    const whatsappCount = leads.filter(l => getLeadSource(l) === 'whatsapp').length
    const emailCount = leads.filter(l => getLeadSource(l) === 'email').length
    return [
      { source: "WhatsApp", value: whatsappCount },
      { source: "Email", value: emailCount },
    ]
  }, [leads])

  const growthData = useMemo(() => {
    const now = new Date()
    const data: { date: string; leads: number; approved: number }[] = []

    let days = 7
    if (timeRange === "month") days = 30
    if (timeRange === "all") days = Math.min(90, Math.max(7, ...leads.map(l => Math.floor((now.getTime() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24)))))

    for (let i = days; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

      const cumulativeLeads = leads.filter(l => new Date(l.createdAt) <= date).length
      const cumulativeApproved = approved.filter(l => new Date(l.createdAt) <= date).length

      data.push({
        date: dateStr,
        leads: cumulativeLeads,
        approved: cumulativeApproved,
      })
    }

    return data
  }, [leads, timeRange, approved])

  const chartColor = isDark ? "#FAFAFA" : "#0A0A0A"
  const chartColorMuted = isDark ? "#71717A" : "#A3A3A3"
  const gridColor = isDark ? "#27272A" : "#F5F5F5"

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track your lead performance</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statBlocks.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Growth Chart */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">Lead Growth</h2>
          <div className="flex gap-0.5 rounded-md bg-muted p-0.5">
            {(["week", "month", "all"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded transition-colors",
                  timeRange === range
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke={gridColor} />
              <XAxis dataKey="date" stroke={chartColorMuted} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={chartColorMuted} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                  border: `1px solid ${isDark ? "#27272A" : "#E5E5E5"}`,
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: isDark ? "#FAFAFA" : "#0A0A0A",
                  boxShadow: "none"
                }}
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke={chartColor}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLeads)"
                name="Total Leads"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Source Breakdown */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium mb-4">By Source</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" stroke={gridColor} horizontal={false} />
                <XAxis type="number" stroke={chartColorMuted} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="source" type="category" stroke={chartColorMuted} fontSize={11} width={70} tickLine={false} axisLine={false} />
                <Bar dataKey="value" fill={chartColor} radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium mb-4">By Status</h2>
          <div className="flex items-center justify-between h-48">
            <div className="h-full flex items-center justify-center">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Approved', value: approved.length },
                      { name: 'Pending', value: pending.length },
                      { name: 'Manual', value: manual.length },
                      { name: 'Declined', value: declined.length },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill={chartColor} />
                    <Cell fill={chartColorMuted} />
                    <Cell fill="#A3A3A3" />
                    <Cell fill="#52525B" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                      border: `1px solid ${isDark ? "#27272A" : "#E5E5E5"}`,
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: isDark ? "#FAFAFA" : "#0A0A0A"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-foreground" />
                <span className="text-xs text-muted-foreground">Approved ({approved.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-muted-foreground" />
                <span className="text-xs text-muted-foreground">Pending ({pending.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#A3A3A3" }} />
                <span className="text-xs text-muted-foreground">Manual ({manual.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#52525B" }} />
                <span className="text-xs text-muted-foreground">Declined ({declined.length})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium mb-4">Insights</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Conversion Rate</span>
              <span className="text-sm font-semibold">{approvalRate}%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Average Rating</span>
              <span className="text-sm font-semibold">{avgRating}/5</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Pending Review</span>
              <span className="text-sm font-semibold">{pending.length + manual.length}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Total Leads</span>
              <span className="text-sm font-semibold">{leads.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
