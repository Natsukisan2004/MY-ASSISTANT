"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { EventService } from "@/lib/event-service"
import type { CalendarEvent, EventFormData } from "@/lib/event-types"
import { useAuth } from "./auth-context"

interface EventContextType {
  events: CalendarEvent[]
  addEvent: (eventData: EventFormData) => CalendarEvent | null
  updateEvent: (eventId: string, eventData: EventFormData) => CalendarEvent | null
  deleteEvent: (eventId: string) => boolean
  getEventsByDate: (date: string) => CalendarEvent[]
  refreshEvents: () => void
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const refreshEvents = () => {
    if (user) {
      const userEvents = EventService.getEventsByUserId(user.id)
      setEvents(userEvents)
    } else {
      setEvents([])
    }
  }

  useEffect(() => {
    refreshEvents()
  }, [user])

  const addEvent = (eventData: EventFormData): CalendarEvent | null => {
    if (!user) return null

    const newEvent = EventService.addEvent(eventData, user.id)
    refreshEvents()
    return newEvent
  }

  const updateEvent = (eventId: string, eventData: EventFormData): CalendarEvent | null => {
    const updatedEvent = EventService.updateEvent(eventId, eventData)
    if (updatedEvent) {
      refreshEvents()
    }
    return updatedEvent
  }

  const deleteEvent = (eventId: string): boolean => {
    const success = EventService.deleteEvent(eventId)
    if (success) {
      refreshEvents()
    }
    return success
  }

  const getEventsByDate = (date: string): CalendarEvent[] => {
    return events.filter((event) => event.date === date)
  }

  return (
    <EventContext.Provider
      value={{
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventsByDate,
        refreshEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventProvider")
  }
  return context
}
