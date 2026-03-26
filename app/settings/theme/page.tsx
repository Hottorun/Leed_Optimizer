"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Moon, Sun, Palette, Square, Droplets, Shapes, Image as ImageIcon, Sparkles } from "lucide-react"
import type { Theme, Mode } from "@/lib/theme-context"
import type { BackgroundStyle } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"
import { useThemeGradient } from "@/lib/use-theme-gradient"

const themes: { id: Theme; name: string; colors: string[]; preview: string; gradientFrom: string; gradientTo: string }[] = [
  { 
    id: "blue", 
    name: "Ocean Blue", 
    colors: ["bg-blue-500", "bg-blue-600", "bg-blue-700"], 
    preview: "from-blue-500 to-blue-700",
    gradientFrom: "from-blue-50",
    gradientTo: "to-blue-100/50"
  },
  { 
    id: "emerald", 
    name: "Forest Green", 
    colors: ["bg-emerald-500", "bg-emerald-600", "bg-emerald-700"], 
    preview: "from-emerald-500 to-emerald-700",
    gradientFrom: "from-emerald-50",
    gradientTo: "to-emerald-100/50"
  },
  { 
    id: "purple", 
    name: "Royal Purple", 
    colors: ["bg-purple-500", "bg-purple-600", "bg-purple-700"], 
    preview: "from-purple-500 to-purple-700",
    gradientFrom: "from-purple-50",
    gradientTo: "to-purple-100/50"
  },
  { 
    id: "rose", 
    name: "Sunset Rose", 
    colors: ["bg-rose-500", "bg-rose-600", "bg-rose-700"], 
    preview: "from-rose-500 to-rose-700",
    gradientFrom: "from-rose-50",
    gradientTo: "to-rose-100/50"
  },
  { 
    id: "amber", 
    name: "Golden Amber", 
    colors: ["bg-amber-500", "bg-amber-600", "bg-amber-700"], 
    preview: "from-amber-500 to-amber-700",
    gradientFrom: "from-amber-50",
    gradientTo: "to-amber-100/50"
  },
]

const backgroundStyles: { id: BackgroundStyle; name: string; description: string; icon: typeof Sparkles; lightColor: string }[] = [
  { id: "gradient", name: "Gradient", description: "Smooth color transition", icon: Sparkles, lightColor: "" },
  { id: "monotone", name: "Monotone", description: "Light theme color", icon: Square, lightColor: "" },
  { id: "image", name: "Image", description: "Custom background image", icon: ImageIcon, lightColor: "" },
]

const themeLightColors: Record<Theme, string> = {
  blue: "#eff6ff",
  emerald: "#ecfdf5",
  purple: "#faf5ff",
  rose: "#fff1f2",
  amber: "#fffbeb",
}

export default function ThemePage() {
  const router = useRouter()
  const [selectedTheme, setSelectedTheme] = useState<Theme>("blue")
  const [selectedMode, setSelectedMode] = useState<Mode>("light")
  const [selectedBgStyle, setSelectedBgStyle] = useState<BackgroundStyle>("gradient")
  const [saved, setSaved] = useState(false)
  const { gradient, saveBackgroundStyle } = useThemeGradient()

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null
    const savedMode = localStorage.getItem("mode") as Mode | null
    const savedBgStyle = localStorage.getItem("backgroundStyle") as BackgroundStyle | null
    if (savedTheme) setSelectedTheme(savedTheme)
    if (savedMode) setSelectedMode(savedMode)
    if (savedBgStyle) setSelectedBgStyle(savedBgStyle)
  }, [])

  const applyTheme = (theme: Theme, mode: Mode) => {
    localStorage.setItem("theme", theme)
    localStorage.setItem("mode", mode)
    document.documentElement.setAttribute("data-theme", theme)
    document.documentElement.setAttribute("data-mode", mode)
    if (mode === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme)
    applyTheme(theme, selectedMode)
  }

  const handleModeChange = (mode: Mode) => {
    setSelectedMode(mode)
    applyTheme(selectedTheme, mode)
  }

  const handleBgStyleChange = (style: BackgroundStyle) => {
    setSelectedBgStyle(style)
    saveBackgroundStyle(style)
  }

  const handleSave = () => {
    applyTheme(selectedTheme, selectedMode)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      router.push("/settings")
    }, 1500)
  }

  const currentThemeData = themes.find(t => t.id === selectedTheme)

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br p-6",
      currentThemeData 
        ? `${currentThemeData.gradientFrom} ${currentThemeData.gradientTo}`
        : `${gradient.from} ${gradient.to}`
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
                <h2 className="text-lg font-semibold text-slate-800">Color Theme</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={cn(
                      "relative p-4 rounded-xl border-2 transition-all cursor-pointer",
                      selectedTheme === theme.id
                        ? "border-slate-800 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                  >
                    <div className={cn("h-12 w-full rounded-lg bg-gradient-to-br mb-3", theme.preview)} />
                    <p className="font-medium text-slate-800">{theme.name}</p>
                    <div className="flex gap-1 mt-2">
                      {theme.colors.map((color) => (
                        <div key={color} className={cn("h-4 w-4 rounded-full", color)} />
                      ))}
                    </div>
                    {selectedTheme === theme.id && (
                      <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-800">Background Style</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {backgroundStyles.map((style) => {
                  const Icon = style.icon
                  return (
                    <button
                      key={style.id}
                      onClick={() => handleBgStyleChange(style.id)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all cursor-pointer text-center",
                        selectedBgStyle === style.id
                          ? "border-slate-800 bg-slate-50"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      )}
                    >
                      <div 
                        className={cn(
                          "h-12 w-full rounded-lg mb-3 flex items-center justify-center",
                          style.id === "gradient" && `bg-gradient-to-br ${themes.find(t => t.id === selectedTheme)?.gradientFrom} ${themes.find(t => t.id === selectedTheme)?.gradientTo}`,
                          style.id === "image" && "bg-gradient-to-br from-slate-200 to-slate-300"
                        )}
                        style={style.id === "monotone" ? { background: themeLightColors[selectedTheme] } : undefined}
                      >
                        <Icon className={cn(
                          "h-6 w-6",
                          style.id === "gradient" ? "text-slate-600" : "text-slate-500"
                        )} />
                      </div>
                      <p className="font-medium text-slate-800 text-sm">{style.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{style.description}</p>
                      {selectedBgStyle === style.id && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
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
                      ? "border-slate-800 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <div className="h-16 w-full rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-3">
                    <Sun className="h-8 w-8 text-amber-500" />
                  </div>
                  <p className="font-medium text-slate-800">Light Mode</p>
                  <p className="text-sm text-slate-500 mt-1">Bright and clean interface</p>
                  {selectedMode === "light" && (
                    <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleModeChange("dark")}
                  className={cn(
                    "relative p-6 rounded-xl border-2 transition-all cursor-pointer text-left",
                    selectedMode === "dark"
                      ? "border-slate-800 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <div className="h-16 w-full rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mb-3">
                    <Moon className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="font-medium text-slate-800">Dark Mode</p>
                  <p className="text-sm text-slate-500 mt-1">Easy on the eyes</p>
                  {selectedMode === "dark" && (
                    <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {selectedMode === "dark" && (
              <div className="p-4 rounded-xl bg-slate-800 text-white">
                <p className="font-medium mb-2">Dark Mode Preview</p>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>This is how text will appear in dark mode.</p>
                  <p className="text-slate-400">Secondary text will be slightly dimmer.</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-1 bg-slate-700 rounded text-xs">Example</span>
                    <span className="px-2 py-1 bg-blue-600 rounded text-xs">Button</span>
                  </div>
                </div>
              </div>
            )}

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
