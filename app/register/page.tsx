"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, Loader2, Mail, Lock, User, ArrowLeft, Check, X, Key } from "lucide-react"
import { cn } from "@/lib/utils"
import { translations, type Language, type TranslationKey } from "@/lib/translations"

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en"
  const stored = localStorage.getItem("language")
  return (stored === "de" || stored === "en") ? stored : "en"
}

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /\d/.test(p) },
  { label: "One special character (!@#$%^&*)", test: (p) => /[!@#$%^&*]/.test(p) },
]

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  const passed = passwordRequirements.filter((req) => req.test(password)).length
  
  if (password.length === 0) return { score: 0, label: "", color: "" }
  if (passed <= 1) return { score: 1, label: "Weak", color: "bg-red-500" }
  if (passed <= 2) return { score: 2, label: "Fair", color: "bg-orange-500" }
  if (passed <= 3) return { score: 3, label: "Good", color: "bg-yellow-500" }
  if (passed <= 4) return { score: 4, label: "Strong", color: "bg-emerald-500" }
  return { score: 5, label: "Very strong", color: "bg-emerald-600" }
}

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const router = useRouter()
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: TranslationKey): string => translations[language][key] || key

  useEffect(() => {
    setLanguage(getInitialLanguage())
  }, [])

  const passwordStrength = getPasswordStrength(password)
  const allRequirementsMet = passwordRequirements.every((req) => req.test(password))
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          router.push("/")
        }
      })
      .catch(() => {})
  }, [router])

  useEffect(() => {
    if (email.length > 0) {
      const timeoutId = setTimeout(async () => {
        setIsCheckingEmail(true)
        try {
          const res = await fetch(`/api/users/check?email=${encodeURIComponent(email)}`)
          const data = await res.json()
          if (data.exists) {
            setEmailError("This email is already registered")
          } else {
            setEmailError("")
          }
        } catch {
          setEmailError("")
        } finally {
          setIsCheckingEmail(false)
        }
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setEmailError("")
    }
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!allRequirementsMet) {
      setError("Please meet all password requirements")
      return
    }

    if (!passwordsMatch) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, inviteCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed")
        return
      }

      if (data.needsTeam) {
        router.push("/create-team")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError("An error occurred. Please try again.")
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
            <h1 className="text-xl font-semibold text-foreground">{t("createAccount")}</h1>
            <p className="text-muted-foreground mt-1">{t("signUp")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">{t("name")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-10 cursor-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn("pl-10 cursor-text", emailError && "border-destructive")}
                />
                {isCheckingEmail && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
                )}
              </div>
              {emailError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <X className="size-3" />
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">{t("password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="A secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 cursor-text"
                />
              </div>
              
              {password.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("passwordStrength")}:</span>
                    <span className={cn(
                      passwordStrength.score >= 4 ? "text-emerald-600 font-medium" :
                      passwordStrength.score >= 2 ? "text-yellow-600 font-medium" :
                      "text-red-600 font-medium"
                    )}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          level <= passwordStrength.score ? passwordStrength.color : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <ul className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <li
                        key={index}
                        className={cn(
                          "text-xs flex items-center gap-2 transition-colors",
                          req.test(password) ? "text-emerald-600" : "text-muted-foreground"
                        )}
                      >
                        {req.test(password) ? (
                          <Check className="size-3" />
                        ) : (
                          <div className="size-3 rounded-full border border-muted-foreground" />
                        )}
                        {req.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">{t("confirmPassword")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={cn(
                    "pl-10 cursor-text",
                    confirmPassword.length > 0 && !passwordsMatch && "border-destructive"
                  )}
                />
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <X className="size-3" />
                  {t("passwordsDoNotMatch")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inviteCode" className="text-sm font-medium">
                {t("inviteCode")} <span className="text-muted-foreground font-normal">{t("inviteCodeOptional")}</span>
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="XXXX-XXXX-XXXX"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="pl-10 cursor-text font-mono tracking-wider"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("haveInviteCode")}
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center bg-destructive/10 py-2 rounded-lg">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading || !!emailError || !allRequirementsMet || !passwordsMatch}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("creatingAccount")}
                </>
              ) : (
                t("createAccount")
              )}
            </Button>
          </form>

          <div className="mt-6">
            <p className="text-center text-sm text-muted-foreground">
              {t("alreadyHaveAccount")}{" "}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                {t("signIn")}
              </Link>
            </p>
          </div>
        </div>

        <Link href="/" className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          {t("backToHome")}
        </Link>
      </div>
    </div>
  )
}