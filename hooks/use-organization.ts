"use client"

import { useState, useEffect } from "react"
import { getOrganizationSettings, type OrganizationSettings } from "@/lib/actions/v2/settings"

const defaultSettings: OrganizationSettings = {
  name: "Soddo Hospital",
  email: "",
  phone: "",
  address: "",
  timezone: "Africa/Addis_Ababa",
  logoUrl: null,
  useEthiopianCalendar: true,
  dualCalendarDisplay: true,
  permitExpiryAlerts: true,
  alertDaysBefore: 30,
}

// Cache the settings globally to avoid refetching
let cachedSettings: OrganizationSettings | null = null
let fetchPromise: Promise<OrganizationSettings> | null = null

async function fetchSettings(): Promise<OrganizationSettings> {
  if (cachedSettings) return cachedSettings

  if (fetchPromise) return fetchPromise

  fetchPromise = getOrganizationSettings().then((result) => {
    if (result.success && result.data) {
      cachedSettings = result.data
      return result.data
    }
    return defaultSettings
  }).catch(() => defaultSettings)

  return fetchPromise
}

// Listeners for state updates
const listeners = new Set<(settings: OrganizationSettings) => void>()

export function updateOrganizationState(settings: OrganizationSettings) {
  cachedSettings = settings
  listeners.forEach((listener) => listener(settings))
}

// Function to invalidate cache (call after updating settings)
export function invalidateOrganizationCache() {
  cachedSettings = null
  fetchPromise = null
}

export function useOrganization() {
  const [settings, setSettings] = useState<OrganizationSettings>(cachedSettings || defaultSettings)
  const [isLoading, setIsLoading] = useState(!cachedSettings)

  useEffect(() => {
    let mounted = true

    // Subscribe to updates
    const handleUpdate = (newSettings: OrganizationSettings) => {
      if (mounted) {
        setSettings(newSettings)
        setIsLoading(false)
      }
    }
    listeners.add(handleUpdate)

    // Initial fetch if needed
    fetchSettings().then((data) => {
      if (mounted) {
        setSettings(data)
        setIsLoading(false)
      }
    })

    return () => {
      mounted = false
      listeners.delete(handleUpdate)
    }
  }, [])

  return { settings, isLoading }
}
