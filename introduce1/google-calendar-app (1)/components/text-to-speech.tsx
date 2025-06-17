"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, Loader2 } from "lucide-react"
import { speechService } from "@/lib/speech-service"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

interface TextToSpeechProps {
  text: string
  disabled?: boolean
  className?: string
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
}

export function TextToSpeech({ text, disabled, className, onStart, onEnd, onError }: TextToSpeechProps) {
  const { language } = useLanguage()
  const [isSpeaking, setIsSpeaking] = useState(false)

  const getLanguageCode = (lang: string): string => {
    const langMap = {
      zh: "zh-CN",
      ja: "ja-JP",
      en: "en-US",
    }
    return langMap[lang as keyof typeof langMap] || "zh-CN"
  }

  const handleSpeak = async () => {
    if (!text.trim() || disabled) return

    try {
      setIsSpeaking(true)
      onStart?.()

      await speechService.speak({
        text,
        lang: getLanguageCode(language),
        rate: 1,
        pitch: 1,
        volume: 0.8,
      })

      setIsSpeaking(false)
      onEnd?.()
    } catch (error) {
      setIsSpeaking(false)
      onError?.(error as string)
    }
  }

  const handleStop = () => {
    speechService.stopSpeaking()
    setIsSpeaking(false)
    onEnd?.()
  }

  if (!speechService.constructor.isSupported()) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={isSpeaking ? handleStop : handleSpeak}
      disabled={disabled || !text.trim()}
      className={cn("h-8 w-8 p-0", className)}
    >
      {isSpeaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
    </Button>
  )
}
