"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/lib/event-types"
import { useLanguage } from "@/contexts/language-context"

interface CalendarComponentProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  events: CalendarEvent[]
  onDateDoubleClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
}

const colorClasses = {
  blue: "bg-blue-500 text-white",
  green: "bg-green-500 text-white",
  red: "bg-red-500 text-white",
  purple: "bg-purple-500 text-white",
  orange: "bg-orange-500 text-white",
  pink: "bg-pink-500 text-white",
}

export function CalendarComponent({
  selectedDate,
  onDateSelect,
  events,
  onDateDoubleClick,
  onEventClick,
}: CalendarComponentProps) {
  const { t } = useLanguage()
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const today = new Date()

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const isToday = (date: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date)
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return checkDate.getTime() === todayDate.getTime()
  }

  const isSelected = (date: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date)
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    return checkDate.getTime() === selectedDateOnly.getTime()
  }

  const handleDateClick = (date: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date)
    onDateSelect(newDate)
  }

  const handleDateDoubleClick = (date: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date)
    onDateDoubleClick?.(newDate)
  }

  const getEventsForDate = (date: number) => {
    const dateString = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date).toISOString().split("T")[0]
    return events.filter((event) => event.date === dateString).slice(0, 3)
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventClick?.(event)
  }

  const weekDays = [t("day.sun"), t("day.mon"), t("day.tue"), t("day.wed"), t("day.thu"), t("day.fri"), t("day.sat")]
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={previousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {currentMonth.toLocaleDateString({ zh: "zh-CN", ja: "ja-JP", en: "en-US" }[useLanguage().language], {
            year: "numeric",
            month: "long",
          })}
        </h2>
        <Button variant="outline" size="sm" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week Day Headers */}
        {weekDays.map((day) => (
          <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500 border-b">
            {day}
          </div>
        ))}

        {/* Empty Days */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="min-h-[120px] border border-gray-100" />
        ))}

        {/* Month Days */}
        {monthDays.map((date) => {
          const dayEvents = getEventsForDate(date)
          const hasMoreEvents =
            events.filter((event) => {
              const dateString = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date)
                .toISOString()
                .split("T")[0]
              return event.date === dateString
            }).length > 3

          return (
            <div
              key={date}
              className={cn(
                "min-h-[120px] border border-gray-100 p-1 cursor-pointer hover:bg-gray-50 transition-colors",
                // 只有选中时才显示边框，其他时候保持默认
                isSelected(date) && !isToday(date) && "ring-2 ring-blue-300 bg-blue-50/20",
              )}
              onClick={() => handleDateClick(date)}
              onDoubleClick={() => handleDateDoubleClick(date)}
            >
              {/* Date Number */}
              <div className="flex justify-between items-start mb-1">
                <span
                  className={cn(
                    "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                    // 今天的样式
                    isToday(date) && "bg-blue-600 text-white",
                    // 选中但不是今天的样式
                    isSelected(date) && !isToday(date) && "bg-blue-500 text-white",
                    // 普通日期
                    !isToday(date) && !isSelected(date) && "hover:bg-gray-100",
                  )}
                >
                  {date}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-xs px-1 py-0.5 rounded text-white cursor-pointer hover:opacity-80 truncate",
                      colorClasses[event.color as keyof typeof colorClasses] || colorClasses.blue,
                    )}
                    onClick={(e) => handleEventClick(event, e)}
                    title={`${event.title} (${event.startTime} - ${event.endTime})`}
                  >
                    {event.startTime} {event.title}
                  </div>
                ))}
                {hasMoreEvents && (
                  <div className="text-xs text-gray-500 px-1">
                    +
                    {events.filter((event) => {
                      const dateString = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date)
                        .toISOString()
                        .split("T")[0]
                      return event.date === dateString
                    }).length - 3}{" "}
                    更多
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
