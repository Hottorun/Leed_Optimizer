"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Theme = "blue" | "emerald" | "purple" | "rose" | "amber" | "indigo"
type Mode = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  mode: Mode
  setTheme: (theme: Theme) => void
  setMode: (mode: Mode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

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

export type { Theme, Mode }
