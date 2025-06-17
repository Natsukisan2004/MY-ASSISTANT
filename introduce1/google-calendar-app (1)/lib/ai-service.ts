export interface AIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface EventExtractionResult {
  success: boolean
  events: ExtractedEvent[]
  explanation: string
  confidence: number
  needsConfirmation: boolean
}

export interface ExtractedEvent {
  title: string
  description: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  color: string
  confidence: number
}

export class AIService {
  private apiUrl: string
  private apiKey: string
  private systemPrompt: string

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl
    this.apiKey = apiKey
    this.systemPrompt = this.getSystemPrompt()
  }

  private getSystemPrompt(): string {
    const currentDate = new Date().toISOString().split("T")[0]
    const currentTime = new Date().toLocaleTimeString("ja-JP", { hour12: false })

    return `あなたはカレンダーイベント管理の専門AIアシスタントです。ユーザーの自然言語入力からスケジュール情報を抽出し、構造化されたイベントデータに変換することが主な任務です。

## 現在の時刻情報
- 現在の日付: ${currentDate}
- 現在の時刻: ${currentTime}
- タイムゾーン: Asia/Tokyo

## 主要機能
1. テキスト、音声、画像入力からイベント情報を抽出
2. 不足している時間や説明情報を賢く補完
3. 相対的な時間表現を具体的な日時に変換
4. イベントに適切な色分類を割り当て

## 処理ルール

### 時間処理
- 相対時間変換: 明日 = ${new Date(Date.now() + 86400000).toISOString().split("T")[0]}
- デフォルト時間: 時間が指定されていない場合は09:00-10:00を使用
- 時間形式: HH:MM 24時間形式を使用
- 日付形式: YYYY-MM-DD形式を使用

### イベント分類と色
- 会議/仕事関連 → blue
- 個人的な約束/社交 → green  
- 食事/会食 → orange
- 医療/健康 → red
- 学習/研修 → purple
- その他の活動 → pink

### 応答形式
以下のJSON形式で厳密に応答してください。他のテキストは追加しないでください：

{
  "success": true,
  "events": [
    {
      "title": "イベントタイトル",
      "description": "詳細説明",
      "date": "2025-06-11",
      "startTime": "14:00",
      "endTime": "15:00",
      "color": "blue",
      "confidence": 0.9
    }
  ],
  "explanation": "入力から会議イベントを識別しました",
  "confidence": 0.85,
  "needsConfirmation": true
}

### 重要な注意事項
- イベント情報を抽出できない場合は success: false に設定
- 信頼度の範囲: 0.0 から 1.0
- 複数のイベントがある場合は、eventsの配列にすべてのイベントをリスト
- 説明文は簡潔で明確に、日本語で応答
- 不確実な情報については信頼度を下げる

### 日本語入力の例
入力: "明日の午後3時に会議"
出力:
{
  "success": true,
  "events": [{
    "title": "会議",
    "description": "明日午後の会議",
    "date": "${new Date(Date.now() + 86400000).toISOString().split("T")[0]}",
    "startTime": "15:00",
    "endTime": "16:00",
    "color": "blue",
    "confidence": 0.9
  }],
  "explanation": "明日の午後3時の会議を識別しました",
  "confidence": 0.9,
  "needsConfirmation": true
}

ユーザーの入力を処理してください：`
  }

  async processUserInput(
    input: string,
    inputType: "text" | "voice" | "image" = "text",
    additionalContext?: any,
  ): Promise<EventExtractionResult> {
    try {
      const messages: AIMessage[] = [
        {
          role: "system",
          content: this.systemPrompt,
        },
        {
          role: "user",
          content: this.formatUserInput(input, inputType, additionalContext),
        },
      ]

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages,
          temperature: 0.3,
          max_tokens: 1000,
          response_format: { type: "json_object" },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API request failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const aiResponse = data.choices?.[0]?.message?.content

      if (!aiResponse) {
        throw new Error("No response content from AI")
      }

      return this.parseAIResponse(aiResponse)
    } catch (error) {
      console.error("AI Service Error:", error)
      return this.createErrorResponse(error as Error)
    }
  }

  private formatUserInput(input: string, inputType: string, additionalContext?: any): string {
    let formattedInput = `入力タイプ: ${inputType}\nユーザー入力: ${input}`

    if (inputType === "voice" && additionalContext?.processedResult) {
      const processed = additionalContext.processedResult
      formattedInput += `\n\n音声認識詳細:
- 元の認識結果: "${processed.originalText}"
- 修正後: "${processed.correctedText}"
- 修正項目数: ${processed.corrections.length}
- 認識信頼度: ${Math.round(processed.confidence * 100)}%`

      if (processed.corrections.length > 0) {
        formattedInput += `\n- 主な修正: ${processed.corrections
          .slice(0, 3)
          .map((c) => `"${c.original}" → "${c.corrected}"`)
          .join(", ")}`
      }
    }

    return formattedInput
  }

  private parseAIResponse(response: string): EventExtractionResult {
    try {
      let parsed: any
      try {
        parsed = JSON.parse(response)
      } catch (jsonError) {
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0])
        } else {
          throw new Error("No valid JSON found in response")
        }
      }

      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Invalid response format")
      }

      if (!parsed.success) {
        return {
          success: false,
          events: [],
          explanation: parsed.explanation || "入力からイベント情報を抽出できませんでした",
          confidence: 0,
          needsConfirmation: false,
        }
      }

      const events = Array.isArray(parsed.events) ? parsed.events : []
      const normalizedEvents = events
        .map((event: any, index: number) => {
          try {
            return {
              title: String(event.title || `イベント ${index + 1}`),
              description: String(event.description || ""),
              date: this.validateDate(event.date),
              startTime: this.validateTime(event.startTime),
              endTime: this.validateTime(event.endTime, event.startTime),
              color: this.validateColor(event.color),
              confidence: this.validateConfidence(event.confidence),
            }
          } catch (eventError) {
            console.warn(`Error processing event ${index}:`, eventError)
            return null
          }
        })
        .filter(Boolean)

      return {
        success: normalizedEvents.length > 0,
        events: normalizedEvents,
        explanation: String(parsed.explanation || "イベント情報を抽出しました"),
        confidence: this.validateConfidence(parsed.confidence),
        needsConfirmation: parsed.needsConfirmation !== false,
      }
    } catch (error) {
      console.error("Failed to parse AI response:", error)
      return this.createErrorResponse(new Error(`AI応答の解析に失敗しました: ${error.message}`))
    }
  }

  private validateDate(date: any): string {
    if (!date) {
      return new Date().toISOString().split("T")[0]
    }

    const dateStr = String(date)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/

    if (dateRegex.test(dateStr)) {
      const parsedDate = new Date(dateStr)
      if (!isNaN(parsedDate.getTime())) {
        return dateStr
      }
    }

    const parsedDate = new Date(dateStr)
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split("T")[0]
    }

    return new Date().toISOString().split("T")[0]
  }

  private validateTime(time: any, startTime?: any): string {
    if (!time) {
      if (startTime) {
        const [hour, minute] = String(startTime).split(":").map(Number)
        const endHour = hour + 1
        return `${endHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      }
      return "09:00"
    }

    const timeStr = String(time)
    const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/

    if (timeRegex.test(timeStr)) {
      return timeStr
    }

    const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})?/)
    if (timeMatch) {
      const hour = Number.parseInt(timeMatch[1])
      const minute = Number.parseInt(timeMatch[2] || "0")

      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      }
    }

    return startTime ? this.validateTime(null, startTime) : "09:00"
  }

  private validateColor(color: any): string {
    const validColors = ["blue", "green", "red", "purple", "orange", "pink"]
    const colorStr = String(color || "").toLowerCase()
    return validColors.includes(colorStr) ? colorStr : "blue"
  }

  private validateConfidence(confidence: any): number {
    const conf = Number.parseFloat(confidence)
    if (isNaN(conf)) return 0.5
    return Math.max(0, Math.min(1, conf))
  }

  private createErrorResponse(error: Error): EventExtractionResult {
    return {
      success: false,
      events: [],
      explanation: `リクエスト処理中にエラーが発生しました: ${error.message}`,
      confidence: 0,
      needsConfirmation: false,
    }
  }
}

export const createAIService = () => {
  const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || "https://api.openai.com/v1/chat/completions"
  const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY || ""

  if (!apiKey) {
    console.warn("AI API key not found. Please set NEXT_PUBLIC_AI_API_KEY environment variable.")
    return null
  }

  return new AIService(apiUrl, apiKey)
}
