"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarComponent } from "@/components/calendar-component"
import { LogOut, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { EventDialog } from "@/components/event-dialog"
import { EventList } from "@/components/event-list"
import { EventSearch } from "@/components/event-search"
import { useEvents } from "@/contexts/event-context"
import type { CalendarEvent } from "@/lib/event-types"
import { Plus } from "lucide-react"
import { ChatButton } from "@/components/chat-button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"
import { SpeechPermissionCheck } from "@/components/speech-permission-check"
import { APIDebugPanel } from "@/components/api-debug-panel"

export default function CalendarPage() {
  const { user, isLoading, signOut } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [showSpeechPermission, setShowSpeechPermission] = useState(true)

  const { events, getEventsByDate, addEvent, updateEvent, deleteEvent } = useEvents()
  const selectedDateEvents = getEventsByDate(selectedDate.toISOString().split("T")[0])

  const handleAddEvent = () => {
    setEditingEvent(null)
    setShowEventDialog(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setShowEventDialog(true)
  }

  const handleSaveEvent = (eventData: any) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData)
    } else {
      addEvent(eventData)
    }
    setEditingEvent(null)
  }

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId)
  }

  const handleDateDoubleClick = (date: Date) => {
    setSelectedDate(date)
    setEditingEvent(null)
    setShowEventDialog(true)
  }

  const handleEventSelect = (event: CalendarEvent) => {
    const eventDate = new Date(event.date)
    setSelectedDate(eventDate)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedDate(new Date(event.date))
  }

  const language = useLanguage().language

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">{t("header.title")}</h1>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {t("header.logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Speech Permission Check */}
      {showSpeechPermission && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <SpeechPermissionCheck
            onPermissionGranted={() => setShowSpeechPermission(false)}
            onPermissionDenied={() => setShowSpeechPermission(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate.toLocaleDateString({ zh: "zh-CN", ja: "ja-JP", en: "en-US" }[language], {
                    year: "numeric",
                    month: "long",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  events={events}
                  onDateDoubleClick={handleDateDoubleClick}
                  onEventClick={handleEventClick}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <EventSearch
              events={events}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onEventSelect={handleEventSelect}
            />

            {/* Selected Date Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString({ zh: "zh-CN", ja: "ja-JP", en: "en-US" }[language], {
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })}
                </CardTitle>
                <Button size="sm" onClick={handleAddEvent}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t("calendar.addEvent")}
                </Button>
              </CardHeader>
              <CardContent>
                <EventList
                  events={selectedDateEvents}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={handleDeleteEvent}
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("calendar.quickActions")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline" onClick={handleAddEvent}>
                  {t("calendar.addEvent")}
                </Button>
                <Button className="w-full" variant="outline">
                  {t("calendar.viewWeek")}
                </Button>
                <Button className="w-full" variant="outline">
                  {t("calendar.viewMonth")}
                </Button>
              </CardContent>
            </Card>
          </div>

          <EventDialog
            open={showEventDialog}
            onOpenChange={setShowEventDialog}
            onSave={handleSaveEvent}
            event={editingEvent}
            selectedDate={selectedDate}
          />
        </div>
        {/* Chat Button */}
        <ChatButton />
        <APIDebugPanel />
      </main>
    </div>
  )
}
