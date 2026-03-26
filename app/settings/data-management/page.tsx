"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Upload, FileSpreadsheet, Trash2, Check, AlertTriangle, Database, RefreshCw } from "lucide-react"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DataManagementPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [importResult, setImportResult] = useState<{ imported: number; failed: number } | null>(null)

  const { data: leads = [], mutate } = useSWR<any[]>("/api/leads", fetcher)

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleExportData = async () => {
    setExporting(true)
    try {
      const data = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        leads: leads,
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `aclea-leads-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showToast(`Successfully exported ${leads.length} leads`, "success")
    } catch (error) {
      showToast("Failed to export data", "error")
    }
    setExporting(false)
  }

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.leads || !Array.isArray(data.leads)) {
        throw new Error("Invalid file format")
      }

      let imported = 0
      let failed = 0

      for (const lead of data.leads) {
        try {
          const response = await fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              location: lead.location || "",
              workType: lead.workType || "",
              rating: lead.rating || 0,
              ratingReason: lead.ratingReason || "",
              conversationSummary: lead.conversationSummary || "",
              source: lead.source || "email",
              status: lead.status || "manual",
              isLoyal: lead.isLoyal || false,
            }),
          })

          if (response.ok) {
            imported++
          } else {
            failed++
          }
        } catch {
          failed++
        }
      }

      setImportResult({ imported, failed })
      mutate()
      showToast(`Imported ${imported} leads${failed > 0 ? `, ${failed} failed` : ""}`, failed > 0 ? "error" : "success")
    } catch (error) {
      showToast("Failed to import data. Invalid file format.", "error")
    }

    setImporting(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDeleteAllDeclined = async () => {
    try {
      const declinedLeads = leads.filter((l: any) => l.status === "declined")
      let deleted = 0

      for (const lead of declinedLeads) {
        const response = await fetch(`/api/leads/${lead.id}`, { method: "DELETE" })
        if (response.ok) deleted++
      }

      mutate()
      setShowDeleteConfirm(false)
      showToast(`Deleted ${deleted} declined leads`, "success")
    } catch {
      showToast("Failed to delete declined leads", "error")
    }
  }

  const handleClearAllData = async () => {
    try {
      const response = await fetch("/api/leads/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteAll" }),
      })

      if (response.ok) {
        mutate()
        setShowDeleteConfirm(false)
        showToast("All leads have been deleted", "success")
      } else {
        showToast("Failed to clear data", "error")
      }
    } catch {
      showToast("Failed to clear data", "error")
    }
  }

  const declinedCount = leads.filter((l: any) => l.status === "declined").length

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
              <h1 className="text-xl font-semibold text-slate-800">Data Management</h1>
              <p className="text-sm text-slate-500 mt-1">Export, import, and manage your lead data</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Database className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Current Data</p>
                    <p className="text-sm text-slate-500">{leads.length} leads stored</p>
                  </div>
                </div>
                <button
                  onClick={() => mutate()}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Export Data</h3>
                <p className="text-sm text-slate-500">Download all your leads as a JSON file for backup or transfer.</p>
                <button
                  onClick={handleExportData}
                  disabled={exporting || leads.length === 0}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    exporting || leads.length === 0
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                >
                  {exporting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export All Leads
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Import Data</h3>
                <p className="text-sm text-slate-500">Import leads from a previously exported JSON file.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    importing
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {importing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Import from File
                    </>
                  )}
                </button>

                {importResult && (
                  <div className={cn(
                    "p-4 rounded-lg border",
                    importResult.failed > 0 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
                  )}>
                    <p className={cn("text-sm font-medium", importResult.failed > 0 ? "text-amber-800" : "text-emerald-800")}>
                      Import Complete
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      {importResult.imported} leads imported successfully
                      {importResult.failed > 0 && `, ${importResult.failed} failed`}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">Cleanup</h3>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">Delete Declined Leads</p>
                      <p className="text-sm text-slate-500">{declinedCount} declined leads</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={declinedCount === 0}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                        declinedCount === 0
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete All
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                <div className="p-4 rounded-xl border border-red-200 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-800">Clear All Data</p>
                      <p className="text-sm text-red-600">Permanently delete all leads. This cannot be undone.</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Confirm Deletion</h2>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete all declined leads? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllDeclined}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                Delete Declined
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all",
          toast.type === "success" && "bg-emerald-50 border-emerald-200",
          toast.type === "error" && "bg-red-50 border-red-200",
          toast.type === "info" && "bg-blue-50 border-blue-200"
        )}>
          {toast.type === "success" && <Check className="h-5 w-5 text-emerald-600" />}
          {toast.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600" />}
          {toast.type === "info" && <FileSpreadsheet className="h-5 w-5 text-blue-600" />}
          <span className="text-sm font-medium text-slate-700">{toast.message}</span>
        </div>
      )}
    </ThemeBackground>
  )
}
