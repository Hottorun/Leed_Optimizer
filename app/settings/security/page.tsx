"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, Key, Smartphone, LogIn, Clock, Check, X, Loader2, Monitor, Globe } from "lucide-react"
import { ThemeBackground } from "@/lib/use-theme-gradient"

interface LoginSession {
  id: string
  device: string
  browser: string
  ip: string
  location: string
  lastActive: string
  current: boolean
}

export default function SecurityPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<LoginSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/settings/sessions")
      .then(res => res.json())
      .then(data => {
        if (data.sessions) {
          setSessions(data.sessions)
        }
      })
      .catch(err => {
        console.error("Failed to load sessions:", err)
        setError("Failed to load sessions")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to log out this session?")) return
    
    setRevokingId(sessionId)
    try {
      const res = await fetch(`/api/settings/sessions?sessionId=${sessionId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId))
      } else {
        setError("Failed to revoke session")
      }
    } catch (err) {
      console.error("Failed to revoke session:", err)
      setError("Failed to revoke session")
    } finally {
      setRevokingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <ThemeBackground className="p-6">
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
            <h1 className="text-xl font-semibold text-slate-800">Security</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your account security and sessions</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Password Section */}
            <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Key className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-800">Password</h3>
                <p className="text-sm text-slate-500 mt-1">Change your password to keep your account secure</p>
                <button
                  onClick={() => router.push("/settings/password")}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <Smartphone className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-slate-800">Two-Factor Authentication</h3>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Coming Soon</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account</p>
              </div>
            </div>

            {/* Active Sessions */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <LogIn className="h-5 w-5 text-slate-400" />
                <h3 className="font-medium text-slate-800">Active Sessions</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Manage your active login sessions</p>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No active sessions
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                          {session.device.toLowerCase().includes("mac") || session.device.toLowerCase().includes("iphone") ? (
                            <Monitor className="h-5 w-5 text-slate-600" />
                          ) : (
                            <Globe className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-800">{session.device}</p>
                            {session.current && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">
                            {session.browser} • {session.ip}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {session.location} • {formatDate(session.lastActive)}
                          </p>
                        </div>
                      </div>
                      {!session.current && (
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={revokingId === session.id}
                          className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer disabled:opacity-50"
                        >
                          {revokingId === session.id ? "Revoking..." : "Revoke"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security Tips */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <h4 className="font-medium text-blue-800 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Tips
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-blue-700">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-blue-500" />
                  Use a strong, unique password
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-blue-500" />
                  Enable two-factor authentication when available
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-blue-500" />
                  Don't use public WiFi for sensitive transactions
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-blue-500" />
                  Log out from shared devices
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ThemeBackground>
  )
}
