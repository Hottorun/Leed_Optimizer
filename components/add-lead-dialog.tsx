"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Star, AlertTriangle } from "lucide-react"
import type { ContactPlatform, LeadStatus, Lead } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(value: string): string | null {
  if (!value.trim()) return "Email is required"
  if (value !== value.trim()) return "Email must not have leading or trailing spaces"
  if (!EMAIL_REGEX.test(value)) return "Enter a valid email address"
  return null
}

function validatePhone(value: string): string | null {
  if (!value.trim()) return "Phone is required"
  if (/^\s|\s$/.test(value)) return "Phone must not have leading or trailing spaces"
  const digits = value.replace(/\D/g, "")
  if (digits.length < 7) return "Phone number is too short (min 7 digits)"
  if (digits.length > 15) return "Phone number is too long (max 15 digits)"
  return null
}

function validateRequired(label: string, value: string): string | null {
  if (!value.trim()) return `${label} is required`
  if (/^\s|\s$/.test(value)) return `${label} must not have leading or trailing spaces`
  return null
}

interface AddLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddLead: (lead: {
    name: string
    phone: string
    email: string
    location: string
    workType: string
    conversationSummary: string
    approveMessage: string
    declineMessage: string
    rating: number
    ratingReason: string
    contactPlatform: ContactPlatform
    status: LeadStatus
  }) => Promise<void>
}

interface ExistingLead {
  name: string
  leadCount: number
  createdAt: string
}

type TouchedFields = Partial<Record<string, boolean>>

export function AddLeadDialog({ open, onOpenChange, onAddLead }: AddLeadDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingLeads, setExistingLeads] = useState<Lead[]>([])
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [location, setLocation] = useState("")
  const [workType, setWorkType] = useState("")
  const [conversationSummary, setConversationSummary] = useState("")
  const [approveMessage, setApproveMessage] = useState("")
  const [declineMessage, setDeclineMessage] = useState("")
  const [rating, setRating] = useState(3)
  const [ratingReason, setRatingReason] = useState("")
  const [contactPlatform, setContactPlatform] = useState<ContactPlatform>("whatsapp")
  const [status, setStatus] = useState<LeadStatus>("pending")
  const [touched, setTouched] = useState<TouchedFields>({})

  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }))

  const errors = {
    name: validateRequired("Name", name),
    phone: validatePhone(phone),
    email: validateEmail(email),
    location: validateRequired("Location", location),
    workType: validateRequired("Work type", workType),
    conversationSummary: validateRequired("Conversation summary", conversationSummary),
    approveMessage: validateRequired("Approval message", approveMessage),
    declineMessage: validateRequired("Decline message", declineMessage),
    ratingReason: validateRequired("Rating reason", ratingReason),
  }

  useEffect(() => {
    if (open) {
      fetch("/api/leads")
        .then((res) => res.json())
        .then(setExistingLeads)
        .catch(console.error)
    }
  }, [open])

  const existingLead = phone.trim()
    ? existingLeads.find((l) => l.phone.replace(/\D/g, "") === phone.replace(/\D/g, ""))
    : null

  const resetForm = () => {
    setName("")
    setPhone("")
    setEmail("")
    setLocation("")
    setWorkType("")
    setConversationSummary("")
    setApproveMessage("")
    setDeclineMessage("")
    setRating(3)
    setRatingReason("")
    setContactPlatform("whatsapp")
    setStatus("pending")
    setTouched({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Mark all fields touched to show all errors on submit
    setTouched({
      name: true, phone: true, email: true, location: true,
      workType: true, conversationSummary: true, approveMessage: true,
      declineMessage: true, ratingReason: true,
    })
    if (Object.values(errors).some(Boolean)) return
    setIsSubmitting(true)
    try {
      await onAddLead({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        location: location.trim(),
        workType: workType.trim(),
        conversationSummary: conversationSummary.trim(),
        approveMessage: approveMessage.trim(),
        declineMessage: declineMessage.trim(),
        rating,
        ratingReason: ratingReason.trim(),
        contactPlatform,
        status,
      })
      toast.success("Lead added successfully")
      resetForm()
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add lead"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = !Object.values(errors).some(Boolean)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Manually add a new lead to the system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => touch("name")}
                className={cn(touched.name && errors.name && "border-destructive focus-visible:ring-destructive")}
              />
              {touched.name && errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => touch("phone")}
                className={cn(touched.phone && errors.phone && "border-destructive focus-visible:ring-destructive")}
              />
              {touched.phone && errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
              {existingLead && !errors.phone && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mt-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-500">Existing Lead Found</p>
                    <p className="text-muted-foreground">
                      This phone number belongs to <span className="font-medium">{existingLead.name}</span>.
                      This will be lead #{(existingLead.leadCount ?? 0) + 1} from this customer.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="text"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => touch("email")}
                className={cn(touched.email && errors.email && "border-destructive focus-visible:ring-destructive")}
              />
              {touched.email && errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="Los Angeles, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onBlur={() => touch("location")}
                className={cn(touched.location && errors.location && "border-destructive focus-visible:ring-destructive")}
              />
              {touched.location && errors.location && (
                <p className="text-xs text-destructive">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="work-type">Work Type *</Label>
              <Input
                id="work-type"
                placeholder="Kitchen Renovation"
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                onBlur={() => touch("workType")}
                className={cn(touched.workType && errors.workType && "border-destructive focus-visible:ring-destructive")}
              />
              {touched.workType && errors.workType && (
                <p className="text-xs text-destructive">{errors.workType}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-platform">Contact Platform</Label>
              <Select value={contactPlatform} onValueChange={(v) => setContactPlatform(v as ContactPlatform)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="unrelated">Unrelated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6",
                        star <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                      )}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Conversation Summary *</Label>
            <Textarea
              id="summary"
              placeholder="Brief summary of the customer conversation..."
              value={conversationSummary}
              onChange={(e) => setConversationSummary(e.target.value)}
              onBlur={() => touch("conversationSummary")}
              className={cn("min-h-[80px]", touched.conversationSummary && errors.conversationSummary && "border-destructive focus-visible:ring-destructive")}
            />
            {touched.conversationSummary && errors.conversationSummary && (
              <p className="text-xs text-destructive">{errors.conversationSummary}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating-reason">Rating Reason *</Label>
            <Input
              id="rating-reason"
              placeholder="Why this rating?"
              value={ratingReason}
              onChange={(e) => setRatingReason(e.target.value)}
              onBlur={() => touch("ratingReason")}
              className={cn(touched.ratingReason && errors.ratingReason && "border-destructive focus-visible:ring-destructive")}
            />
            {touched.ratingReason && errors.ratingReason && (
              <p className="text-xs text-destructive">{errors.ratingReason}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="approve-message">Approval Message *</Label>
            <Textarea
              id="approve-message"
              placeholder="Message to send if approved..."
              value={approveMessage}
              onChange={(e) => setApproveMessage(e.target.value)}
              onBlur={() => touch("approveMessage")}
              className={cn("min-h-[80px]", touched.approveMessage && errors.approveMessage && "border-destructive focus-visible:ring-destructive")}
            />
            {touched.approveMessage && errors.approveMessage && (
              <p className="text-xs text-destructive">{errors.approveMessage}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="decline-message">Decline Message *</Label>
            <Textarea
              id="decline-message"
              placeholder="Message to send if declined..."
              value={declineMessage}
              onChange={(e) => setDeclineMessage(e.target.value)}
              onBlur={() => touch("declineMessage")}
              className={cn("min-h-[80px]", touched.declineMessage && errors.declineMessage && "border-destructive focus-visible:ring-destructive")}
            />
            {touched.declineMessage && errors.declineMessage && (
              <p className="text-xs text-destructive">{errors.declineMessage}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid} className="cursor-pointer">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Lead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
