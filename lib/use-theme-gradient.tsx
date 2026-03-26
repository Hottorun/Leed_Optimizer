"use client"

import { useState, useEffect } from "react"

type UIStyle = "colored" | "minimal"
export type BackgroundStyle = "gradient" | "monotone"

interface ThemeGradient {
  from: string
  to: string
}

const themeColors: Record<string, string> = {
  blue: "#2563eb",
  emerald: "#059669",
  purple: "#7c3aed",
  rose: "#e11d48",
  amber: "#ea580c",
}

const themeLightColors: Record<string, string> = {
  blue: "#e2e8f0",
  emerald: "#ccfbf1",
  purple: "#e0e7ff",
  rose: "#f5f5f4",
  amber: "#fef3c7",
}

const themeGradients: Record<string, ThemeGradient> = {
  blue: { from: "from-blue-100", to: "to-blue-200" },
  emerald: { from: "from-emerald-100", to: "to-emerald-200" },
  purple: { from: "from-violet-100", to: "to-violet-200" },
  rose: { from: "from-rose-100", to: "to-rose-200" },
  amber: { from: "from-orange-100", to: "to-orange-200" },
}

const gradientColors: Record<string, { from: string; to: string }> = {
  blue: { from: "#dbeafe", to: "#e0e7ff" },
  emerald: { from: "#ccfbf1", to: "#dcfce7" },
  purple: { from: "#e0e7ff", to: "#f3e8ff" },
  rose: { from: "#fef2f2", to: "#fef3c7" },
  amber: { from: "#fef3c7", to: "#dbeafe" },
}

function getInitialUIStyle(): UIStyle {
  if (typeof window === "undefined") return "colored"
  return (localStorage.getItem("uiStyle") as UIStyle) || "colored"
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
  const [currentUIStyle, setCurrentUIStyle] = useState<UIStyle>(getInitialUIStyle)
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>(getInitialBackgroundStyle)

  useEffect(() => {
    const savedStyle = (localStorage.getItem("uiStyle") || "colored") as UIStyle
    const savedBgStyle = localStorage.getItem("backgroundStyle") as BackgroundStyle | null
    
    setCurrentUIStyle(savedStyle)
    if (savedBgStyle) {
      setBackgroundStyle(savedBgStyle)
    }

    const handleStorageChange = () => {
      const newStyle = (localStorage.getItem("uiStyle") || "colored") as UIStyle
      const newBgStyle = localStorage.getItem("backgroundStyle") as BackgroundStyle | null
      setCurrentUIStyle(newStyle)
      if (newBgStyle) {
        setBackgroundStyle(newBgStyle)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const saveBackgroundStyle = (style: BackgroundStyle) => {
    setBackgroundStyle(style)
    localStorage.setItem("backgroundStyle", style)
  }

  return { gradient, currentUIStyle, backgroundStyle, saveBackgroundStyle, themeColors, themeLightColors, gradientColors }
}

export function ThemeBackground({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { currentUIStyle } = useThemeGradient()
  const isDark = getInitialDarkMode()

  const getBackgroundStyle = (): React.CSSProperties => {
    if (isDark) return { background: "#0f172a" }
    
    if (currentUIStyle === "minimal") {
      return { background: "#cbd5e1" }
    }

    return { background: "linear-gradient(to bottom right, #dbeafe, #e0e7ff)" }
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
