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
  const [deleteType, setDeleteType] = useState<"declined" | "all">("declined")
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

  const handleDeleteClick = (type: "declined" | "all") => {
    setDeleteType(type)
    setShowDeleteConfirm(true)
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
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </button>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-800">Data Management</h1>
            <p className="text-slate-500 mt-1">Export, import, and manage your lead data</p>
          </div>

          {/* Current Data Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Current Data</h3>
                  <p className="text-sm text-slate-500">{leads.length} leads stored in database</p>
                </div>
              </div>
              <button
                onClick={() => mutate()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Import/Export Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Export Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Export Data</h3>
                  <p className="text-sm text-slate-500">Download as JSON</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Download all your leads as a JSON file for backup or transfer to another system.
              </p>
              <button
                onClick={handleExportData}
                disabled={exporting || leads.length === 0}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer",
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

            {/* Import Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <Upload className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Import Data</h3>
                  <p className="text-sm text-slate-500">Upload from JSON</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Import leads from a previously exported JSON file. Duplicates will be handled automatically.
              </p>
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
                  "w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                  importing
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                )}
              >
                {importing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                  "mt-4 p-4 rounded-lg border",
                  importResult.failed > 0 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
                )}>
                  <div className="flex items-center gap-2">
                    <Check className={cn("h-4 w-4", importResult.failed > 0 ? "text-amber-600" : "text-emerald-600")} />
                    <p className={cn("text-sm font-medium", importResult.failed > 0 ? "text-amber-800" : "text-emerald-800")}>
                      Import Complete
                    </p>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {importResult.imported} leads imported successfully
                    {importResult.failed > 0 && `, ${importResult.failed} failed`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cleanup Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="font-semibold text-slate-800 mb-4">Cleanup Tools</h3>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <Trash2 className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Delete Declined Leads</p>
                  <p className="text-sm text-slate-500">
                    {declinedCount === 0 ? "No declined leads" : `${declinedCount} declined leads found`}
                  </p>
                </div>
              </div>
                <button
                  onClick={() => handleDeleteClick("declined")}
                  disabled={declinedCount === 0}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    declinedCount === 0
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-amber-600 text-white hover:bg-amber-700"
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Declined
                </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl border border-red-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Danger Zone</h3>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-200">
              <div>
                <p className="font-medium text-red-800">Clear All Data</p>
                <p className="text-sm text-red-600">
                  Permanently delete all leads. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => handleDeleteClick("all")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  {deleteType === "declined" ? "Delete Declined Leads" : "Clear All Data"}
                </h3>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              {deleteType === "declined" 
                ? `Are you sure you want to delete all ${declinedCount} declined leads? This will permanently remove them from your database.`
                : "Are you sure you want to delete ALL leads? This will permanently remove all your data from the database and cannot be undone."}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={deleteType === "declined" ? handleDeleteAllDeclined : handleClearAllData}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                {deleteType === "declined" ? "Delete Declined" : "Clear All Data"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all",
          toast.type === "success" && "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700",
          toast.type === "error" && "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700",
          toast.type === "info" && "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
        )}>
          {toast.type === "success" && <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          {toast.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />}
          {toast.type === "info" && <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{toast.message}</span>
        </div>
      )}
    </ThemeBackground>
  )
}
