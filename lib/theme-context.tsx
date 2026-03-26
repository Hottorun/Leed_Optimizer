"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Theme = "blue" | "emerald" | "purple" | "rose" | "amber"
type Mode = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  mode: Mode
  setTheme: (theme: Theme) => void
  setMode: (mode: Mode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const themeColors: Record<Theme, { primary: string; primaryHover: string; bg: string; bgHover: string }> = {
  blue: { primary: "bg-blue-600", primaryHover: "bg-blue-700", bg: "bg-blue-50", bgHover: "bg-blue-100" },
  emerald: { primary: "bg-emerald-600", primaryHover: "bg-emerald-700", bg: "bg-emerald-50", bgHover: "bg-emerald-100" },
  purple: { primary: "bg-purple-600", primaryHover: "bg-purple-700", bg: "bg-purple-50", bgHover: "bg-purple-100" },
  rose: { primary: "bg-rose-600", primaryHover: "bg-rose-700", bg: "bg-rose-50", bgHover: "bg-rose-100" },
  amber: { primary: "bg-amber-600", primaryHover: "bg-amber-700", bg: "bg-amber-50", bgHover: "bg-amber-100" },
}

const darkThemeColors: Record<Theme, { primary: string; primaryHover: string; bg: string; bgHover: string }> = {
  blue: { primary: "bg-blue-500", primaryHover: "bg-blue-400", bg: "bg-blue-900/30", bgHover: "bg-blue-900/50" },
  emerald: { primary: "bg-emerald-500", primaryHover: "bg-emerald-400", bg: "bg-emerald-900/30", bgHover: "bg-emerald-900/50" },
  purple: { primary: "bg-purple-500", primaryHover: "bg-purple-400", bg: "bg-purple-900/30", bgHover: "bg-purple-900/50" },
  rose: { primary: "bg-rose-500", primaryHover: "bg-rose-400", bg: "bg-rose-900/30", bgHover: "bg-rose-900/50" },
  amber: { primary: "bg-amber-500", primaryHover: "bg-amber-400", bg: "bg-amber-900/30", bgHover: "bg-amber-900/50" },
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("blue")
  const [mode, setMode] = useState<Mode>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null
    const savedMode = localStorage.getItem("mode") as Mode | null
    if (savedTheme) setTheme(savedTheme)
    if (savedMode) setMode(savedMode)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme", theme)
      document.documentElement.setAttribute("data-theme", theme)
    }
  }, [theme, mounted])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("mode", mode)
      document.documentElement.setAttribute("data-mode", mode)
      if (mode === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [mode, mounted])

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}

export { themeColors, darkThemeColors }
export type { Theme, Mode }
