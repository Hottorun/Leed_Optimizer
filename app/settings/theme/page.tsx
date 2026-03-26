"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Moon, Sun, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

type UIStyle = "colored" | "minimal"

export default function ThemePage() {
  const router = useRouter()
  const [selectedStyle, setSelectedStyle] = useState<UIStyle>("colored")
  const [selectedMode, setSelectedMode] = useState<"light" | "dark">("light")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const savedStyle = localStorage.getItem("uiStyle") as UIStyle | null
    const savedMode = localStorage.getItem("mode") | null
    if (savedStyle) setSelectedStyle(savedStyle)
    if (savedMode) setSelectedMode(savedMode as "light" | "dark")
  }, [])

  const applyTheme = (style: UIStyle, mode: "light" | "dark") => {
    localStorage.setItem("uiStyle", style)
    localStorage.setItem("mode", mode)
    document.documentElement.setAttribute("data-theme", style)
    document.documentElement.setAttribute("data-mode", mode)
    if (mode === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    if (style === "minimal") {
      document.documentElement.classList.add("ui-minimal")
    } else {
      document.documentElement.classList.remove("ui-minimal")
    }
  }

  const handleStyleChange = (style: UIStyle) => {
    setSelectedStyle(style)
    applyTheme(style, selectedMode)
  }

  const handleModeChange = (mode: "light" | "dark") => {
    setSelectedMode(mode)
    applyTheme(selectedStyle, mode)
  }

  const handleSave = () => {
    applyTheme(selectedStyle, selectedMode)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      router.push("/settings")
    }, 1500)
  }

  return (
    <div className={cn(
      "min-h-screen p-6",
      selectedStyle === "minimal"
        ? "bg-slate-100 dark:bg-slate-950"
        : "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900"
    )}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </button>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h1 className="text-xl font-semibold text-slate-800">Theme Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Customize the look of your dashboard</p>
          </div>

          <div className="p-6 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-800">UI Style</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleStyleChange("colored")}
                  className={cn(
                    "relative p-6 rounded-xl border-2 transition-all cursor-pointer text-left",
                    selectedStyle === "colored"
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <div className="h-16 w-full rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center gap-2 mb-3">
                    <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md shadow-sm">Button</span>
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">Text</span>
                  </div>
                  <p className="font-medium text-slate-800">Colored</p>
                  <p className="text-sm text-slate-500 mt-1">Theme-colored buttons and accents</p>
                  {selectedStyle === "colored" && (
                    <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleStyleChange("minimal")}
                  className={cn(
                    "relative p-6 rounded-xl border-2 transition-all cursor-pointer text-left",
                    selectedStyle === "minimal"
                      ? "border-slate-500 bg-slate-100"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <div className="h-16 w-full rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center gap-2 mb-3">
                    <span className="px-3 py-1.5 bg-slate-500 text-white text-xs font-medium rounded-md shadow-sm">Button</span>
                    <span className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-medium rounded-md">Text</span>
                  </div>
                  <p className="font-medium text-slate-800">Minimal</p>
                  <p className="text-sm text-slate-500 mt-1">Clean grey monochrome design</p>
                  {selectedStyle === "minimal" && (
                    <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-slate-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                {selectedMode === "dark" ? <Moon className="h-5 w-5 text-slate-500" /> : <Sun className="h-5 w-5 text-slate-500" />}
                <h2 className="text-lg font-semibold text-slate-800">Display Mode</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleModeChange("light")}
                  className={cn(
                    "relative p-6 rounded-xl border-2 transition-all cursor-pointer text-left",
                    selectedMode === "light"
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <div className="h-16 w-full rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-3">
                    <Sun className="h-8 w-8 text-amber-500" />
                  </div>
                  <p className="font-medium text-slate-800">Light Mode</p>
                  <p className="text-sm text-slate-500 mt-1">Bright and clean interface</p>
                  {selectedMode === "light" && (
                    <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleModeChange("dark")}
                  className={cn(
                    "relative p-6 rounded-xl border-2 transition-all cursor-pointer text-left",
                    selectedMode === "dark"
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <div className="h-16 w-full rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mb-3">
                    <Moon className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="font-medium text-slate-800">Dark Mode</p>
                  <p className="text-sm text-slate-500 mt-1">Easy on the eyes</p>
                  {selectedMode === "dark" && (
                    <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => router.push("/settings")}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 cursor-pointer",
                  saved 
                    ? "bg-emerald-600 text-white" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  "Save Theme"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
