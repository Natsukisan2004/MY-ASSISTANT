"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertTriangle, Edit, Calendar, Clock } from "lucide-react"
import type { ExtractedEvent } from "@/lib/ai-service"
import type { EventFormData } from "@/lib/event-types"

interface EventConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  events: ExtractedEvent[]
  explanation: string
  confidence: number
  onConfirm: (events: EventFormData[]) => void
  onReject: () => void
}

const eventColors = [
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
]

export function EventConfirmationDialog({
  open,
  onOpenChange,
  events,
  explanation,
  confidence,
  onConfirm,
  onReject,
}: EventConfirmationDialogProps) {
  const [editingEvents, setEditingEvents] = useState<ExtractedEvent[]>([])
  const [isEditing, setIsEditing] = useState(false)

  // Update editing events when props change
  useEffect(() => {
    console.log("EventConfirmationDialog received events:", events)
    setEditingEvents([...events])
  }, [events])

  const handleEventChange = (index: number, field: keyof ExtractedEvent, value: string) => {
    const updated = [...editingEvents]
    updated[index] = { ...updated[index], [field]: value }
    setEditingEvents(updated)
  }

  const handleConfirm = () => {
    console.log("Confirming events:", editingEvents)
    const eventFormData: EventFormData[] = editingEvents.map((event) => ({
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      color: event.color,
    }))
    onConfirm(eventFormData)
  }

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return "text-green-600 bg-green-50"
    if (conf >= 0.6) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getConfidenceIcon = (conf: number) => {
    if (conf >= 0.8) return <CheckCircle className="h-4 w-4" />
    return <AlertTriangle className="h-4 w-4" />
  }

  // Don't render if no events
  if (!open || editingEvents.length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Confirm Event Creation
          </DialogTitle>
          <DialogDescription>
            AI has extracted the following event information from your input. Please confirm before adding to calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* AI Analysis and Confidence */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">AI Analysis Result</CardTitle>
                <Badge className={getConfidenceIcon(confidence) ? "gap-1" : ""}>
                  {getConfidenceIcon(confidence)}
                  {Math.round(confidence * 100)}% Confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{explanation}</p>
            </CardContent>
          </Card>

          {/* Event List */}
          <div className="space-y-3">
            {editingEvents.map((event, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      Event {index + 1}
                      <Badge variant="outline" className={getConfidenceColor(event.confidence)}>
                        {Math.round(event.confidence * 100)}%
                      </Badge>
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isEditing ? (
                    // Edit Mode
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor={`title-${index}`}>Title</Label>
                        <Input
                          id={`title-${index}`}
                          value={event.title}
                          onChange={(e) => handleEventChange(index, "title", e.target.value)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`description-${index}`}>Description</Label>
                        <Textarea
                          id={`description-${index}`}
                          value={event.description}
                          onChange={(e) => handleEventChange(index, "description", e.target.value)}
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="grid gap-2">
                          <Label htmlFor={`date-${index}`}>Date</Label>
                          <Input
                            id={`date-${index}`}
                            type="date"
                            value={event.date}
                            onChange={(e) => handleEventChange(index, "date", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`startTime-${index}`}>Start</Label>
                          <Input
                            id={`startTime-${index}`}
                            type="time"
                            value={event.startTime}
                            onChange={(e) => handleEventChange(index, "startTime", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`endTime-${index}`}>End</Label>
                          <Input
                            id={`endTime-${index}`}
                            type="time"
                            value={event.endTime}
                            onChange={(e) => handleEventChange(index, "endTime", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`color-${index}`}>Color</Label>
                        <Select value={event.color} onValueChange={(value) => handleEventChange(index, "color", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {eventColors.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full ${color.class}`} />
                                  {color.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    // Preview Mode
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{event.title}</h4>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            eventColors.find((c) => c.value === event.color)?.class || "bg-blue-500"
                          }`}
                        />
                      </div>
                      {event.description && <p className="text-sm text-gray-600">{event.description}</p>}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString("en-US")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.startTime} - {event.endTime}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onReject}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
            Confirm Add ({editingEvents.length} event{editingEvents.length !== 1 ? "s" : ""})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
