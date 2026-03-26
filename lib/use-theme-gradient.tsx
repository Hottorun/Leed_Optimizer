"use client"

import { useState, useEffect } from "react"

type Theme = "blue" | "emerald" | "purple" | "rose" | "amber" | "minimal"
export type BackgroundStyle = "gradient" | "monotone" | "image"

interface ThemeGradient {
  from: string
  to: string
}

const themeColors: Record<Theme, string> = {
  blue: "#2563eb",
  emerald: "#059669",
  purple: "#7c3aed",
  rose: "#e11d48",
  amber: "#ea580c",
  minimal: "#64748b",
}

const themeLightColors: Record<Theme, string> = {
  blue: "#e2e8f0",
  emerald: "#ccfbf1",
  purple: "#e0e7ff",
  rose: "#f5f5f4",
  amber: "#fef3c7",
  minimal: "#e2e8f0",
}

const themeGradients: Record<Theme, ThemeGradient> = {
  blue: { from: "from-blue-100", to: "to-blue-200" },
  emerald: { from: "from-emerald-100", to: "to-emerald-200" },
  purple: { from: "from-violet-100", to: "to-violet-200" },
  rose: { from: "from-rose-100", to: "to-rose-200" },
  amber: { from: "from-orange-100", to: "to-orange-200" },
  minimal: { from: "from-slate-200", to: "to-slate-300" },
}

const gradientColors: Record<Theme, { from: string; to: string }> = {
  blue: { from: "#dbeafe", to: "#e0e7ff" },
  emerald: { from: "#ccfbf1", to: "#dcfce7" },
  purple: { from: "#e0e7ff", to: "#f3e8ff" },
  rose: { from: "#fef2f2", to: "#fef3c7" },
  amber: { from: "#fef3c7", to: "#dbeafe" },
  minimal: { from: "#e2e8f0", to: "#cbd5e1" },
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "blue"
  return (localStorage.getItem("theme") as Theme) || "blue"
}

function getInitialBackgroundStyle(): BackgroundStyle {
  if (typeof window === "undefined") return "gradient"
  return (localStorage.getItem("backgroundStyle") as BackgroundStyle) || "gradient"
}

function getInitialDarkMode(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("mode") === "dark" || document.documentElement.classList.contains("dark")
}

export function useThemeGradient() {
  const [gradient] = useState<ThemeGradient>(themeGradients.blue)
  const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme)
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>(getInitialBackgroundStyle)

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") || "blue") as Theme
    const savedStyle = localStorage.getItem("backgroundStyle") as BackgroundStyle | null
    
    setCurrentTheme(savedTheme)
    if (savedStyle) {
      setBackgroundStyle(savedStyle)
    }

    const handleStorageChange = () => {
      const newTheme = (localStorage.getItem("theme") || "blue") as Theme
      const newStyle = localStorage.getItem("backgroundStyle") as BackgroundStyle | null
      setCurrentTheme(newTheme)
      if (newStyle) {
        setBackgroundStyle(newStyle)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const saveBackgroundStyle = (style: BackgroundStyle) => {
    setBackgroundStyle(style)
    localStorage.setItem("backgroundStyle", style)
  }

  return { gradient, currentTheme, backgroundStyle, saveBackgroundStyle, themeColors, themeLightColors, gradientColors }
}

export function ThemeBackground({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { currentTheme, backgroundStyle, themeLightColors, gradientColors } = useThemeGradient()
  const isDark = getInitialDarkMode()

  const getBackgroundStyle = (): React.CSSProperties => {
    if (isDark) return { background: "#0f172a" }
    
    const theme = currentTheme || "blue"
    
    if (theme === "minimal") {
      return { background: "#e2e8f0" }
    }

    switch (backgroundStyle) {
      case "monotone":
        return { background: themeLightColors[theme] }
      case "image":
        return { background: "url('/bg-image.jpg') center/cover no-repeat" }
      case "gradient":
      default:
        return { background: `linear-gradient(to bottom right, ${gradientColors[theme].from}, ${gradientColors[theme].to})` }
    }
  }

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${className}`}
      style={getBackgroundStyle()}
      suppressHydrationWarning
    >
      {children}
    </div>
  )
}
