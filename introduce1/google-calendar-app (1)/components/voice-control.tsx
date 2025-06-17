"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MicIcon, MicOff } from "lucide-react"
import { speechService, type SpeechRecognitionResult } from "@/lib/speech-service"
import { speechPostProcessor, type ProcessedSpeechResult } from "@/lib/speech-post-processing"
import { cn } from "@/lib/utils"
import { VoiceInputModal } from "./voice-input-modal"

interface VoiceControlProps {
  onTranscript?: (transcript: string, confidence: number, processedResult?: ProcessedSpeechResult) => void
  onError?: (error: string) => void
  disabled?: boolean
  className?: string
}

export function VoiceControl({ onTranscript, onError, disabled, className }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [processedResult, setProcessedResult] = useState<ProcessedSpeechResult | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsSupported(speechService.constructor.isSupported())
  }, [])

  // 默认使用日文
  const getLanguageCode = (): string => {
    return "ja-JP"
  }

  const handleOpenModal = () => {
    if (!isSupported || disabled) return
    setShowModal(true)
    setError(null)
    setProcessedResult(null)
    setCurrentTranscript("")
    setConfidence(0)
  }

  const handleStartListening = async () => {
    if (!isSupported || disabled) return

    try {
      setIsListening(true)
      setCurrentTranscript("")
      setConfidence(0)
      setProcessedResult(null)
      setError(null)

      await speechService.startListening(
        getLanguageCode(),
        (result: SpeechRecognitionResult) => {
          setCurrentTranscript(result.transcript)
          setConfidence(result.confidence)

          if (result.isFinal) {
            // 进行后处理
            const processed = speechPostProcessor.processSpeechResult(result.transcript, result.confidence)
            setProcessedResult(processed)
            setIsListening(false)
          }
        },
        (error: string) => {
          setIsListening(false)
          setError(error)
          onError?.(error)
        },
        () => {
          setIsListening(false)
        },
      )
    } catch (error) {
      setIsListening(false)
      setError(error as string)
      onError?.(error as string)
    }
  }

  const handleStopListening = () => {
    speechService.stopListening()
    setIsListening(false)
  }

  const handleConfirm = (result: ProcessedSpeechResult) => {
    onTranscript?.(result.correctedText, result.confidence, result)
    setShowModal(false)
    setProcessedResult(null)
    setCurrentTranscript("")
    setConfidence(0)
  }

  const handleCancel = () => {
    handleStopListening()
    setProcessedResult(null)
    setCurrentTranscript("")
    setConfidence(0)
    setError(null)
  }

  if (!isSupported) {
    return (
      <Button variant="ghost" size="sm" disabled className={cn("h-8 w-8 p-0", className)}>
        <MicOff className="h-4 w-4 text-gray-400" />
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpenModal}
        disabled={disabled}
        className={cn("h-8 w-8 p-0 transition-colors hover:bg-blue-50", className)}
        title="音声入力"
      >
        <MicIcon className="h-4 w-4 text-blue-600" />
      </Button>

      <VoiceInputModal
        open={showModal}
        onOpenChange={setShowModal}
        isListening={isListening}
        currentTranscript={currentTranscript}
        confidence={confidence}
        processedResult={processedResult}
        onStartListening={handleStartListening}
        onStopListening={handleStopListening}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        error={error}
      />
    </>
  )
}
