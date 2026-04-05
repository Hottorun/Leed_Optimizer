"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Sparkles,
  Clock,
  Phone,
  Mail,
  CalendarIcon,
  X,
  Check,
  Zap,
  Settings2,
} from "lucide-react"
import type { Lead } from "@/lib/types"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Appointment {
  id: string
  leadId: string
  leadName: string
  leadEmail: string
  type: "call" | "follow-up" | "consultation"
  day: number   // index 0–6 (Mon–Sun)
  hour: number  // 8–20
  duration: number
}

interface DayHours {
  enabled: boolean
  start: number  // 0–23
  end: number    // 0–23
}

type WorkingHours = Record<number, DayHours> // key 0=Mon … 6=Sun

interface CalendarViewProps {
  leads: Lead[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8 AM – 8 PM
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i) // 0–23

const DEFAULT_WORKING_HOURS: WorkingHours = {
  0: { enabled: true,  start: 8, end: 17 }, // Mon
  1: { enabled: true,  start: 8, end: 17 }, // Tue
  2: { enabled: true,  start: 8, end: 17 }, // Wed
  3: { enabled: true,  start: 8, end: 17 }, // Thu
  4: { enabled: true,  start: 8, end: 17 }, // Fri
  5: { enabled: false, start: 9, end: 13 }, // Sat
  6: { enabled: false, start: 9, end: 13 }, // Sun
}

const TIMEZONES = [
  { label: "UTC",                value: "UTC" },
  { label: "Eastern Time (ET)", value: "America/New_York" },
  { label: "Central Time (CT)", value: "America/Chicago" },
  { label: "Mountain Time (MT)",value: "America/Denver" },
  { label: "Pacific Time (PT)", value: "America/Los_Angeles" },
  { label: "London (GMT/BST)",  value: "Europe/London" },
  { label: "Paris / Berlin (CET)", value: "Europe/Paris" },
  { label: "Dubai (GST)",       value: "Asia/Dubai" },
  { label: "Mumbai (IST)",      value: "Asia/Kolkata" },
  { label: "Singapore / HKG",  value: "Asia/Singapore" },
  { label: "Tokyo (JST)",       value: "Asia/Tokyo" },
  { label: "Sydney (AEST)",     value: "Australia/Sydney" },
  { label: "São Paulo (BRT)",   value: "America/Sao_Paulo" },
]

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

function formatHour(h: number) {
  if (h === 0)  return "12 AM"
  if (h === 12) return "12 PM"
  if (h < 12)  return `${h} AM`
  return `${h - 12} PM`
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CalendarView({ leads }: CalendarViewProps) {
  const [weekOffset, setWeekOffset]           = useState(0)
  const [timezone, setTimezone]               = useState("UTC")
  const [appointments, setAppointments]       = useState<Appointment[]>([])
  const [workingHours, setWorkingHours]       = useState<WorkingHours>(DEFAULT_WORKING_HOURS)
  const [showHoursPanel, setShowHoursPanel]   = useState(false)
  const [dragging, setDragging]               = useState<string | null>(null)
  const [dragOver, setDragOver]               = useState<{ day: number; hour: number } | null>(null)
  const [toast, setToast]                     = useState<string | null>(null)
  const [showTzDropdown, setShowTzDropdown]   = useState(false)
  const tzRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (tzRef.current && !tzRef.current.contains(e.target as Node))
        setShowTzDropdown(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const weekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7)
  const weekDays  = DAYS.map((_, i) => addDays(weekStart, i))
  const today     = new Date()

  // ── Helpers ──
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
    if (!isWithinWorkingHours(day, hour)) {
      setToast("⚠️ Moved outside working hours")
    } else {
      setToast("Appointment rescheduled")
    }
  }, [isWithinWorkingHours])

  const handleDragEnd = useCallback(() => {
    setDragging(null)
    setDragOver(null)
  }, [])

  // ── Auto-schedule — respects working hours ──
  const autoSchedule = useCallback(() => {
    const eligible = leads
      .filter(l => {
        const status = l.session?.status || l.status
        return status === "approved" || (l.session?.rating ?? l.rating ?? 0) >= 4
      })
      .slice(0, 20)

    if (eligible.length === 0) {
      setToast("No approved leads to schedule")
      return
    }

    // Build ordered list of available slots from working hours
    const slots: { day: number; hour: number }[] = []
    for (let day = 0; day < 7; day++) {
      const dh = workingHours[day]
      if (!dh?.enabled) continue
      for (let hour = dh.start; hour < dh.end; hour += 1) {
        slots.push({ day, hour })
      }
    }

    if (slots.length === 0) {
      setToast("No working hours configured — enable at least one day")
      return
    }

    const types: Appointment["type"][] = ["call", "follow-up", "consultation"]
    const newAppts: Appointment[] = []
    let slotIdx = 0

    for (const lead of eligible) {
      if (appointments.some(a => a.leadId === lead.id)) continue
      if (slotIdx >= slots.length) break

      // Space out slots: every other slot (i.e. 1-hour gaps between bookings)
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

    if (newAppts.length === 0) {
      setToast("All leads already scheduled")
      return
    }

    setAppointments(prev => [...prev, ...newAppts])
    setToast(`Scheduled ${newAppts.length} appointment${newAppts.length > 1 ? "s" : ""} within your working hours`)
  }, [leads, appointments, workingHours])

  const removeAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id))
  }, [])

  const getAppointmentsAt = (day: number, hour: number) =>
    appointments.filter(a => a.day === day && a.hour === hour)

  // ── Working hours update helpers ──
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

  const selectedTz = TIMEZONES.find(t => t.value === timezone) ?? TIMEZONES[0]

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Schedule and manage lead appointments</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Working hours toggle */}
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

          {/* Timezone picker */}
          <div className="relative" ref={tzRef}>
            <button
              onClick={() => setShowTzDropdown(v => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-sm hover:bg-muted transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{selectedTz.label}</span>
              <ChevronLeft className="h-3 w-3 text-muted-foreground rotate-[-90deg]" />
            </button>

            {showTzDropdown && (
              <div className="absolute right-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="max-h-64 overflow-y-auto py-1">
                  {TIMEZONES.map(tz => (
                    <button
                      key={tz.value}
                      onClick={() => {
                        setTimezone(tz.value)
                        setShowTzDropdown(false)
                        setToast(`Timezone set to ${tz.label}`)
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2",
                        tz.value === timezone
                          ? "bg-muted text-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      {tz.value === timezone && <Check className="h-3 w-3 shrink-0" />}
                      <span className={tz.value === timezone ? "" : "pl-[18px]"}>{tz.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Auto-schedule */}
          <button
            onClick={autoSchedule}
            className="flex items-center gap-2 px-3 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Schedule
          </button>
        </div>
      </div>

      {/* ── Working Hours Panel ── */}
      {showHoursPanel && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-sm font-medium">Working Hours</h2>
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
                  {/* Toggle */}
                  <button
                    onClick={() => toggleDay(i)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
                      dh.enabled ? "bg-foreground" : "bg-muted-foreground/30"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                        dh.enabled ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>

                  {/* Day label */}
                  <span className="w-8 text-sm font-medium">{day}</span>

                  {/* Time range */}
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
        AI schedules leads only within your working hours in{" "}
        <span className="font-medium text-foreground">{selectedTz.label}</span>.
        Drag any card to reschedule. Dimmed slots are outside your availability.
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
            const isToday = isSameDay(date, today)
            const dayEnabled = workingHours[i]?.enabled
            return (
              <div
                key={i}
                className={cn(
                  "h-12 flex flex-col items-center justify-center border-r border-border last:border-r-0 text-xs",
                  isToday ? "bg-foreground/5" : "",
                  !dayEnabled ? "opacity-40" : ""
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

        {/* Time slots */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 340px)", minHeight: "400px" }}>
          {HOURS.map(hour => (
            <div
              key={hour}
              className="grid border-b border-border last:border-b-0"
              style={{ gridTemplateColumns: "56px repeat(7, 1fr)", minHeight: "64px" }}
            >
              {/* Hour label */}
              <div className="flex items-start justify-end pr-2 pt-1.5 border-r border-border text-[10px] text-muted-foreground font-medium shrink-0">
                {formatHour(hour)}
              </div>

              {/* Day cells */}
              {DAYS.map((_, dayIdx) => {
                const appts         = getAppointmentsAt(dayIdx, hour)
                const isOver        = dragOver?.day === dayIdx && dragOver?.hour === hour
                const isToday       = isSameDay(weekDays[dayIdx], today)
                const inWorkHours   = isWithinWorkingHours(dayIdx, hour)
                const dayEnabled    = workingHours[dayIdx]?.enabled

                return (
                  <div
                    key={dayIdx}
                    onDragOver={(e) => handleDragOver(e, dayIdx, hour)}
                    onDrop={(e) => handleDrop(e, dayIdx, hour)}
                    className={cn(
                      "border-r border-border last:border-r-0 p-1 relative transition-colors",
                      // Today column subtle tint
                      isToday && inWorkHours ? "bg-foreground/[0.02]" : "",
                      // Out-of-hours: dimmed stripe pattern
                      !inWorkHours && dayEnabled
                        ? "bg-muted/30"
                        : "",
                      // Day-off: stronger dim
                      !dayEnabled
                        ? "bg-muted/20 opacity-50"
                        : "",
                      // Drag-over highlight
                      isOver && inWorkHours ? "bg-muted/80 ring-1 ring-inset ring-foreground/20" : "",
                      isOver && !inWorkHours ? "bg-amber-500/10 ring-1 ring-inset ring-amber-500/30" : "",
                    )}
                  >
                    {/* Out-of-hours label (first slot only) */}
                    {!inWorkHours && dayEnabled && appts.length === 0 && hour === workingHours[dayIdx]?.end && (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] text-muted-foreground/40 pointer-events-none select-none">
                        off
                      </span>
                    )}

                    {appts.map(appt => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        isDragging={dragging === appt.id}
                        isOutsideHours={!inWorkHours}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onRemove={removeAppointment}
                      />
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
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
          {appointments.length} appointment{appointments.length !== 1 ? "s" : ""} this week
        </span>
      </div>

      {/* ── Unscheduled leads ── */}
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
          <Check className="h-3.5 w-3.5" />
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
  onDragStart,
  onDragEnd,
  onRemove,
}: {
  appointment: Appointment
  isDragging: boolean
  isOutsideHours: boolean
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
  onRemove: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, a.id)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative rounded-md border px-2 py-1.5 text-xs mb-1 last:mb-0 transition-all select-none",
        TYPE_COLORS[a.type],
        isDragging ? "opacity-40 scale-95" : "cursor-grab active:cursor-grabbing hover:shadow-sm",
        isOutsideHours ? "opacity-60 border-dashed" : ""
      )}
    >
      {isOutsideHours && (
        <div className="absolute -top-1.5 right-1 text-[9px] text-amber-500 font-medium">outside hours</div>
      )}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", TYPE_DOT[a.type])} />
          <span className="font-medium truncate">{a.leadName}</span>
        </div>
        {hovered && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(a.id) }}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1 mt-0.5 opacity-70">
        {a.leadEmail ? <Mail className="h-2.5 w-2.5 shrink-0" /> : <Phone className="h-2.5 w-2.5 shrink-0" />}
        <span className="text-[10px] truncate">{TYPE_LABELS[a.type]}</span>
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

  // Find the first available working-hours slot
  const firstAvailableSlot = (): { day: number; hour: number } => {
    for (let day = 0; day < 7; day++) {
      const dh = workingHours[day]
      if (!dh?.enabled) continue
      const takenHours = new Set(
        appointments.filter(a => a.day === day).map(a => a.hour)
      )
      for (let hour = dh.start; hour < dh.end; hour++) {
        if (!takenHours.has(hour)) return { day, hour }
      }
    }
    return { day: 0, hour: 9 } // fallback
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
