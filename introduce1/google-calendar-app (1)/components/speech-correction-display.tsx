"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, CheckCircle, AlertTriangle, Info } from "lucide-react"
import type { ProcessedSpeechResult, SpeechCorrection } from "@/lib/speech-post-processing"

interface SpeechCorrectionDisplayProps {
  result: ProcessedSpeechResult
  onAccept?: () => void
  onReject?: () => void
  className?: string
}

export function SpeechCorrectionDisplay({ result, onAccept, onReject, className }: SpeechCorrectionDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getCorrectionIcon = (type: SpeechCorrection["type"]) => {
    switch (type) {
      case "time":
        return "🕐"
      case "date":
        return "📅"
      case "number":
        return "🔢"
      case "event_type":
        return "📝"
      default:
        return "✏️"
    }
  }

  const getCorrectionColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800"
    if (confidence >= 0.7) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (confidence >= 0.6) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <Info className="h-4 w-4 text-red-600" />
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">语音识别结果</CardTitle>
          <div className="flex items-center gap-2">
            {getConfidenceIcon(result.confidence)}
            <Badge variant="outline" className={getCorrectionColor(result.confidence)}>
              {Math.round(result.confidence * 100)}% 置信度
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 原始文本 */}
        <div>
          <p className="text-xs text-gray-500 mb-1">原始识别：</p>
          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{result.originalText}</p>
        </div>

        {/* 纠正后文本 */}
        <div>
          <p className="text-xs text-gray-500 mb-1">纠正后：</p>
          <p className="text-sm font-medium bg-blue-50 p-2 rounded">{result.correctedText}</p>
        </div>

        {/* 纠正详情 */}
        {result.corrections.length > 0 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between p-0 h-auto">
                <span className="text-xs text-gray-600">{result.corrections.length} 个纠正项</span>
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {result.corrections.map((correction, index) => (
                <div key={index} className="flex items-center gap-2 text-xs p-2 bg-gray-50 rounded">
                  <span>{getCorrectionIcon(correction.type)}</span>
                  <span className="text-gray-600">"{correction.original}"</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium">"{correction.corrected}"</span>
                  <Badge variant="outline" className={`ml-auto ${getCorrectionColor(correction.confidence)}`}>
                    {Math.round(correction.confidence * 100)}%
                  </Badge>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* 提取的事件信息 */}
        {result.eventInfo && (
          <div className="border-t pt-3">
            <p className="text-xs text-gray-500 mb-2">提取的事件信息：</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">标题：</span>
                <span className="font-medium">{result.eventInfo.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">日期：</span>
                <span className="font-medium">{result.eventInfo.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">时间：</span>
                <span className="font-medium">
                  {result.eventInfo.startTime} - {result.eventInfo.endTime}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        {(onAccept || onReject) && (
          <div className="flex gap-2 pt-2">
            {onAccept && (
              <Button size="sm" onClick={onAccept} className="flex-1">
                接受
              </Button>
            )}
            {onReject && (
              <Button size="sm" variant="outline" onClick={onReject} className="flex-1">
                重新录音
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
