"use client"

import { useEffect } from "react"

export function ThemeInitializer() {
  useEffect(() => {
    const mode = localStorage.getItem("mode")
    const theme = localStorage.getItem("theme")
    
    if (mode === "dark") {
      document.documentElement.classList.add("dark")
      document.documentElement.setAttribute("data-mode", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      document.documentElement.setAttribute("data-mode", "light")
    }
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme)
    }
  }, [])

  return null
}
