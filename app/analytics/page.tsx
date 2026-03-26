"use client"

import useSWR from "swr"
import { AppHeader } from "@/components/app-header"
import { Analytics } from "@/components/analytics"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { useUser } from "@/lib/use-user"
import type { Lead } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AnalyticsPage() {
  const { data: leads = [], mutate, isValidating } = useSWR<Lead[]>("/api/leads", fetcher)
  const { user } = useUser()

  return (
    <ThemeBackground>
      <AppHeader onRefresh={mutate} isRefreshing={isValidating} user={user ? { name: user.name, email: user.email } : undefined} />
      <Analytics leads={leads} />
    </ThemeBackground>
  )
}
