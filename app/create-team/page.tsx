"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, Loader2, Users, ArrowLeft } from "lucide-react"

export default function CreateTeamPage() {
  const [teamName, setTeamName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login")
        } else if (data.user.teamId) {
          router.push("/")
        }
      })
      .catch(() => {
        router.push("/login")
      })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Team konnte nicht erstellt werden")
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-emerald-50/30 dark:to-emerald-950/10 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-600">
                <Zap className="size-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">aclea</span>
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Team erstellen</h1>
            <p className="text-muted-foreground mt-1 text-center">
              Erstellen Sie Ihr Team, um gemeinsam Leads zu verwalten
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="teamName" className="text-sm font-medium">Teamname</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="teamName"
                  type="text"
                  placeholder="z.B. Marketing Team"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  className="pl-10 cursor-text"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center bg-destructive/10 py-2 rounded-lg">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading || !teamName.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Team wird erstellt...
                </>
              ) : (
                "Team erstellen"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Sie konnen spater weitere Teammitglieder einladen.
          </p>
        </div>

        <Link href="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          Abmelden
        </Link>
      </div>
    </div>
  )
}
