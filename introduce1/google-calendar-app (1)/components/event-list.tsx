"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Clock, Calendar } from "lucide-react"
import type { CalendarEvent } from "@/lib/event-types"

interface EventListProps {
  events: CalendarEvent[]
  onEditEvent: (event: CalendarEvent) => void
  onDeleteEvent: (eventId: string) => void
  onEventClick?: (event: CalendarEvent) => void
}

const colorClasses = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
}

export function EventList({ events, onEditEvent, onDeleteEvent, onEventClick }: EventListProps) {
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null)

  const handleDeleteConfirm = () => {
    if (deleteEventId) {
      onDeleteEvent(deleteEventId)
      setDeleteEventId(null)
    }
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    // 防止点击编辑/删除按钮时触发事件选择
    if ((e.target as HTMLElement).closest("button")) {
      return
    }
    onEventClick?.(event)
  }

  if (events.length === 0) {
    return <div className="text-sm text-gray-500 text-center py-4">暂无事件安排</div>
  }

  const sortedEvents = [...events].sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <>
      <div className="space-y-2">
        {sortedEvents.map((event) => (
          <Card
            key={event.id}
            className={`p-0 transition-colors ${onEventClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
            onClick={(e) => handleEventClick(event, e)}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-3 h-3 rounded-full mt-1 ${
                    colorClasses[event.color as keyof typeof colorClasses] || colorClasses.blue
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{event.title}</h4>
                  {event.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{event.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {event.startTime} - {event.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(event.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEditEvent(event)} className="h-8 w-8 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteEventId(event.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>您确定要删除这个事件吗？此操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
