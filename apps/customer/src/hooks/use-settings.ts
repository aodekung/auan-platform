import { useQuery } from "@tanstack/react-query"

import { apiClient } from "../lib/api-client"
import type { BusinessHoursResponse, StoreSettingsResponse } from "../api"

export function useStoreSettings() {
  return useQuery({
    queryKey: ["settings", "store"],
    queryFn: () => apiClient.get<StoreSettingsResponse>("/settings/store"),
    staleTime: 1000 * 60 * 10, // Store info rarely changes
  })
}

export function useBusinessHours() {
  return useQuery({
    queryKey: ["settings", "business-hours"],
    queryFn: () => apiClient.get<BusinessHoursResponse>("/settings/business-hours"),
    staleTime: 1000 * 60 * 10,
  })
}

/** Derived hook: is the store currently open? */
export function useIsStoreOpen() {
  const { data: storeSettings } = useStoreSettings()
  const { data: businessHours } = useBusinessHours()

  if (!storeSettings || !businessHours) return { isOpen: null, nextOpenTime: null }

  // If store status is not "open", it's closed
  if (!storeSettings.isOpen) {
    return { isOpen: false, nextOpenTime: null }
  }

  // Check temporary closure
  const { temporaryClosure } = businessHours
  if (temporaryClosure.enabled && temporaryClosure.end) {
    const endDate = new Date(temporaryClosure.end)
    if (endDate > new Date()) {
      return { isOpen: false, nextOpenTime: endDate }
    }
  }

  // Check current time against today's schedule
  // Use Asia/Bangkok timezone for store hours
  const now = new Date()
  const bangkokTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }))
  const dayOfWeek = bangkokTime.toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Bangkok" }).toLowerCase()
  const todaySchedule = businessHours.schedule.find((s) => s.day === dayOfWeek)

  if (!todaySchedule) {
    return { isOpen: false, nextOpenTime: null }
  }

  const [openH, openM] = todaySchedule.open.split(":").map(Number)
  const [closeH, closeM] = todaySchedule.close.split(":").map(Number)

  const currentMinutes = bangkokTime.getHours() * 60 + bangkokTime.getMinutes()
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes

  return { isOpen, nextOpenTime: null }
}
