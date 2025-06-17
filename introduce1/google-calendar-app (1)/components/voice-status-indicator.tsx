"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { MicIcon, Volume2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceStatusIndicatorProps {
  isListening?: boolean
  isSpeaking?: boolean
  hasCorrections?: boolean
  confidence?: number
  className?: string
}

export function VoiceStatusIndicator({
  isListening = false,
  isSpeaking = false,
  hasCorrections = false,
  confidence,
  className,
}: VoiceStatusIndicatorProps) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (isListening || isSpeaking) {
      const interval = setInterval(() => {
        setPulse((prev) => !prev)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setPulse(false)
    }
  }, [isListening, isSpeaking])

  if (!isListening && !isSpeaking && !hasCorrections) {
    return null
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isListening && (
        <Badge variant="destructive" className={cn("gap-1", pulse && "animate-pulse")}>
          <MicIcon className="h-3 w-3" />
          正在录音
        </Badge>
      )}

      {isSpeaking && (
        <Badge variant="secondary" className={cn("gap-1", pulse && "animate-pulse")}>
          <Volume2 className="h-3 w-3" />
          正在播放
        </Badge>
      )}

      {hasCorrections && (
        <Badge variant="outline" className="gap-1 border-yellow-300 text-yellow-700 bg-yellow-50">
          <Sparkles className="h-3 w-3" />
          已智能纠错
        </Badge>
      )}

      {confidence !== undefined && (
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            confidence >= 0.8
              ? "border-green-300 text-green-700 bg-green-50"
              : confidence >= 0.6
                ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                : "border-red-300 text-red-700 bg-red-50",
          )}
        >
          {Math.round(confidence * 100)}% 置信度
        </Badge>
      )}
    </div>
  )
}
