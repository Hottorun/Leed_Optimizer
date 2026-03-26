"use client"

import { useState, useEffect } from "react"

export interface Profile {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  company: string
}

const STORAGE_KEY = "aclea_profile"

const defaultProfile: Profile = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@aclea.com",
  phone: "+1 555 123 4567",
  location: "Los Angeles, CA",
  company: "Aclea Inc.",
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setProfile(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse profile:", e)
      }
    }
    setLoading(false)
  }, [])

  const saveProfile = (newProfile: Profile) => {
    setProfile(newProfile)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile))
  }

  return { profile, saveProfile, loading }
}
