"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Camera, X, Bot, User, FileText, AlertCircle, Sparkles, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useEvents } from "@/contexts/event-context"
import type { EventFormData } from "@/lib/event-types"
import type { ProcessedSpeechResult } from "@/lib/speech-post-processing"
import { createAIService, type ExtractedEvent } from "@/lib/ai-service"
import { VoiceControl } from "./voice-control"
import { TextToSpeech } from "./text-to-speech"
import { EventConfirmationDialog } from "./event-confirmation-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type: "text" | "image" | "voice" | "event" | "ai_processing"
  data?: any
  processedResult?: ProcessedSpeechResult
  extractedEvents?: ExtractedEvent[]
}

interface ChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EnhancedChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const { t } = useLanguage()
  const { addEvent } = useEvents()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI calendar assistant. I can help you create and manage calendar events through text, voice, or images. What would you like to schedule?",
      sender: "ai",
      timestamp: new Date(),
      type: "text",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [showEventConfirmation, setShowEventConfirmation] = useState(false)
  const [pendingEvents, setPendingEvents] = useState<ExtractedEvent[]>([])
  const [pendingExplanation, setPendingExplanation] = useState("")
  const [pendingConfidence, setPendingConfidence] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const aiService = createAIService()

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Clear voice error
  useEffect(() => {
    if (voiceError) {
      const timer = setTimeout(() => setVoiceError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [voiceError])

  const handleSendMessage = async (
    content: string,
    type: "text" | "image" | "voice" = "text",
    data?: any,
    processedResult?: ProcessedSpeechResult,
  ) => {
    if (!content.trim() && !data) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim() || (type === "image" ? "Uploaded an image" : "Sent voice message"),
      sender: "user",
      timestamp: new Date(),
      type,
      data,
      processedResult,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Add AI processing message
    const processingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "Analyzing your input and extracting event information...",
      sender: "ai",
      timestamp: new Date(),
      type: "ai_processing",
    }
    setMessages((prev) => [...prev, processingMessage])

    try {
      if (aiService) {
        // Use real AI service
        console.log("Processing with AI service:", { content, type, processedResult })
        const result = await aiService.processUserInput(content, type, { processedResult, ...data })
        console.log("AI service result:", result)

        // Remove processing message
        setMessages((prev) => prev.filter((msg) => msg.id !== processingMessage.id))

        if (result.success && result.events.length > 0) {
          // Show confirmation dialog
          console.log("Setting pending events:", result.events)
          setPendingEvents(result.events)
          setPendingExplanation(result.explanation)
          setPendingConfidence(result.confidence)
          setShowEventConfirmation(true)

          // Add AI response message
          const aiResponse: Message = {
            id: (Date.now() + 2).toString(),
            content: `${result.explanation}\n\nI found ${result.events.length} event${result.events.length !== 1 ? "s" : ""}. Please confirm to add to your calendar.`,
            sender: "ai",
            timestamp: new Date(),
            type: "text",
            extractedEvents: result.events,
          }
          setMessages((prev) => [...prev, aiResponse])
        } else {
          // No event information found
          const aiResponse: Message = {
            id: (Date.now() + 2).toString(),
            content:
              result.explanation ||
              "Sorry, I couldn't extract valid event information from your input. Please try providing more specific time and event details.",
            sender: "ai",
            timestamp: new Date(),
            type: "text",
          }
          setMessages((prev) => [...prev, aiResponse])
        }
      } else {
        // Fallback to mock service
        setTimeout(async () => {
          setMessages((prev) => prev.filter((msg) => msg.id !== processingMessage.id))
          const aiResponse = await processMockAIInput(content, type, data, processedResult)
          setMessages((prev) => [...prev, aiResponse])
        }, 2000)
      }
    } catch (error) {
      console.error("AI processing error:", error)
      setMessages((prev) => prev.filter((msg) => msg.id !== processingMessage.id))

      const errorResponse: Message = {
        id: (Date.now() + 2).toString(),
        content: "Sorry, there was an error processing your request. Please try again.",
        sender: "ai",
        timestamp: new Date(),
        type: "text",
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const processMockAIInput = async (
    content: string,
    type: string,
    data?: any,
    processedResult?: ProcessedSpeechResult,
  ): Promise<Message> => {
    // Mock AI processing logic (keep original logic as backup)
    if (processedResult?.eventInfo) {
      const eventData: EventFormData = {
        title: processedResult.eventInfo.title,
        description: processedResult.eventInfo.description,
        date: processedResult.eventInfo.date,
        startTime: processedResult.eventInfo.startTime,
        endTime: processedResult.eventInfo.endTime,
        color: type === "voice" ? "green" : "blue",
      }

      try {
        addEvent(eventData)
        return {
          id: (Date.now() + 1).toString(),
          content: `I've created an event for you:\n\n📅 ${eventData.title}\n🕐 ${eventData.date} ${eventData.startTime} - ${eventData.endTime}\n📝 ${eventData.description}\n\nEvent has been added to your calendar!`,
          sender: "ai",
          timestamp: new Date(),
          type: "event",
          data: eventData,
        }
      } catch (error) {
        return {
          id: (Date.now() + 1).toString(),
          content: "Sorry, there was an issue creating the event. Please check if the information is complete.",
          sender: "ai",
          timestamp: new Date(),
          type: "text",
        }
      }
    }

    return {
      id: (Date.now() + 1).toString(),
      content:
        "I understand your request. Please provide more specific time and event information, and I'll help you create a calendar event.",
      sender: "ai",
      timestamp: new Date(),
      type: "text",
    }
  }

  const handleConfirmEvents = (events: EventFormData[]) => {
    console.log("Confirming events in chat dialog:", events)
    try {
      events.forEach((eventData) => {
        addEvent(eventData)
      })

      const confirmationMessage: Message = {
        id: Date.now().toString(),
        content: `✅ Successfully added ${events.length} event${events.length !== 1 ? "s" : ""} to your calendar!\n\n${events
          .map((e, i) => `${i + 1}. ${e.title} - ${e.date} ${e.startTime}`)
          .join("\n")}`,
        sender: "ai",
        timestamp: new Date(),
        type: "event",
        data: events,
      }

      setMessages((prev) => [...prev, confirmationMessage])
      setShowEventConfirmation(false)
      setPendingEvents([])
    } catch (error) {
      console.error("Error adding events:", error)
    }
  }

  const handleRejectEvents = () => {
    const rejectionMessage: Message = {
      id: Date.now().toString(),
      content:
        "Okay, I've cancelled adding those events. If you need to modify them, please describe your schedule again.",
      sender: "ai",
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, rejectionMessage])
    setShowEventConfirmation(false)
    setPendingEvents([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputValue)
    }
  }

  const handleVoiceTranscript = (transcript: string, confidence: number, processedResult?: ProcessedSpeechResult) => {
    handleSendMessage(transcript, "voice", { confidence }, processedResult)
  }

  const handleVoiceError = (error: string) => {
    setVoiceError(error)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const imageData = event.target?.result as string
        await handleSendMessage("", "image", { file, imageData })
      }
      reader.readAsDataURL(file)
    }
  }

  const language = useLanguage().language

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                AI Assistant
                <Sparkles className="h-4 w-4 text-yellow-500" title="AI Smart Assistant" />
                {aiService && <span className="text-xs text-green-600">● API Connected</span>}
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Voice Error Alert */}
          {voiceError && (
            <div className="px-6 pt-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{voiceError}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Messages Area */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.type === "ai_processing" && (
                      <div className="flex items-center gap-2 mb-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">AI Processing</span>
                      </div>
                    )}

                    {message.type === "image" && message.data?.imageData && (
                      <img
                        src={message.data.imageData || "/placeholder.svg"}
                        alt="Uploaded"
                        className="max-w-full h-32 object-cover rounded mb-2"
                      />
                    )}

                    {message.type === "voice" && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <VoiceControl className="h-4 w-4" disabled />
                          <span className="text-sm">Voice Message</span>
                          {message.processedResult?.corrections && message.processedResult.corrections.length > 0 && (
                            <Sparkles className="h-3 w-3 text-yellow-400" title="Smart Corrected" />
                          )}
                        </div>
                        {message.data?.confidence && (
                          <span className="text-xs opacity-70">({Math.round(message.data.confidence * 100)}%)</span>
                        )}
                      </div>
                    )}

                    {message.type === "event" && (
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">Created New Event</span>
                      </div>
                    )}

                    <p className="text-sm whitespace-pre-line">{message.content}</p>

                    {/* Show extracted event information */}
                    {message.extractedEvents && message.extractedEvents.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                        <div className="font-medium text-blue-700 mb-1">Extracted Events:</div>
                        {message.extractedEvents.map((event, index) => (
                          <div key={index} className="text-blue-600">
                            • {event.title} - {event.date} {event.startTime}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Show voice correction information */}
                    {message.processedResult && message.processedResult.corrections.length > 0 && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                        <div className="flex items-center gap-1 text-yellow-700 mb-1">
                          <Sparkles className="h-3 w-3" />
                          <span>Smart Corrected ({message.processedResult.corrections.length} changes)</span>
                        </div>
                        <div className="text-yellow-600">Original: "{message.processedResult.originalText}"</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-xs ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {message.sender === "ai" && message.content && message.type !== "ai_processing" && (
                        <TextToSpeech
                          text={message.content}
                          className="ml-2"
                          onError={(error) => setVoiceError(error)}
                        />
                      )}
                    </div>
                  </div>
                  {message.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="px-6 py-4 border-t">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type message, upload image, or use voice..."
                  disabled={isLoading}
                  className="pr-20"
                />
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 w-8 p-0"
                    disabled={isLoading}
                    title="Upload Photo"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <VoiceControl onTranscript={handleVoiceTranscript} onError={handleVoiceError} disabled={isLoading} />
                </div>
              </div>
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Confirmation Dialog */}
      <EventConfirmationDialog
        open={showEventConfirmation}
        onOpenChange={setShowEventConfirmation}
        events={pendingEvents}
        explanation={pendingExplanation}
        confidence={pendingConfidence}
        onConfirm={handleConfirmEvents}
        onReject={handleRejectEvents}
      />
    </>
  )
}
