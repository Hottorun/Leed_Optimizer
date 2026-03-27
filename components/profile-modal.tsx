"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Loader2, AlertTriangle, User, Mail, Phone, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/use-user"
import type { UserProfile } from "@/lib/supabase"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const router = useRouter()
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [industry, setIndustry] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    if (!user?.id) {
      onOpenChange(false)
      return
    }

    const loadProfile = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/user/profile`)
        const data = await res.json()
        
        if (data) {
          setName(data.name || "")
          setEmail(data.email || "")
          setPhone(data.phone || "")
          setLocation(data.industry || "")
          setIndustry(data.industry || "")
        }
      } catch (err) {
        console.error("Failed to load profile:", err)
        showToast("Failed to load profile", "error")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user?.id, onOpenChange])

  const handleSave = async () => {
    if (!name || !email) {
      showToast("Name and email are required", "error")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/user/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, location, industry }),
      })

      if (res.ok) {
        showToast("Profile updated successfully", "success")
        onOpenChange(false)
      } else {
        showToast("Failed to update profile", "error")
      }
    } catch (err) {
      console.error("Failed to update profile:", err)
      showToast("Failed to update profile", "error")
    } finally {
      setIsSaving(false)
    }
  }

  if (!user?.id || isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          <DialogContent className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </DialogContent>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-6">
        <DialogHeader>
          <DialogTitle>Profile Information</DialogTitle>
          <DialogDescription>
            Update your personal information
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="cursor-pointer"
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="profile-phone">Phone</Label>
            <Input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="profile-location">Location</Label>
            <Input
              id="profile-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your location (city, country)"
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="profile-industry">Industry</Label>
            <Input
              id="profile-industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Enter your industry or company"
              className="cursor-pointer"
            />
          </div>
        </DialogContent>

        {toast && (
          <div className={cn(
            "fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all",
            toast.type === "success" && "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700",
            toast.type === "error" && "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700",
            toast.type === "info" && "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
          )}>
            {toast.type === "success" && <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            {toast.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />}
            {toast.type === "info" && <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{toast.message}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="cursor-pointer">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}