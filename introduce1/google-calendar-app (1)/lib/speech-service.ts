export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export interface SpeechSynthesisOptions {
  text: string
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
}

declare var SpeechRecognition: any // Declare SpeechRecognition variable

export class SpeechService {
  private recognition: any | null = null // Use any type for SpeechRecognition
  private synthesis: SpeechSynthesis | null = null
  private isListening = false

  constructor() {
    this.initializeSpeechRecognition()
    this.initializeSpeechSynthesis()
  }

  private initializeSpeechRecognition() {
    if (typeof window === "undefined") return

    // 检查浏览器支持
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser")
      return
    }

    this.recognition = new SpeechRecognition()
    this.recognition.continuous = false
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 1
  }

  private initializeSpeechSynthesis() {
    if (typeof window === "undefined") return

    if (!window.speechSynthesis) {
      console.warn("Speech Synthesis not supported in this browser")
      return
    }

    this.synthesis = window.speechSynthesis
  }

  // 语音识别
  async startListening(
    language = "zh-CN",
    onResult?: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void,
    onEnd?: () => void,
  ): Promise<void> {
    if (!this.recognition) {
      throw new Error("Speech Recognition not available")
    }

    if (this.isListening) {
      this.stopListening()
    }

    return new Promise((resolve, reject) => {
      if (!this.recognition) return reject("Speech Recognition not available")

      this.recognition.lang = language
      this.isListening = true

      this.recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1]
        const transcript = result[0].transcript
        const confidence = result[0].confidence
        const isFinal = result.isFinal

        onResult?.({
          transcript,
          confidence,
          isFinal,
        })

        if (isFinal) {
          this.isListening = false
          resolve()
        }
      }

      this.recognition.onerror = (event) => {
        this.isListening = false
        const errorMessage = this.getErrorMessage(event.error)
        onError?.(errorMessage)
        reject(errorMessage)
      }

      this.recognition.onend = () => {
        this.isListening = false
        onEnd?.()
      }

      try {
        this.recognition.start()
      } catch (error) {
        this.isListening = false
        reject("Failed to start speech recognition")
      }
    })
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  getIsListening(): boolean {
    return this.isListening
  }

  // 语音合成
  async speak(options: SpeechSynthesisOptions): Promise<void> {
    if (!this.synthesis) {
      throw new Error("Speech Synthesis not available")
    }

    // 停止当前播放
    this.synthesis.cancel()

    return new Promise((resolve, reject) => {
      if (!this.synthesis) return reject("Speech Synthesis not available")

      const utterance = new SpeechSynthesisUtterance(options.text)

      // 设置语音参数
      utterance.lang = options.lang || "zh-CN"
      utterance.rate = options.rate || 1
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 1

      // 尝试选择合适的语音
      const voices = this.synthesis.getVoices()
      const voice = voices.find((v) => v.lang.startsWith(utterance.lang.split("-")[0]))
      if (voice) {
        utterance.voice = voice
      }

      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(`Speech synthesis error: ${event.error}`)

      this.synthesis.speak(utterance)
    })
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
    }
  }

  // 获取可用语音列表
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return []
    return this.synthesis.getVoices()
  }

  // 检查浏览器支持
  static isSupported(): boolean {
    if (typeof window === "undefined") return false

    const hasRecognition = !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition)
    const hasSynthesis = !!window.speechSynthesis

    return hasRecognition && hasSynthesis
  }

  private getErrorMessage(error: string): string {
    switch (error) {
      case "no-speech":
        return "没有检测到语音输入"
      case "audio-capture":
        return "无法访问麦克风"
      case "not-allowed":
        return "麦克风权限被拒绝"
      case "network":
        return "网络错误"
      case "language-not-supported":
        return "不支持的语言"
      case "service-not-allowed":
        return "语音服务不可用"
      default:
        return `语音识别错误: ${error}`
    }
  }
}

// 全局实例
export const speechService = new SpeechService()
