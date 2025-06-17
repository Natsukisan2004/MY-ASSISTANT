"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { MicIcon, AlertTriangle, CheckCircle } from "lucide-react"

interface SpeechPermissionCheckProps {
  onPermissionGranted?: () => void
  onPermissionDenied?: () => void
}

export function SpeechPermissionCheck({ onPermissionGranted, onPermissionDenied }: SpeechPermissionCheckProps) {
  const [permissionStatus, setPermissionStatus] = useState<"unknown" | "granted" | "denied" | "checking">("unknown")
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    checkSpeechSupport()
  }, [])

  const checkSpeechSupport = () => {
    if (typeof window === "undefined") return

    const hasRecognition = !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition)
    const hasSynthesis = !!window.speechSynthesis

    setIsSupported(hasRecognition && hasSynthesis)

    if (hasRecognition && hasSynthesis) {
      checkMicrophonePermission()
    }
  }

  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: "microphone" as PermissionName })
        setPermissionStatus(permission.state as any)

        permission.onchange = () => {
          setPermissionStatus(permission.state as any)
          if (permission.state === "granted") {
            onPermissionGranted?.()
          } else if (permission.state === "denied") {
            onPermissionDenied?.()
          }
        }
      }
    } catch (error) {
      console.warn("Permission API not supported")
      setPermissionStatus("unknown")
    }
  }

  const requestMicrophonePermission = async () => {
    setPermissionStatus("checking")

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      setPermissionStatus("granted")
      onPermissionGranted?.()
    } catch (error) {
      setPermissionStatus("denied")
      onPermissionDenied?.()
    }
  }

  if (!isSupported) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>您的浏览器不支持语音识别功能。请使用Chrome、Edge或Safari等现代浏览器。</AlertDescription>
      </Alert>
    )
  }

  if (permissionStatus === "denied") {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>麦克风权限被拒绝。请在浏览器设置中允许麦克风访问，然后刷新页面。</AlertDescription>
      </Alert>
    )
  }

  if (permissionStatus === "unknown" || permissionStatus === "checking") {
    return (
      <Alert>
        <MicIcon className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>需要麦克风权限才能使用语音功能</span>
          <Button size="sm" onClick={requestMicrophonePermission} disabled={permissionStatus === "checking"}>
            {permissionStatus === "checking" ? "检查中..." : "授权"}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (permissionStatus === "granted") {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          语音功能已就绪！您可以使用语音输入和语音播放功能。
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
