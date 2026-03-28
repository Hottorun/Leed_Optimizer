"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, Key, Smartphone, LogIn, Clock, Check, Loader2, Globe } from "lucide-react"
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
    if (!confirm("Log out this session?")) return

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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <ThemeBackground className="p-6">
      <div className="max-w-lg mx-auto space-y-5">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div>
          <h1 className="text-xl font-semibold tracking-tight">Security</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Account security and sessions</p>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            <button
              onClick={() => router.push("/settings/password")}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/50 transition-colors text-left"
            >
              <Key className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-muted-foreground">Change your password</p>
              </div>
            </button>
            <div className="flex items-center gap-3 px-5 py-4">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Two-Factor Auth</p>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Coming soon</span>
                </div>
                <p className="text-xs text-muted-foreground">Extra security layer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Active Sessions
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No active sessions
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{session.device}</p>
                        {session.current && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {session.browser} - {formatDate(session.lastActive)}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={revokingId === session.id}
                      className="text-xs text-destructive hover:text-destructive/80 disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4" />
            Security Tips
          </h4>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Check className="h-3 w-3" />
              Use a strong, unique password
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="h-3 w-3" />
              Enable two-factor authentication
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="h-3 w-3" />
              Log out from shared devices
            </li>
          </ul>
        </div>
      </div>
    </ThemeBackground>
  )
}
