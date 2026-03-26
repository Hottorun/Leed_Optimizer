"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bot, Check, AlertTriangle, Zap, MessageSquare, Star, Filter, Brain, Sliders, Shield } from "lucide-react"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"

export default function AISettingsPage() {
  const router = useRouter()
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [preferences, setPreferences] = useState({
    aiEnabled: true,
    autoApprove: false,
    autoDecline: false,
    autoManualReview: true,
    minRatingThreshold: 3,
    autoResponseEnabled: false,
    sentimentAnalysis: true,
    priorityDetection: true,
    duplicateDetection: true,
  })
  const [aiInstructions, setAiInstructions] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("aiPreferences")
    if (saved) {
      setPreferences(JSON.parse(saved))
    }
    const savedInstructions = localStorage.getItem("aiInstructions")
    if (savedInstructions) {
      setAiInstructions(savedInstructions)
    }
  }, [])

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleToggle = (key: keyof typeof preferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] }
    setPreferences(newPrefs)
    localStorage.setItem("aiPreferences", JSON.stringify(newPrefs))
    showToast("AI preferences saved", "success")
  }

  const handleRatingChange = (value: number) => {
    const newPrefs = { ...preferences, minRatingThreshold: value }
    setPreferences(newPrefs)
    localStorage.setItem("aiPreferences", JSON.stringify(newPrefs))
    showToast("Rating threshold updated", "success")
  }

  const handleInstructionsChange = (value: string) => {
    setAiInstructions(value)
    localStorage.setItem("aiInstructions", value)
  }

  const handleSaveAll = () => {
    localStorage.setItem("aiPreferences", JSON.stringify(preferences))
    localStorage.setItem("aiInstructions", aiInstructions)
    showToast("All AI settings saved successfully", "success")
  }

  const handleResetDefaults = () => {
    const defaultPrefs = {
      aiEnabled: true,
      autoApprove: false,
      autoDecline: false,
      autoManualReview: true,
      minRatingThreshold: 3,
      autoResponseEnabled: false,
      sentimentAnalysis: true,
      priorityDetection: true,
      duplicateDetection: true,
    }
    setPreferences(defaultPrefs)
    setAiInstructions("")
    localStorage.setItem("aiPreferences", JSON.stringify(defaultPrefs))
    localStorage.setItem("aiInstructions", "")
    showToast("AI settings reset to defaults", "success")
  }

  const autoActionOptions = [
    { value: false, label: "Manual Review", description: "All leads go to manual review" },
    { value: true, label: "Auto Action", description: "AI decides based on rating" },
  ]

  return (
    <ThemeBackground>
      <div className="p-6">
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
              <h1 className="text-xl font-semibold text-slate-800">AI Settings</h1>
              <p className="text-sm text-slate-500 mt-1">Customize how AI handles your leads</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 shrink-0">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">AI Assistant</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Configure how the AI analyzes and processes your leads automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                      <Zap className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Enable AI Processing</p>
                      <p className="text-sm text-slate-500">Turn AI lead processing on or off</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle("aiEnabled")}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                      preferences.aiEnabled ? "bg-emerald-500" : "bg-slate-200"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                        preferences.aiEnabled ? "left-7" : "left-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
                  Lead Processing
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                          <Check className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">Auto-Approve</p>
                          <p className="text-sm text-slate-500">Automatically approve high-rated leads</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle("autoApprove")}
                        disabled={!preferences.aiEnabled}
                        className={cn(
                          "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                          preferences.autoApprove && preferences.aiEnabled ? "bg-emerald-500" : "bg-slate-200",
                          !preferences.aiEnabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                            preferences.autoApprove && preferences.aiEnabled ? "left-7" : "left-1"
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                          <Filter className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">Auto-Decline</p>
                          <p className="text-sm text-slate-500">Automatically decline low-rated leads</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle("autoDecline")}
                        disabled={!preferences.aiEnabled}
                        className={cn(
                          "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                          preferences.autoDecline && preferences.aiEnabled ? "bg-red-500" : "bg-slate-200",
                          !preferences.aiEnabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                            preferences.autoDecline && preferences.aiEnabled ? "left-7" : "left-1"
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                          <Sliders className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">Auto-Manual Review</p>
                          <p className="text-sm text-slate-500">Send uncertain leads to manual review</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle("autoManualReview")}
                        disabled={!preferences.aiEnabled}
                        className={cn(
                          "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                          preferences.autoManualReview && preferences.aiEnabled ? "bg-amber-500" : "bg-slate-200",
                          !preferences.aiEnabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                            preferences.autoManualReview && preferences.aiEnabled ? "left-7" : "left-1"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
                  Rating Threshold
                </h3>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                        <Star className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Minimum Rating</p>
                        <p className="text-sm text-slate-500">Leads below this rating will be auto-declined</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => preferences.aiEnabled && handleRatingChange(rating)}
                          disabled={!preferences.aiEnabled}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer",
                            preferences.minRatingThreshold >= rating
                              ? "bg-amber-400 text-white"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200",
                            !preferences.aiEnabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">
                    Current threshold: {preferences.minRatingThreshold}/5 stars
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
                  AI Capabilities
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                          <Brain className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">Sentiment Analysis</p>
                          <p className="text-sm text-slate-500">Analyze lead tone and urgency</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle("sentimentAnalysis")}
                        disabled={!preferences.aiEnabled}
                        className={cn(
                          "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                          preferences.sentimentAnalysis && preferences.aiEnabled ? "bg-purple-500" : "bg-slate-200",
                          !preferences.aiEnabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                            preferences.sentimentAnalysis && preferences.aiEnabled ? "left-7" : "left-1"
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                          <Star className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">Priority Detection</p>
                          <p className="text-sm text-slate-500">Identify high-value potential customers</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle("priorityDetection")}
                        disabled={!preferences.aiEnabled}
                        className={cn(
                          "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                          preferences.priorityDetection && preferences.aiEnabled ? "bg-red-500" : "bg-slate-200",
                          !preferences.aiEnabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                            preferences.priorityDetection && preferences.aiEnabled ? "left-7" : "left-1"
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">Duplicate Detection</p>
                          <p className="text-sm text-slate-500">Identify and flag duplicate leads</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle("duplicateDetection")}
                        disabled={!preferences.aiEnabled}
                        className={cn(
                          "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                          preferences.duplicateDetection && preferences.aiEnabled ? "bg-blue-500" : "bg-slate-200",
                          !preferences.aiEnabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                            preferences.duplicateDetection && preferences.aiEnabled ? "left-7" : "left-1"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
                  AI Instructions
                </h3>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                      <MessageSquare className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Custom Instructions</p>
                      <p className="text-sm text-slate-500">Tell the AI how to handle your leads</p>
                    </div>
                  </div>
                  <textarea
                    value={aiInstructions}
                    onChange={(e) => handleInstructionsChange(e.target.value)}
                    disabled={!preferences.aiEnabled}
                    placeholder="E.g., Always prioritize leads from Los Angeles, decline inquiries for projects under $1000, flag leads mentioning 'urgent' as high priority..."
                    className={cn(
                      "w-full px-3 py-2 rounded-lg border border-slate-200 resize-none focus:border-blue-400 focus:outline-none text-slate-700 placeholder:text-slate-400",
                      !preferences.aiEnabled && "opacity-50 bg-slate-50"
                    )}
                    rows={5}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Be specific about your preferences, priorities, and any special handling rules.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex gap-3">
                <button
                  onClick={handleResetDefaults}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={handleSaveAll}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Save All Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all",
          toast.type === "success" && "bg-emerald-50 border-emerald-200",
          toast.type === "error" && "bg-red-50 border-red-200",
          toast.type === "info" && "bg-blue-50 border-blue-200"
        )}>
          {toast.type === "success" && <Check className="h-5 w-5 text-emerald-600" />}
          {toast.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600" />}
          {toast.type === "info" && <Bot className="h-5 w-5 text-blue-600" />}
          <span className="text-sm font-medium text-slate-700">{toast.message}</span>
        </div>
      )}
    </ThemeBackground>
  )
}
