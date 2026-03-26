"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Clock, CheckCircle, XCircle, Star, TrendingUp, Users, MessageCircle, Mail, Hand, Download, FileText, Calendar } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import pdfMake from "pdfmake/build/pdfmake"
import { cn } from "@/lib/utils"
import type { Lead } from "@/lib/types"
import html2canvas from "html2canvas"

interface AnalyticsProps {
  leads: Lead[]
}

export function Analytics({ leads }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week")
  const [downloading, setDownloading] = useState(false)
  const [uiStyle, setUIStyle] = useState<"colored" | "minimal">("colored")
  const growthChartRef = useRef<HTMLDivElement>(null)
  const sourceChartRef = useRef<HTMLDivElement>(null)
  const statusChartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedStyle = (localStorage.getItem("uiStyle") || "colored") as "colored" | "minimal"
    setUIStyle(savedStyle)
  }, [])

  const getLeadStatus = (lead: Lead) => lead.session?.status || lead.status || "pending"
  const getLeadRating = (lead: Lead) => lead.session?.rating ?? lead.rating ?? 0
  const getLeadSource = (lead: Lead) => {
    if (lead.phone) return "whatsapp"
    if (lead.email) return "email"
    return "manual"
  }

  const pending = leads.filter(l => getLeadStatus(l) === "pending")
  const approved = leads.filter(l => getLeadStatus(l) === "approved")
  const declined = leads.filter(l => getLeadStatus(l) === "declined")
  const manual = leads.filter(l => getLeadStatus(l) === "manual")

  const whatsappLeads = leads.filter(l => getLeadSource(l) === "whatsapp")
  const emailLeads = leads.filter(l => getLeadSource(l) === "email")

  const avgRating = leads.length > 0 
    ? (leads.reduce((sum, l) => sum + getLeadRating(l), 0) / leads.length).toFixed(1)
    : "0"

  const approvalRate = leads.length > 0
    ? Math.round((approved.length / leads.length) * 100)
    : 0

  const statCards = [
    { label: "Total Leads", value: leads.length, icon: Users, coloredBg: "bg-blue-600", coloredIcon: "text-white", minimalBg: "bg-slate-600", minimalIcon: "text-white" },
    { label: "Pending", value: pending.length, icon: Clock, coloredBg: "bg-amber-500", coloredIcon: "text-white", minimalBg: "bg-slate-500", minimalIcon: "text-white" },
    { label: "Approved", value: approved.length, icon: CheckCircle, coloredBg: "bg-green-600", coloredIcon: "text-white", minimalBg: "bg-slate-600", minimalIcon: "text-white" },
    { label: "Declined", value: declined.length, icon: XCircle, coloredBg: "bg-red-500", coloredIcon: "text-white", minimalBg: "bg-slate-400", minimalIcon: "text-white" },
    { label: "Avg Rating", value: avgRating, icon: Star, coloredBg: "bg-purple-500", coloredIcon: "text-white", minimalBg: "bg-slate-500", minimalIcon: "text-white", suffix: "/5" },
    { label: "Approval Rate", value: `${approvalRate}%`, icon: TrendingUp, coloredBg: "bg-indigo-600", coloredIcon: "text-white", minimalBg: "bg-slate-600", minimalIcon: "text-white" },
  ]

  const sourceData = [
    { source: "WhatsApp", count: whatsappLeads.length, coloredBg: "bg-green-500", minimalBg: "bg-slate-500", icon: MessageCircle },
    { source: "Email", count: emailLeads.length, coloredBg: "bg-blue-500", minimalBg: "bg-slate-400", icon: Mail },
    { source: "Manual", count: manual.length, coloredBg: "bg-purple-500", minimalBg: "bg-slate-600", icon: Hand },
  ]

  const ratingDistribution = [
    { rating: 5, count: leads.filter(l => getLeadRating(l) === 5).length, width: leads.length > 0 ? (leads.filter(l => getLeadRating(l) === 5).length / leads.length) * 100 : 0 },
    { rating: 4, count: leads.filter(l => getLeadRating(l) === 4).length, width: leads.length > 0 ? (leads.filter(l => getLeadRating(l) === 4).length / leads.length) * 100 : 0 },
    { rating: 3, count: leads.filter(l => getLeadRating(l) === 3).length, width: leads.length > 0 ? (leads.filter(l => getLeadRating(l) === 3).length / leads.length) * 100 : 0 },
    { rating: 2, count: leads.filter(l => getLeadRating(l) === 2).length, width: leads.length > 0 ? (leads.filter(l => getLeadRating(l) === 2).length / leads.length) * 100 : 0 },
    { rating: 1, count: leads.filter(l => getLeadRating(l) === 1).length, width: leads.length > 0 ? (leads.filter(l => getLeadRating(l) === 1).length / leads.length) * 100 : 0 },
  ]

  const growthData = useMemo(() => {
    const now = new Date()
    const data: { date: string; leads: number; approved: number; pending: number }[] = []
    
    let days = 7
    if (timeRange === "month") days = 30
    if (timeRange === "all") days = Math.min(90, Math.max(...leads.map(l => Math.floor((now.getTime() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24)))))
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      
      const leadsByDate = leads.filter(l => {
        const leadDate = new Date(l.createdAt)
        return leadDate.toDateString() === date.toDateString()
      })
      
      const cumulativeLeads = leads.filter(l => new Date(l.createdAt) <= date).length
      const cumulativeApproved = approved.filter(l => new Date(l.createdAt) <= date).length
      const cumulativePending = leads.filter(l => new Date(l.createdAt) <= date && getLeadStatus(l) === "pending").length
      
      data.push({
        date: dateStr,
        leads: cumulativeLeads,
        approved: cumulativeApproved,
        pending: cumulativePending,
      })
    }
    
    return data
  }, [leads, timeRange, approved])

  const captureCharts = async () => {
    const chartRefs = [growthChartRef, sourceChartRef, statusChartRef]
    const images: string[] = []
    
    for (const ref of chartRefs) {
      if (ref.current) {
        let iframe: HTMLIFrameElement | null = null
        
        try {
          iframe = document.createElement('iframe')
          iframe.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;height:600px;'
          document.body.appendChild(iframe)
          
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
          if (!iframeDoc) throw new Error('Cannot access iframe document')
          
          iframeDoc.open()
          iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #ffffff; padding: 20px; font-family: system-ui, sans-serif; }
              </style>
            </head>
            <body></body>
            </html>
          `)
          iframeDoc.close()
          
          const clone = ref.current.cloneNode(true) as HTMLElement
          clone.style.backgroundColor = '#ffffff'
          clone.querySelectorAll('svg').forEach(svg => {
            svg.removeAttribute('class')
          })
          iframeDoc.body.appendChild(clone)
          
          await new Promise(resolve => setTimeout(resolve, 100))
          
          const canvas = await html2canvas(clone, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: iframeDoc.documentElement.scrollWidth,
            windowHeight: iframeDoc.documentElement.scrollHeight,
          })
          
          document.body.removeChild(iframe)
          
          const dataUrl = canvas.toDataURL('image/png')
          if (dataUrl && dataUrl.length > 100) {
            images.push(dataUrl)
          } else {
            images.push('')
          }
        } catch (error) {
          console.error('Error capturing chart:', error)
          if (iframe && document.body.contains(iframe)) {
            document.body.removeChild(iframe)
          }
          images.push('')
        }
      } else {
        images.push('')
      }
    }
    
    return images
  }

  const handleDownloadPDF = async () => {
    setDownloading(true)
    
    try {
      const [growthImage, sourceImage, statusImage] = await captureCharts()
      
      const content: any[] = [
        {
          text: `Generated: ${new Date().toLocaleDateString()}`,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e2e8f0' }],
          margin: [0, 0, 0, 20]
        },
        {
          text: 'Summary',
          style: 'sectionHeader'
        },
        {
          table: {
            headerRows: 0,
            widths: ['*', 'auto'],
            body: [
              [{ text: 'Metric', bold: true }, { text: 'Value', bold: true }],
              ['Total Leads', leads.length.toString()],
              ['Pending', pending.length.toString()],
              ['Approved', approved.length.toString()],
              ['Declined', declined.length.toString()],
              ['Average Rating', `${avgRating}/5`],
              ['Approval Rate', `${approvalRate}%`],
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 10, 0, 20]
        },
      ]

      if (growthImage) {
        content.push(
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e2e8f0' }], margin: [0, 0, 0, 20] },
          { text: 'Lead Growth Trend', style: 'sectionHeader' },
          { image: growthImage, width: 500, alignment: 'center', margin: [0, 10, 0, 20] }
        )
      }

      content.push(
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e2e8f0' }], margin: [0, 0, 0, 20] },
        { text: 'Source Breakdown', style: 'sectionHeader' }
      )

      if (sourceImage) {
        content.push({ image: sourceImage, width: 400, alignment: 'center', margin: [0, 10, 0, 10] })
      }

      content.push(
        { text: [{ text: 'WhatsApp: ', bold: true }, `${whatsappLeads.length} leads (${leads.length > 0 ? Math.round(whatsappLeads.length / leads.length * 100) : 0}%)`], margin: [0, 5, 0, 5] },
        { text: [{ text: 'Email: ', bold: true }, `${emailLeads.length} leads (${leads.length > 0 ? Math.round(emailLeads.length / leads.length * 100) : 0}%)`], margin: [0, 0, 0, 20] },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e2e8f0' }], margin: [0, 0, 0, 20] },
        { text: 'Rating Distribution', style: 'sectionHeader' },
        { text: [{ text: '5 Stars: ', bold: true }, `${ratingDistribution[0].count} leads`], margin: [0, 5, 0, 2] },
        { text: [{ text: '4 Stars: ', bold: true }, `${ratingDistribution[1].count} leads`], margin: [0, 0, 0, 2] },
        { text: [{ text: '3 Stars: ', bold: true }, `${ratingDistribution[2].count} leads`], margin: [0, 0, 0, 2] },
        { text: [{ text: '2 Stars: ', bold: true }, `${ratingDistribution[3].count} leads`], margin: [0, 0, 0, 2] },
        { text: [{ text: '1 Star: ', bold: true }, `${ratingDistribution[4].count} leads`], margin: [0, 0, 0, 20] }
      )

      if (statusImage) {
        content.push(
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e2e8f0' }], margin: [0, 0, 0, 20] },
          { text: 'Status Distribution', style: 'sectionHeader' },
          { image: statusImage, width: 300, alignment: 'center', margin: [0, 10, 0, 20] }
        )
      }

      content.push(
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e2e8f0' }], margin: [0, 0, 0, 20] },
        { text: 'Recent Leads', style: 'sectionHeader' },
        { ul: leads.slice(0, 10).map((lead, i) => `${i + 1}. ${lead.name} - ${getLeadStatus(lead)} - ${getLeadRating(lead)}/5 stars`), margin: [0, 10, 0, 0] }
      )

      const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        header: {
          text: 'Aclea Analytics Report',
          style: 'header',
          alignment: 'center',
          margin: [0, 20, 0, 10]
        },
        footer: function(currentPage: number, pageCount: number) {
          return {
            text: `Generated by Aclea Lead Management System - Page ${currentPage} of ${pageCount}`,
            alignment: 'center',
            margin: [0, 20, 0, 0],
            style: 'footer'
          }
        },
        content,
        styles: {
          header: {
            fontSize: 24,
            color: '#2563eb',
            bold: true
          },
          subheader: {
            fontSize: 12,
            color: '#64748b'
          },
          sectionHeader: {
            fontSize: 16,
            color: '#1e293b',
            bold: true
          },
          footer: {
            fontSize: 10,
            color: '#94a3b8'
          }
        },
        defaultStyle: {
          fontSize: 12,
          color: '#475569'
        }
      }

      pdfMake.createPdf(docDefinition).download(`aclea-analytics-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Analytics</h1>
          <p className="text-slate-500 mt-1">Track your lead performance</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 bg-white rounded-lg border border-slate-200 p-1">
            {(["week", "month", "all"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  timeRange === range
                    ? uiStyle === "minimal" ? "bg-slate-600 text-white" : "bg-blue-100 text-blue-700"
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
              downloading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : uiStyle === "minimal" ? "bg-slate-600 text-white hover:bg-slate-700" : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            {downloading ? (
              <>
                <div className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Report
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("p-2 rounded-lg", uiStyle === "minimal" ? stat.minimalBg : stat.coloredBg)}>
                  <Icon className={cn("h-4 w-4", uiStyle === "minimal" ? stat.minimalIcon : stat.coloredIcon)} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}{stat.suffix}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className={cn("h-5 w-5", uiStyle === "minimal" ? "text-slate-600" : "text-blue-500")} />
          <h3 className="text-lg font-semibold text-slate-800">Lead Growth</h3>
        </div>
        <div className="h-72" ref={growthChartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={uiStyle === "minimal" ? "#64748b" : "#3b82f6"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={uiStyle === "minimal" ? "#64748b" : "#3b82f6"} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={uiStyle === "minimal" ? "#64748b" : "#10b981"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={uiStyle === "minimal" ? "#64748b" : "#10b981"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#fff", 
                  border: "1px solid #e2e8f0", 
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                }}
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke={uiStyle === "minimal" ? "#64748b" : "#3b82f6"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLeads)"
                name="Total Leads"
              />
              <Area
                type="monotone"
                dataKey="approved"
                stroke={uiStyle === "minimal" ? "#64748b" : "#10b981"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorApproved)"
                name="Approved"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", uiStyle === "minimal" ? "bg-slate-500" : "bg-blue-500")} />
            <span className="text-sm text-slate-600">Total Leads</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", uiStyle === "minimal" ? "bg-slate-500" : "bg-green-500")} />
            <span className="text-sm text-slate-600">Approved</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Leads by Source</h3>
          <div className="h-64" ref={sourceChartRef}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData.map(d => ({ name: d.source, value: d.count, color: uiStyle === "minimal" ? "#64748b" : "#3b82f6" }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    border: "1px solid #e2e8f0", 
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                />
                <Bar dataKey="value" fill={uiStyle === "minimal" ? "#64748b" : "#3b82f6"} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {ratingDistribution.map((item) => (
              <div key={item.rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${item.width}%` }}
                  />
                </div>
                <span className="text-sm text-slate-600 w-8 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Status Overview</h3>
          <div className="h-64" ref={statusChartRef}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Approved', value: approved.length, color: uiStyle === "minimal" ? '#64748b' : '#3b82f6' },
                    { name: 'Pending', value: pending.length, color: uiStyle === "minimal" ? '#64748b' : '#f59e0b' },
                    { name: 'Manual', value: manual.length, color: uiStyle === "minimal" ? '#64748b' : '#8b5cf6' },
                    { name: 'Declined', value: declined.length, color: uiStyle === "minimal" ? '#64748b' : '#64748b' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {[
                    { color: uiStyle === "minimal" ? '#64748b' : '#3b82f6' },
                    { color: uiStyle === "minimal" ? '#64748b' : '#f59e0b' },
                    { color: uiStyle === "minimal" ? '#64748b' : '#8b5cf6' },
                    { color: '#64748b' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    border: "1px solid #e2e8f0", 
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", uiStyle === "minimal" ? "bg-slate-500" : "bg-blue-500")} />
              <span className="text-sm text-slate-600">Approved ({approved.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", uiStyle === "minimal" ? "bg-slate-500" : "bg-amber-500")} />
              <span className="text-sm text-slate-600">Pending ({pending.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", uiStyle === "minimal" ? "bg-slate-500" : "bg-purple-500")} />
              <span className="text-sm text-slate-600">Manual ({manual.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <span className="text-sm text-slate-600">Declined ({declined.length})</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className={cn("h-5 w-5", uiStyle === "minimal" ? "text-slate-600" : "text-blue-500")} />
            <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold", uiStyle === "minimal" ? "bg-slate-200 text-slate-700" : "bg-blue-100 text-blue-700")}>
                  {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.workType}</p>
                </div>
                <span className={cn("text-xs px-2 py-1 rounded-full", uiStyle === "minimal" ? "bg-slate-200 text-slate-700" : 
                  getLeadStatus(lead) === "approved" ? "bg-blue-100 text-blue-700" :
                  getLeadStatus(lead) === "pending" ? "bg-amber-100 text-amber-700" :
                  getLeadStatus(lead) === "manual" ? "bg-purple-100 text-purple-700" :
                  "bg-slate-100 text-slate-600"
                )}>
                  {getLeadStatus(lead)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
