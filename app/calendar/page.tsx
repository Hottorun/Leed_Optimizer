"use client"

import { useEffect } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { CalendarView } from "@/components/calendar-view"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { useUser } from "@/lib/use-user"
import type { Lead } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function CalendarPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const { data: leads = [], mutate, isValidating } = useSWR<Lead[]>("/api/leads", fetcher)

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login")
    }
  }, [user, userLoading, router])

  if (userLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <ThemeBackground>
      <AppHeader
        onRefresh={mutate}
        isRefreshing={isValidating}
        user={{ name: user.name, email: user.email }}
        leads={leads}
      />
      <CalendarView leads={leads} currentUser={user} />
    </ThemeBackground>
  )
}
