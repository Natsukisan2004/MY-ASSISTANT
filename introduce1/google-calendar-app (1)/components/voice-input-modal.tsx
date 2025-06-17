"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MicIcon, Check, X } from "lucide-react"
import { AudioVisualizer } from "./audio-visualizer"
import type { ProcessedSpeechResult } from "@/lib/speech-post-processing"
import { cn } from "@/lib/utils"

interface VoiceInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isListening: boolean
  currentTranscript: string
  confidence: number
  processedResult: ProcessedSpeechResult | null
  onStartListening: () => void
  onStopListening: () => void
  onConfirm: (result: ProcessedSpeechResult) => void
  onCancel: () => void
  error: string | null
}

export function VoiceInputModal({
  open,
  onOpenChange,
  isListening,
  currentTranscript,
  confidence,
  processedResult,
  onStartListening,
  onStopListening,
  onConfirm,
  onCancel,
  error,
}: VoiceInputModalProps) {
  const handleClose = () => {
    onStopListening()
    onCancel()
    onOpenChange(false)
  }

  const handleConfirm = () => {
    if (processedResult) {
      onConfirm(processedResult)
      onOpenChange(false)
    }
  }

  const getStatusText = () => {
    if (error) return "録音エラー"
    if (processedResult) return "認識完了"
    if (isListening) return "録音中..."
    return "録音準備完了"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg">音声入力</DialogTitle>
          <p className="text-sm text-gray-600 mt-2">スケジュールを話してください。AIが自動的にイベントを作成します</p>
        </DialogHeader>

        {/* 状态指示 */}
        <div className="flex justify-center mt-4">
          <Badge variant={error ? "destructive" : processedResult ? "default" : "outline"}>{getStatusText()}</Badge>
        </div>

        {/* 麦克风按钮 */}
        <div className="flex flex-col items-center mt-6 space-y-4">
          <div className="relative">
            <Button
              onClick={isListening ? onStopListening : onStartListening}
              disabled={!!error}
              size="lg"
              className={cn(
                "h-20 w-20 rounded-full transition-all duration-300 shadow-lg",
                isListening
                  ? "bg-red-600 hover:bg-red-700 scale-110 animate-pulse"
                  : "bg-blue-600 hover:bg-blue-700 hover:scale-105",
              )}
            >
              <MicIcon className="h-8 w-8" />
            </Button>

            {/* 脉冲动画 */}
            {isListening && (
              <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-30" />
            )}
          </div>

          {/* 音频可视化器 */}
          {isListening && (
            <div className="w-48 h-12 bg-gray-100 rounded-lg p-2">
              <AudioVisualizer isActive={isListening} type="bars" color="rgb(239, 68, 68)" />
            </div>
          )}
        </div>

        {/* 实时转录 */}
        {currentTranscript && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">実時転写</span>
              {confidence > 0 && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(confidence * 100)}%
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-700">{currentTranscript}</p>
          </div>
        )}

        {/* 错误显示 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <X className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* 处理结果 */}
        {processedResult && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm">
              <div className="font-medium text-green-700 mb-1">認識結果:</div>
              <div className="text-green-600">{processedResult.correctedText}</div>
              {processedResult.corrections.length > 0 && (
                <div className="text-xs text-green-500 mt-1">{processedResult.corrections.length}箇所を自動修正</div>
              )}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3 mt-6">
          {processedResult ? (
            <>
              <Button onClick={handleConfirm} className="flex-1 bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
                確認使用
              </Button>
              <Button onClick={handleClose} variant="outline" className="flex-1">
                取消
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} variant="outline" className="w-full">
              閉じる
            </Button>
          )}
        </div>

        {/* 提示文本 */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            {isListening
              ? "録音中です。スケジュールを明確に話してください..."
              : processedResult
                ? "認識結果を確認してください"
                : "マイクボタンを押して録音を開始"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
