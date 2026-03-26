"use client"

import {
  LayoutDashboard,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { LeadStatus } from "@/lib/types"

interface AppSidebarProps {
  activeFilter: LeadStatus | null
  onFilterChange: (filter: LeadStatus | null) => void
}

const navItems: { id: LeadStatus | null; label: string; icon: typeof LayoutDashboard }[] = [
  { id: null, label: "All Leads", icon: LayoutDashboard },
  { id: "pending", label: "Pending Review", icon: Clock },
  { id: "approved", label: "Approved", icon: CheckCircle },
  { id: "declined", label: "Declined", icon: XCircle },
]

export function AppSidebar({ activeFilter, onFilterChange }: AppSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <MessageSquare className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">LeadFlow</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Filter by Status
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeFilter === item.id
          return (
            <button
              key={item.label}
              onClick={() => onFilterChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          )
        })}

        <div className="my-6 border-t border-border" />

        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Settings
        </p>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
          <Settings className="h-5 w-5" />
          Webhook Config
        </button>
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">Admin User</p>
            <p className="truncate text-xs text-muted-foreground">admin@company.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
