"use client"

import useSWR from "swr"
import { AppHeader } from "@/components/app-header"
import { Analytics } from "@/components/analytics"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import type { Lead } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AnalyticsPage() {
  const { data: leads = [], mutate, isValidating } = useSWR<Lead[]>("/api/leads", fetcher)

  return (
    <ThemeBackground>
      <AppHeader onRefresh={mutate} isRefreshing={isValidating} />
      <Analytics leads={leads} />
    </ThemeBackground>
  )
}
