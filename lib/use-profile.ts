"use client"

import { useState, useEffect } from "react"
import { useUser } from "./use-user"

export interface Profile {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  company: string
}

const defaultProfile: Profile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  company: "",
}

export function useProfile() {
  const { user } = useUser()
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    fetch("/api/settings/profile")
      .then(res => res.json())
      .then(data => {
        if (data.name) {
          const nameParts = data.name.split(" ")
          const firstName = nameParts[0] || ""
          const lastName = nameParts.slice(1).join(" ") || ""
          setProfile({
            firstName,
            lastName,
            email: data.email || "",
            phone: data.phone || "",
            location: data.location || "",
            company: data.company || "",
          })
        } else if (data.email) {
          setProfile(prev => ({ ...prev, email: data.email }))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.id])

  const saveProfile = async (newProfile: Profile): Promise<boolean> => {
    try {
      const fullName = `${newProfile.firstName} ${newProfile.lastName}`.trim()
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          phone: newProfile.phone,
          location: newProfile.location,
          company: newProfile.company,
        }),
      })
      if (res.ok) {
        setProfile(newProfile)
        return true
      }
      return false
    } catch (err) {
      console.error("Failed to save profile:", err)
      return false
    }
  }

  return { profile, saveProfile, loading }
}
