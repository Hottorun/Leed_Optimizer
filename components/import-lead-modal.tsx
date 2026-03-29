"use client"

import { useState } from "react"
import { X, MessageSquare, Mail, Globe } from "lucide-react"

type LeadSource = "whatsapp" | "email" | "other"

interface ImportLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ImportLeadModal({ isOpen, onClose, onSuccess }: ImportLeadModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    workType: "",
    message: "",
    source: "email" as LeadSource,
    conversationSummary: "",
  })
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.email && !formData.phone) {
      setError("Either email or phone is required")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to import lead")
      }

      setFormData({
        name: "",
        email: "",
        phone: "",
        location: "",
        workType: "",
        message: "",
        source: "email",
        conversationSummary: "",
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import lead")
    } finally {
      setIsLoading(false)
    }
  }

  const sourceOptions: { value: LeadSource; label: string; icon: typeof MessageSquare }[] = [
    { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
    { value: "email", label: "Email", icon: Mail },
    { value: "other", label: "Other", icon: Globe },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Import Lead</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Source <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {sourceOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, source: value })}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    formData.source === value
                      ? "border-foreground bg-foreground text-background"
                      : "border-slate-300 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                placeholder="+1 555-123-4567"
              />
            </div>
          </div>
          {(!formData.email && !formData.phone) && (
            <p className="text-xs text-red-500 -mt-2">Either email or phone is required</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                placeholder="New York, NY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Service Type
              </label>
              <input
                type="text"
                value={formData.workType}
                onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                placeholder="Home Repair"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Conversation Summary
            </label>
            <textarea
              value={formData.conversationSummary}
              onChange={(e) => setFormData({ ...formData, conversationSummary: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none text-slate-800 placeholder:text-slate-400"
              placeholder="Brief summary of the lead's inquiry..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none text-slate-800 placeholder:text-slate-400"
              placeholder="Full message from the lead..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || (!formData.email && !formData.phone)}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Importing..." : "Import Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
