"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Phone,
  Mail,
  CalendarIcon,
  Zap,
  Settings2,
  Trash2,
  User as UserIcon,
} from "lucide-react"
import type { Lead } from "@/lib/types"
import type { User } from "@/lib/use-user"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Appointment {
  id: string
  leadId: string
  leadName: string
  leadEmail: string
  type: "call" | "follow-up" | "consultation"
  day: number
  hour: number
  duration: number
}

interface DayHours {
  enabled: boolean
  start: number
  end: number
}

type WorkingHours = Record<number, DayHours>

interface ScheduleMember {
  id: string
  name: string
  role: string
  isMe: boolean
}

interface CalendarViewProps {
  leads: Lead[]
  currentUser: User
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SLOT_HEIGHT  = 64
const START_HOUR   = 8
const HOURS        = Array.from({ length: 13 }, (_, i) => i + START_HOUR)
const DAYS         = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i)

const DEFAULT_WORKING_HOURS: WorkingHours = {
  0: { enabled: true,  start: 8, end: 17 },
  1: { enabled: true,  start: 8, end: 17 },
  2: { enabled: true,  start: 8, end: 17 },
  3: { enabled: true,  start: 8, end: 17 },
  4: { enabled: true,  start: 8, end: 17 },
  5: { enabled: false, start: 9, end: 13 },
  6: { enabled: false, start: 9, end: 13 },
}

const TYPE_COLORS: Record<Appointment["type"], string> = {
  call:         "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
  "follow-up":  "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400",
  consultation: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
}

const TYPE_DOT: Record<Appointment["type"], string> = {
  call:         "bg-blue-500",
  "follow-up":  "bg-violet-500",
  consultation: "bg-emerald-500",
}

const TYPE_LABELS: Record<Appointment["type"], string> = {
  call:         "Call",
  "follow-up":  "Follow-up",
  consultation: "Consult",
}

const ROLE_BADGE: Record<string, string> = {
  owner:  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  admin:  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  member: "bg-muted text-muted-foreground",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatHour(h: number) {
  if (h === 0)  return "12 AM"
  if (h === 12) return "12 PM"
  if (h < 12)  return `${h} AM`
  return `${h - 12} PM`
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

function getLocalTimezone() {
  try {
    const tz     = Intl.DateTimeFormat().resolvedOptions().timeZone
    const offset = -new Date().getTimezoneOffset()
    const sign   = offset >= 0 ? "+" : "-"
    const h      = Math.floor(Math.abs(offset) / 60).toString().padStart(2, "0")
    const m      = (Math.abs(offset) % 60).toString().padStart(2, "0")
    return `${tz.replace(/_/g, " ")} (UTC${sign}${h}:${m})`
  } catch {
    return "UTC"
  }
}

function storageKey(memberId: string) {
  return `aclea_calendar_${memberId}`
}

function loadMemberData(memberId: string): { appointments: Appointment[]; workingHours: WorkingHours } {
  if (typeof window === "undefined") return { appointments: [], workingHours: DEFAULT_WORKING_HOURS }
  try {
    const raw = localStorage.getItem(storageKey(memberId))
    if (!raw) return { appointments: [], workingHours: DEFAULT_WORKING_HOURS }
    const parsed = JSON.parse(raw)
    return {
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
      workingHours: parsed.workingHours ?? DEFAULT_WORKING_HOURS,
    }
  } catch {
    return { appointments: [], workingHours: DEFAULT_WORKING_HOURS }
  }
}

function saveMemberData(memberId: string, appointments: Appointment[], workingHours: WorkingHours) {
  if (typeof window === "undefined") return
  localStorage.setItem(storageKey(memberId), JSON.stringify({ appointments, workingHours }))
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

// ─── Main Component ───────────────────────────────────────────────────────────

export function CalendarView({ leads, currentUser }: CalendarViewProps) {
  const [selectedMemberId, setSelectedMemberId] = useState(currentUser.id)
  const [weekOffset, setWeekOffset]             = useState(0)
  const [appointments, setAppointments]         = useState<Appointment[]>([])
  const [workingHours, setWorkingHours]         = useState<WorkingHours>(DEFAULT_WORKING_HOURS)
  const [showHoursPanel, setShowHoursPanel]     = useState(false)
  const [dragging, setDragging]                 = useState<string | null>(null)
  const [dragOver, setDragOver]                 = useState<{ day: number; hour: number } | null>(null)
  const [toast, setToast]                       = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [now, setNow]                           = useState(new Date())

  const scrollRef   = useRef<HTMLDivElement>(null)
  const resizingRef = useRef<{ id: string; startY: number; originalDuration: number } | null>(null)
  const localTz     = getLocalTimezone()

  // Team members
  const { data: membersData } = useSWR("/api/teams/members", fetcher, {
    onError: () => {},
    revalidateOnFocus: false,
  })
  const rawMembers: { id: string; name: string; role: string }[] = membersData?.members ?? []

  const scheduleMembers: ScheduleMember[] = [
    { id: currentUser.id, name: currentUser.name, role: currentUser.teamRole ?? "member", isMe: true },
    ...rawMembers
      .filter(m => m.id !== currentUser.id)
      .map(m => ({ id: m.id, name: m.name, role: m.role, isMe: false })),
  ]

  const selectedMember = scheduleMembers.find(m => m.id === selectedMemberId) ?? scheduleMembers[0]

  // ── Load member data when selection changes ──
  useEffect(() => {
    const data = loadMemberData(selectedMemberId)
    setAppointments(data.appointments)
    setWorkingHours(data.workingHours)
  }, [selectedMemberId])

  // ── Persist with debounce — the 300ms delay ensures cleanup cancels stale saves ──
  useEffect(() => {
    if (!selectedMemberId) return
    const timer = setTimeout(() => {
      saveMemberData(selectedMemberId, appointments, workingHours)
    }, 300)
    return () => clearTimeout(timer)
  }, [appointments, workingHours, selectedMemberId])

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (!scrollRef.current) return
    const top = ((now.getHours() + now.getMinutes() / 60) - START_HOUR) * SLOT_HEIGHT
    if (top > 0) scrollRef.current.scrollTop = Math.max(0, top - 150)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  // Resize mouse handlers
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const r = resizingRef.current
      if (!r) return
      const deltaSlots = Math.round((e.clientY - r.startY) / SLOT_HEIGHT)
      const newDuration = Math.max(1, r.originalDuration + deltaSlots)
      setAppointments(prev => prev.map(a => a.id === r.id ? { ...a, duration: newDuration } : a))
    }
    const onUp = () => { resizingRef.current = null }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
  }, [])

  const weekStart      = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7)
  const weekDays       = DAYS.map((_, i) => addDays(weekStart, i))
  const today          = new Date()
  const currentTimeTop = ((now.getHours() + now.getMinutes() / 60) - START_HOUR) * SLOT_HEIGHT

  const isWithinWorkingHours = useCallback((day: number, hour: number): boolean => {
    const dh = workingHours[day]
    if (!dh || !dh.enabled) return false
    return hour >= dh.start && hour < dh.end
  }, [workingHours])

  // ── Drag ──
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDragging(id)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", id)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, day: number, hour: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOver({ day, hour })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, day: number, hour: number) => {
    e.preventDefault()
    const id = e.dataTransfer.getData("text/plain")
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, day, hour } : a))
    setDragging(null)
    setDragOver(null)
    setToast(isWithinWorkingHours(day, hour) ? "Appointment rescheduled" : "⚠️ Moved outside working hours")
  }, [isWithinWorkingHours])

  const handleDragEnd = useCallback(() => {
    setDragging(null)
    setDragOver(null)
  }, [])

  const handleResizeStart = useCallback((id: string, startY: number, originalDuration: number) => {
    resizingRef.current = { id, startY, originalDuration }
  }, [])

  // ── Auto-schedule ──
  const autoSchedule = useCallback(() => {
    const eligible = leads
      .filter(l => {
        const status = l.session?.status || l.status
        return status === "approved" || (l.session?.rating ?? l.rating ?? 0) >= 4
      })
      .slice(0, 20)

    if (eligible.length === 0) { setToast("No approved leads to schedule"); return }

    const slots: { day: number; hour: number }[] = []
    for (let day = 0; day < 7; day++) {
      const dh = workingHours[day]
      if (!dh?.enabled) continue
      for (let hour = dh.start; hour < dh.end; hour++) slots.push({ day, hour })
    }

    if (slots.length === 0) { setToast("No working hours configured — enable at least one day"); return }

    const types: Appointment["type"][] = ["call", "follow-up", "consultation"]
    const newAppts: Appointment[] = []
    let slotIdx = 0

    for (const lead of eligible) {
      if (appointments.some(a => a.leadId === lead.id)) continue
      if (slotIdx >= slots.length) break
      const slot = slots[slotIdx]
      slotIdx += 2
      newAppts.push({
        id: generateId(),
        leadId: lead.id,
        leadName: lead.name,
        leadEmail: lead.email,
        type: types[newAppts.length % types.length],
        day: slot.day,
        hour: slot.hour,
        duration: 1,
      })
    }

    if (newAppts.length === 0) { setToast("All leads already scheduled"); return }
    setAppointments(prev => [...prev, ...newAppts])
    setToast(`Scheduled ${newAppts.length} appointment${newAppts.length > 1 ? "s" : ""}`)
  }, [leads, appointments, workingHours])

  // ── Working hours helpers ──
  const toggleDay = (day: number) =>
    setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }))

  const updateStart = (day: number, start: number) =>
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], start, end: Math.max(prev[day].end, start + 1) },
    }))

  const updateEnd = (day: number, end: number) =>
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], end, start: Math.min(prev[day].start, end - 1) },
    }))

  const clearSchedule = () => {
    setAppointments([])
    setShowClearConfirm(false)
    setToast(`${selectedMember.name}'s schedule cleared`)
  }

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Schedule and manage lead appointments</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowHoursPanel(v => !v)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors",
              showHoursPanel
                ? "bg-foreground text-background border-foreground"
                : "border-border bg-card hover:bg-muted"
            )}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Working Hours
          </button>

          {/* Clear schedule */}
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-sm hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors"
              title="Clear schedule"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-destructive/40 bg-destructive/5 text-sm">
              <span className="text-destructive text-xs font-medium">Clear {selectedMember.isMe ? "your" : `${selectedMember.name}'s`} schedule?</span>
              <button onClick={clearSchedule} className="px-2 py-0.5 rounded bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 transition-colors">Yes</button>
              <button onClick={() => setShowClearConfirm(false)} className="px-2 py-0.5 rounded border border-border text-xs hover:bg-muted transition-colors">No</button>
            </div>
          )}

          <button
            onClick={autoSchedule}
            className="flex items-center gap-2 px-3 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Schedule
          </button>
        </div>
      </div>

      {/* ── Team member selector (only shown when team has multiple members) ── */}
      {scheduleMembers.length > 1 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
            <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Team Schedules</span>
          </div>
          <div className="flex gap-2 p-3 overflow-x-auto">
            {scheduleMembers.map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all shrink-0",
                  selectedMemberId === member.id
                    ? "bg-foreground text-background border-foreground"
                    : "border-border bg-card hover:bg-muted"
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0",
                  selectedMemberId === member.id
                    ? "bg-background/20 text-background"
                    : "bg-muted text-foreground"
                )}>
                  {member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-medium truncate max-w-[100px]">
                    {member.isMe ? "You" : member.name}
                  </div>
                  <div className={cn(
                    "text-[10px] capitalize px-1 rounded mt-0.5 inline-block",
                    selectedMemberId === member.id
                      ? "text-background/60"
                      : ROLE_BADGE[member.role] ?? ROLE_BADGE.member
                  )}>
                    {member.role}
                  </div>
                </div>

                {/* Appointment count badge */}
                {(() => {
                  const count = loadMemberData(member.id).appointments.length
                  return count > 0 ? (
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0",
                      selectedMemberId === member.id
                        ? "bg-background/20 text-background"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  ) : null
                })()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Working Hours Panel ── */}
      {showHoursPanel && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-sm font-medium">
              Working Hours
              {!selectedMember.isMe && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">— {selectedMember.name}</span>
              )}
            </h2>
            <span className="ml-auto text-xs text-muted-foreground">
              AI will only schedule leads within these windows
            </span>
          </div>
          <div className="divide-y divide-border">
            {DAYS.map((day, i) => {
              const dh = workingHours[i]
              return (
                <div
                  key={day}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 transition-colors",
                    !dh.enabled && "opacity-50"
                  )}
                >
                  <button
                    onClick={() => toggleDay(i)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
                      dh.enabled ? "bg-foreground" : "bg-muted-foreground/30"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                      dh.enabled ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                  <span className="w-8 text-sm font-medium">{day}</span>
                  {dh.enabled ? (
                    <div className="flex items-center gap-2 flex-1">
                      <select
                        value={dh.start}
                        onChange={e => updateStart(i, Number(e.target.value))}
                        className="h-8 px-2 rounded-md border border-border bg-background text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-foreground/20"
                      >
                        {HOUR_OPTIONS.filter(h => h < dh.end).map(h => (
                          <option key={h} value={h}>{formatHour(h)}</option>
                        ))}
                      </select>
                      <span className="text-xs text-muted-foreground">to</span>
                      <select
                        value={dh.end}
                        onChange={e => updateEnd(i, Number(e.target.value))}
                        className="h-8 px-2 rounded-md border border-border bg-background text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-foreground/20"
                      >
                        {HOUR_OPTIONS.filter(h => h > dh.start).map(h => (
                          <option key={h} value={h}>{formatHour(h)}</option>
                        ))}
                      </select>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({dh.end - dh.start}h window)
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Day off</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Info bar ── */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/60 border border-border text-xs text-muted-foreground">
        <Zap className="h-3 w-3 shrink-0" />
        {!selectedMember.isMe
          ? <><span className="font-medium text-foreground">{selectedMember.name}&apos;s</span> schedule</>
          : "Your schedule"
        }
        {" "}· Timezone: <span className="font-medium text-foreground">{localTz}</span>
        {" "}· Drag cards to reschedule · Drag bottom edge to extend
      </div>

      {/* ── Week navigation ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset(o => o - 1)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium">
          {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
          {weekOffset === 0 && (
            <span className="ml-2 text-xs text-muted-foreground">(This week)</span>
          )}
        </div>
        <button
          onClick={() => setWeekOffset(o => o + 1)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ── Calendar grid ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Day headers */}
        <div className="grid border-b border-border" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
          <div className="h-12 border-r border-border" />
          {weekDays.map((date, i) => {
            const isToday    = isSameDay(date, today)
            const dayEnabled = workingHours[i]?.enabled
            return (
              <div
                key={i}
                className={cn(
                  "h-12 flex flex-col items-center justify-center border-r border-border last:border-r-0 text-xs",
                  isToday && "bg-foreground/5",
                  !dayEnabled && "opacity-40"
                )}
              >
                <span className="text-muted-foreground font-medium uppercase tracking-wide text-[10px]">
                  {DAYS[i]}
                </span>
                <span className={cn(
                  "text-sm font-semibold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full",
                  isToday ? "bg-foreground text-background" : "text-foreground"
                )}>
                  {format(date, "d")}
                </span>
              </div>
            )
          })}
        </div>

        {/* Scrollable body */}
        <div
          ref={scrollRef}
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 340px)", minHeight: "400px" }}
        >
          <div className="grid" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>

            {/* Time labels */}
            <div className="border-r border-border">
              {HOURS.map(hour => (
                <div
                  key={hour}
                  className="flex items-start justify-end pr-2 pt-1.5 border-b border-border last:border-b-0 text-[10px] text-muted-foreground font-medium"
                  style={{ height: SLOT_HEIGHT }}
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map((_, dayIdx) => {
              const isToday    = isSameDay(weekDays[dayIdx], today)
              const dayEnabled = workingHours[dayIdx]?.enabled
              const dayAppts   = appointments.filter(a => a.day === dayIdx)

              return (
                <div
                  key={dayIdx}
                  className={cn(
                    "relative border-r border-border last:border-r-0",
                    !dayEnabled && "opacity-50"
                  )}
                  style={{ height: HOURS.length * SLOT_HEIGHT }}
                >
                  {/* Hour background cells / drop targets */}
                  {HOURS.map((hour, hourIdx) => {
                    const inWorkHours = isWithinWorkingHours(dayIdx, hour)
                    const isOver      = dragOver?.day === dayIdx && dragOver?.hour === hour
                    return (
                      <div
                        key={hour}
                        onDragOver={e => handleDragOver(e, dayIdx, hour)}
                        onDrop={e => handleDrop(e, dayIdx, hour)}
                        className={cn(
                          "absolute left-0 right-0 border-b border-border transition-colors",
                          isToday && inWorkHours && "bg-foreground/[0.02]",
                          !inWorkHours && dayEnabled && "bg-muted/30",
                          !dayEnabled && "bg-muted/20",
                          isOver && inWorkHours && "bg-muted/80 ring-1 ring-inset ring-foreground/20",
                          isOver && !inWorkHours && "bg-amber-500/10 ring-1 ring-inset ring-amber-500/30",
                        )}
                        style={{ top: hourIdx * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                      />
                    )
                  })}

                  {/* Appointments */}
                  {dayAppts.map(appt => {
                    const hourIdx = HOURS.indexOf(appt.hour)
                    if (hourIdx === -1) return null
                    return (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        isDragging={dragging === appt.id}
                        isOutsideHours={!isWithinWorkingHours(dayIdx, appt.hour)}
                        top={hourIdx * SLOT_HEIGHT + 2}
                        height={appt.duration * SLOT_HEIGHT - 4}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onResizeStart={handleResizeStart}
                      />
                    )
                  })}

                  {/* Current time indicator */}
                  {isToday && weekOffset === 0 && currentTimeTop >= 0 && currentTimeTop < HOURS.length * SLOT_HEIGHT && (
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{ top: currentTimeTop }}
                    >
                      <div className="relative h-px bg-red-500">
                        <div className="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-red-500" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        {(Object.entries(TYPE_LABELS) as [Appointment["type"], string][]).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", TYPE_DOT[type])} />
            {label}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-muted-foreground/20 border border-border" />
          Outside hours
        </div>
        <span className="ml-auto">
          {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Unscheduled Leads ── */}
      <UnscheduledLeads
        leads={leads}
        appointments={appointments}
        workingHours={workingHours}
        onSchedule={(lead, day, hour) => {
          setAppointments(prev => [...prev, {
            id: generateId(),
            leadId: lead.id,
            leadName: lead.name,
            leadEmail: lead.email,
            type: "follow-up",
            day,
            hour,
            duration: 1,
          }])
          setToast(`${lead.name} added to calendar`)
        }}
      />

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

// ─── Appointment Card ─────────────────────────────────────────────────────────

function AppointmentCard({
  appointment: a,
  isDragging,
  isOutsideHours,
  top,
  height,
  onDragStart,
  onDragEnd,
  onResizeStart,
}: {
  appointment: Appointment
  isDragging: boolean
  isOutsideHours: boolean
  top: number
  height: number
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
  onResizeStart: (id: string, startY: number, originalDuration: number) => void
}) {
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, a.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "absolute left-1 right-1 rounded-md border px-2 py-1.5 text-xs transition-all select-none z-10 flex flex-col overflow-hidden",
        TYPE_COLORS[a.type],
        isDragging ? "opacity-40 scale-95" : "cursor-grab active:cursor-grabbing hover:shadow-sm",
        isOutsideHours && "opacity-60 border-dashed"
      )}
      style={{ top, height }}
    >
      {isOutsideHours && (
        <div className="absolute -top-1.5 right-1 text-[9px] text-amber-500 font-medium">outside hours</div>
      )}
      <div className="flex items-center gap-1 min-w-0">
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", TYPE_DOT[a.type])} />
        <span className="font-medium truncate">{a.leadName}</span>
      </div>
      {height > 44 && (
        <div className="flex items-center gap-1 mt-0.5 opacity-70">
          {a.leadEmail
            ? <Mail className="h-2.5 w-2.5 shrink-0" />
            : <Phone className="h-2.5 w-2.5 shrink-0" />}
          <span className="text-[10px] truncate">{TYPE_LABELS[a.type]}</span>
        </div>
      )}
      {a.duration > 1 && height > 56 && (
        <div className="mt-auto text-[9px] opacity-50 tabular-nums">{a.duration}h</div>
      )}
      {/* Resize handle */}
      <div
        draggable={false}
        className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center"
        onMouseDown={e => {
          e.stopPropagation()
          e.preventDefault()
          onResizeStart(a.id, e.clientY, a.duration)
        }}
      >
        <div className="w-6 h-0.5 rounded-full bg-current opacity-20" />
      </div>
    </div>
  )
}

// ─── Unscheduled Leads Panel ──────────────────────────────────────────────────

function UnscheduledLeads({
  leads,
  appointments,
  workingHours,
  onSchedule,
}: {
  leads: Lead[]
  appointments: Appointment[]
  workingHours: WorkingHours
  onSchedule: (lead: Lead, day: number, hour: number) => void
}) {
  const scheduledIds = new Set(appointments.map(a => a.leadId))

  const firstAvailableSlot = (): { day: number; hour: number } => {
    for (let day = 0; day < 7; day++) {
      const dh = workingHours[day]
      if (!dh?.enabled) continue
      const takenHours = new Set(appointments.filter(a => a.day === day).map(a => a.hour))
      for (let hour = dh.start; hour < dh.end; hour++) {
        if (!takenHours.has(hour)) return { day, hour }
      }
    }
    return { day: 0, hour: 9 }
  }

  const unscheduled = leads
    .filter(l => {
      const status = l.session?.status || l.status
      return (status === "approved" || (l.session?.rating ?? l.rating ?? 0) >= 3) && !scheduledIds.has(l.id)
    })
    .slice(0, 8)

  if (unscheduled.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
        <h2 className="text-sm font-medium">Unscheduled Leads</h2>
        <span className="ml-auto text-xs text-muted-foreground">{unscheduled.length} ready to schedule</span>
      </div>
      <div className="divide-y divide-border">
        {unscheduled.map(lead => {
          const rating   = lead.session?.rating ?? lead.rating ?? 0
          const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)
          return (
            <div key={lead.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors group">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{lead.name}</p>
                <p className="text-xs text-muted-foreground truncate">{lead.email || lead.phone}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Clock className="h-3 w-3" />
                {rating.toFixed(1)}/5
              </div>
              <button
                onClick={() => {
                  const slot = firstAvailableSlot()
                  onSchedule(lead, slot.day, slot.hour)
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2.5 py-1 rounded-md border border-border hover:bg-muted font-medium"
              >
                + Schedule
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
