"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X } from "lucide-react"
import type { CalendarEvent } from "@/lib/event-types"
import { EventList } from "./event-list"

interface EventSearchProps {
  events: CalendarEvent[]
  onEditEvent: (event: CalendarEvent) => void
  onDeleteEvent: (eventId: string) => void
  onEventSelect: (event: CalendarEvent) => void
}

export function EventSearch({ events, onEditEvent, onDeleteEvent, onEventSelect }: EventSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.date.includes(query),
    )
  }, [events, searchQuery])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setIsSearching(value.length > 0)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setIsSearching(false)
  }

  const handleEventClick = (event: CalendarEvent) => {
    onEventSelect(event)
    // 可以选择是否清除搜索
    // clearSearch()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">搜索事件</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索事件标题、描述或日期..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isSearching && (
          <div className="space-y-2">
            {filteredEvents.length > 0 ? (
              <>
                <p className="text-sm text-gray-600">找到 {filteredEvents.length} 个事件</p>
                <div className="max-h-60 overflow-y-auto">
                  <EventList
                    events={filteredEvents}
                    onEditEvent={onEditEvent}
                    onDeleteEvent={onDeleteEvent}
                    onEventClick={handleEventClick}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">未找到匹配的事件</p>
            )}
          </div>
        )}

        {!isSearching && <div className="text-sm text-gray-500 text-center py-2">输入关键词搜索事件</div>}
      </CardContent>
    </Card>
  )
}
