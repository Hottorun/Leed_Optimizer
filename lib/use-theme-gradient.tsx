"use client"

import { useState, useEffect } from "react"

type Theme = "blue" | "emerald" | "purple" | "rose" | "amber"
export type BackgroundStyle = "gradient" | "monotone" | "image"

interface ThemeGradient {
  from: string
  to: string
}

const themeColors: Record<Theme, string> = {
  blue: "#3b82f6",
  emerald: "#10b981",
  purple: "#8b5cf6",
  rose: "#f43f5e",
  amber: "#f59e0b",
}

const themeLightColors: Record<Theme, string> = {
  blue: "#eff6ff",
  emerald: "#ecfdf5",
  purple: "#faf5ff",
  rose: "#fff1f2",
  amber: "#fffbeb",
}

const themeGradients: Record<Theme, ThemeGradient> = {
  blue: { from: "from-blue-50", to: "to-blue-100/50" },
  emerald: { from: "from-emerald-50", to: "to-emerald-100/50" },
  purple: { from: "from-purple-50", to: "to-purple-100/50" },
  rose: { from: "from-rose-50", to: "to-rose-100/50" },
  amber: { from: "from-amber-50", to: "to-amber-100/50" },
}

const gradientColors: Record<Theme, { from: string; to: string }> = {
  blue: { from: "#eff6ff", to: "#dbeafe" },
  emerald: { from: "#ecfdf5", to: "#d1fae5" },
  purple: { from: "#faf5ff", to: "#e9d5ff" },
  rose: { from: "#fff1f2", to: "#ffe4e6" },
  amber: { from: "#fffbeb", to: "#fef3c7" },
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
    
    switch (backgroundStyle) {
      case "monotone":
        return { background: themeLightColors[currentTheme] }
      case "image":
        return { background: "url('/bg-image.jpg') center/cover no-repeat" }
      case "gradient":
      default:
        return { background: `linear-gradient(to bottom right, ${gradientColors[currentTheme].from}, ${gradientColors[currentTheme].to})` }
    }
  }

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${className}`}
      style={getBackgroundStyle()}
    >
      {children}
    </div>
  )
}
