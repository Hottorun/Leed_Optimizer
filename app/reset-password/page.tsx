"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, Loader2, Lock, ArrowLeft, Check, AlertTriangle } from "lucide-react"
import { useTheme } from "next-themes"
import { translations, type Language, type TranslationKey } from "@/lib/translations"

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en"
  const stored = localStorage.getItem("language")
  return (stored === "de" || stored === "en") ? stored : "en"
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const { resolvedTheme } = useTheme()
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: TranslationKey): string => translations[language][key] || key

  useEffect(() => {
    setLanguage(getInitialLanguage())
  }, [])

  useEffect(() => {
    if (!token) {
      setIsValidToken(false)
      setError(t("invalidToken"))
    } else {
      setIsValidToken(true)
    }
  }, [token, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"))
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t("passwordResetFailed"))
        return
      }

      setIsSuccess(true)
    } catch {
      setError(t("passwordResetFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-4">
        <div className="w-full max-w-md text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-6">
            <Check className="size-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            {t("passwordResetSuccess")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {t("signInToManage")}
          </p>
          <Link href="/login">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              {t("signIn")}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-600">
                <Zap className="size-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-800 dark:text-white">aclea</span>
            </Link>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-white">{t("resetPassword")}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t("enterNewPassword")}</p>
          </div>

          {isValidToken === false ? (
            <div className="text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
                <AlertTriangle className="size-6 text-red-600" />
              </div>
              <p className="text-red-600 mb-4">{error || t("invalidToken")}</p>
              <Link href="/login">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  {t("signIn")}
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("newPassword")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 cursor-text bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("confirmPassword")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10 cursor-text bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center bg-red-50 py-2 rounded-lg">{error}</p>
              )}

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("save")}...
                  </>
                ) : (
                  t("save")
                )}
              </Button>
            </form>
          )}
        </div>

        <Link href="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
          <ArrowLeft className="size-4" />
          {t("backToHome")}
        </Link>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
