import type { CalendarEvent, EventFormData } from "./event-types"

export class EventService {
  private static readonly STORAGE_KEY = "calendar-events"

  static getAllEvents(): CalendarEvent[] {
    if (typeof window === "undefined") return []

    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static getEventsByDate(date: string): CalendarEvent[] {
    return this.getAllEvents().filter((event) => event.date === date)
  }

  static getEventsByUserId(userId: string): CalendarEvent[] {
    return this.getAllEvents().filter((event) => event.userId === userId)
  }

  static addEvent(eventData: EventFormData, userId: string): CalendarEvent {
    const events = this.getAllEvents()
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
      userId,
    }

    events.push(newEvent)
    this.saveEvents(events)
    return newEvent
  }

  static updateEvent(eventId: string, eventData: EventFormData): CalendarEvent | null {
    const events = this.getAllEvents()
    const eventIndex = events.findIndex((event) => event.id === eventId)

    if (eventIndex === -1) return null

    events[eventIndex] = { ...events[eventIndex], ...eventData }
    this.saveEvents(events)
    return events[eventIndex]
  }

  static deleteEvent(eventId: string): boolean {
    const events = this.getAllEvents()
    const filteredEvents = events.filter((event) => event.id !== eventId)

    if (filteredEvents.length === events.length) return false

    this.saveEvents(filteredEvents)
    return true
  }

  private static saveEvents(events: CalendarEvent[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events))
    }
  }
}
