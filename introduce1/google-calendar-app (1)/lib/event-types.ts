export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string // YYYY-MM-DD format
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  color: string
  userId: string
}

export type EventFormData = Omit<CalendarEvent, "id" | "userId">
