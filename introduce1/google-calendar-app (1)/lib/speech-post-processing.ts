export interface ProcessedSpeechResult {
  originalText: string
  correctedText: string
  confidence: number
  corrections: SpeechCorrection[]
  eventInfo?: ExtractedEventInfo
}

export interface SpeechCorrection {
  original: string
  corrected: string
  type: "time" | "date" | "number" | "common_word" | "event_type"
  confidence: number
}

export interface ExtractedEventInfo {
  title: string
  date: string
  startTime: string
  endTime: string
  description: string
  confidence: number
}

export class SpeechPostProcessor {
  // 常见语音识别错误映射
  private commonCorrections = {
    // 时间相关
    一点: "1点",
    二点: "2点",
    三点: "3点",
    四点: "4点",
    五点: "5点",
    六点: "6点",
    七点: "7点",
    八点: "8点",
    九点: "9点",
    十点: "10点",
    十一点: "11点",
    十二点: "12点",
    半点: "30分",
    一刻: "15分",
    三刻: "45分",

    // 日期相关
    今天: "今天",
    明天: "明天",
    后天: "后天",
    大后天: "大后天",
    下周: "下周",
    下个月: "下个月",
    这周: "本周",
    这个月: "本月",

    // 事件类型
    开会: "会议",
    会议: "会议",
    约会: "约会",
    聚餐: "聚餐",
    吃饭: "聚餐",
    上课: "课程",
    培训: "培训",
    面试: "面试",
    看医生: "医疗预约",
    看牙医: "牙医预约",
    体检: "体检",
    运动: "运动",
    健身: "健身",

    // 常见错误
    明明: "明天",
    后后: "后天",
    开开: "开会",
    会会: "会议",
    点点: "点",
    分分: "分",
    号号: "号",
    月月: "月",
    年年: "年",

    // 数字纠错
    幺: "1",
    两: "2",
    俩: "2",
    仨: "3",
    四: "4",
    五: "5",
    六: "6",
    七: "7",
    八: "8",
    九: "9",
    零: "0",
  }

  // 时间表达式模式
  private timePatterns = [
    // 标准时间格式
    /(\d{1,2})[点:：](\d{1,2})[分]?/g,
    /(\d{1,2})[点:：]/g,
    /(上午|下午|早上|晚上|中午)\s*(\d{1,2})[点:：](\d{1,2})?[分]?/g,
    /(上午|下午|早上|晚上|中午)\s*(\d{1,2})[点:：]/g,

    // 中文时间表达
    /([一二三四五六七八九十]+)[点:：]([一二三四五六七八九十]+)[分]?/g,
    /([一二三四五六七八九十]+)[点:：]/g,
    /(上午|下午|早上|晚上|中午)\s*([一二三四五六七八九十]+)[点:：]([一二三四五六七八九十]+)?[分]?/g,
  ]

  // 日期表达式模式
  private datePatterns = [
    /(今天|明天|后天|大后天)/g,
    /(下周|下个月|下星期)([一二三四五六日天])?/g,
    /(\d{1,2})月(\d{1,2})[日号]/g,
    /([一二三四五六七八九十]+)月([一二三四五六七八九十]+)[日号]/g,
    /(星期|周)([一二三四五六日天])/g,
  ]

  // 事件类型模式
  private eventPatterns = [
    /(开会|会议|例会|讨论|商议)/g,
    /(约会|见面|聚会|聚餐|吃饭|喝茶|咖啡)/g,
    /(上课|课程|培训|学习|讲座|研讨)/g,
    /(面试|招聘|求职)/g,
    /(医生|医院|体检|看病|牙医|检查)/g,
    /(运动|健身|跑步|游泳|瑜伽|篮球|足球)/g,
    /(购物|买东西|逛街)/g,
    /(旅行|出差|度假|旅游)/g,
  ]

  /**
   * 处理语音识别结果
   */
  processSpeechResult(text: string, confidence: number): ProcessedSpeechResult {
    const corrections: SpeechCorrection[] = []
    let correctedText = text

    // 1. 基础文本清理
    correctedText = this.cleanText(correctedText)

    // 2. 常见错误纠正
    const commonCorrections = this.applyCommonCorrections(correctedText)
    correctedText = commonCorrections.text
    corrections.push(...commonCorrections.corrections)

    // 3. 数字和时间纠正
    const numberCorrections = this.correctNumbers(correctedText)
    correctedText = numberCorrections.text
    corrections.push(...numberCorrections.corrections)

    // 4. 时间表达式标准化
    const timeCorrections = this.standardizeTimeExpressions(correctedText)
    correctedText = timeCorrections.text
    corrections.push(...timeCorrections.corrections)

    // 5. 日期表达式标准化
    const dateCorrections = this.standardizeDateExpressions(correctedText)
    correctedText = dateCorrections.text
    corrections.push(...dateCorrections.corrections)

    // 6. 事件信息提取
    const eventInfo = this.extractEventInfo(correctedText)

    // 7. 计算最终置信度
    const finalConfidence = this.calculateFinalConfidence(confidence, corrections, eventInfo)

    return {
      originalText: text,
      correctedText,
      confidence: finalConfidence,
      corrections,
      eventInfo,
    }
  }

  /**
   * 基础文本清理
   */
  private cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, " ") // 多个空格合并为一个
      .replace(/[，。！？；：]/g, "") // 移除标点符号
      .replace(/\s*([点分号月日年])\s*/g, "$1") // 移除时间单位周围的空格
  }

  /**
   * 应用常见错误纠正
   */
  private applyCommonCorrections(text: string): { text: string; corrections: SpeechCorrection[] } {
    let correctedText = text
    const corrections: SpeechCorrection[] = []

    for (const [original, corrected] of Object.entries(this.commonCorrections)) {
      const regex = new RegExp(original, "g")
      if (regex.test(correctedText)) {
        correctedText = correctedText.replace(regex, corrected)
        corrections.push({
          original,
          corrected,
          type: this.getCorrectionType(original),
          confidence: 0.9,
        })
      }
    }

    return { text: correctedText, corrections }
  }

  /**
   * 数字纠正（中文数字转阿拉伯数字）
   */
  private correctNumbers(text: string): { text: string; corrections: SpeechCorrection[] } {
    let correctedText = text
    const corrections: SpeechCorrection[] = []

    const chineseNumbers = {
      一: "1",
      二: "2",
      三: "3",
      四: "4",
      五: "5",
      六: "6",
      七: "7",
      八: "8",
      九: "9",
      十: "10",
      十一: "11",
      十二: "12",
      十三: "13",
      十四: "14",
      十五: "15",
      十六: "16",
      十七: "17",
      十八: "18",
      十九: "19",
      二十: "20",
      二十一: "21",
      二十二: "22",
      二十三: "23",
      二十四: "24",
      三十: "30",
      四十: "40",
      五十: "50",
    }

    for (const [chinese, arabic] of Object.entries(chineseNumbers)) {
      const regex = new RegExp(chinese, "g")
      if (regex.test(correctedText)) {
        correctedText = correctedText.replace(regex, arabic)
        corrections.push({
          original: chinese,
          corrected: arabic,
          type: "number",
          confidence: 0.95,
        })
      }
    }

    return { text: correctedText, corrections }
  }

  /**
   * 时间表达式标准化
   */
  private standardizeTimeExpressions(text: string): { text: string; corrections: SpeechCorrection[] } {
    let correctedText = text
    const corrections: SpeechCorrection[] = []

    // 标准化时间格式
    correctedText = correctedText.replace(/(\d{1,2})[点:：](\d{1,2})[分]?/g, (match, hour, minute) => {
      const standardTime = `${hour}:${minute.padStart(2, "0")}`
      if (match !== standardTime) {
        corrections.push({
          original: match,
          corrected: standardTime,
          type: "time",
          confidence: 0.9,
        })
      }
      return standardTime
    })

    // 处理只有小时的情况
    correctedText = correctedText.replace(/(\d{1,2})[点:：]/g, (match, hour) => {
      const standardTime = `${hour}:00`
      if (match !== standardTime) {
        corrections.push({
          original: match,
          corrected: standardTime,
          type: "time",
          confidence: 0.85,
        })
      }
      return standardTime
    })

    // 处理上午下午
    correctedText = correctedText.replace(
      /(上午|下午|早上|晚上|中午)\s*(\d{1,2}):(\d{2})/g,
      (match, period, hour, minute) => {
        let adjustedHour = Number.parseInt(hour)

        if (period === "下午" || period === "晚上") {
          if (adjustedHour < 12) adjustedHour += 12
        } else if (period === "上午" || period === "早上") {
          if (adjustedHour === 12) adjustedHour = 0
        } else if (period === "中午") {
          if (adjustedHour < 12) adjustedHour = 12
        }

        const standardTime = `${adjustedHour.toString().padStart(2, "0")}:${minute}`
        corrections.push({
          original: match,
          corrected: standardTime,
          type: "time",
          confidence: 0.9,
        })
        return standardTime
      },
    )

    return { text: correctedText, corrections }
  }

  /**
   * 日期表达式标准化
   */
  private standardizeDateExpressions(text: string): { text: string; corrections: SpeechCorrection[] } {
    const correctedText = text
    const corrections: SpeechCorrection[] = []

    const today = new Date()

    // 处理相对日期
    const relativeDates = {
      今天: 0,
      明天: 1,
      后天: 2,
      大后天: 3,
    }

    for (const [relative, days] of Object.entries(relativeDates)) {
      if (correctedText.includes(relative)) {
        const targetDate = new Date(today)
        targetDate.setDate(today.getDate() + days)
        const standardDate = targetDate.toISOString().split("T")[0]

        corrections.push({
          original: relative,
          corrected: standardDate,
          type: "date",
          confidence: 0.95,
        })
      }
    }

    return { text: correctedText, corrections }
  }

  /**
   * 提取事件信息
   */
  private extractEventInfo(text: string): ExtractedEventInfo | undefined {
    const timeMatches = text.match(/\d{1,2}:\d{2}/g)
    const dateMatches = text.match(/(今天|明天|后天|下周|下个月|\d{4}-\d{2}-\d{2})/g)

    let eventType = "新事件"
    let confidence = 0.5

    // 识别事件类型
    for (const pattern of this.eventPatterns) {
      const matches = text.match(pattern)
      if (matches) {
        eventType = this.getEventTypeFromMatch(matches[0])
        confidence += 0.2
        break
      }
    }

    if (timeMatches || dateMatches) {
      const startTime = timeMatches?.[0] || "09:00"
      const endTime = timeMatches?.[1] || this.calculateEndTime(startTime)
      const date = this.parseDateFromText(text)

      return {
        title: eventType,
        date,
        startTime,
        endTime,
        description: `基于语音识别创建：${text}`,
        confidence: Math.min(confidence, 1.0),
      }
    }

    return undefined
  }

  /**
   * 计算最终置信度
   */
  private calculateFinalConfidence(
    originalConfidence: number,
    corrections: SpeechCorrection[],
    eventInfo?: ExtractedEventInfo,
  ): number {
    let finalConfidence = originalConfidence

    // 纠正越多，置信度可能越低
    const correctionPenalty = Math.min(corrections.length * 0.05, 0.3)
    finalConfidence -= correctionPenalty

    // 但如果纠正后能提取到完整事件信息，则提高置信度
    if (eventInfo && eventInfo.confidence > 0.7) {
      finalConfidence += 0.2
    }

    // 高置信度的纠正实际上提高了整体质量
    const highConfidenceCorrections = corrections.filter((c) => c.confidence > 0.9).length
    finalConfidence += highConfidenceCorrections * 0.05

    return Math.max(0.1, Math.min(1.0, finalConfidence))
  }

  /**
   * 辅助方法
   */
  private getCorrectionType(word: string): SpeechCorrection["type"] {
    if (/[点分时]/.test(word)) return "time"
    if (/[天月年周]/.test(word)) return "date"
    if (/[一二三四五六七八九十]/.test(word)) return "number"
    if (/[会议约会聚餐课程]/.test(word)) return "event_type"
    return "common_word"
  }

  private getEventTypeFromMatch(match: string): string {
    if (/会议|开会/.test(match)) return "会议"
    if (/约会|见面/.test(match)) return "约会"
    if (/聚餐|吃饭/.test(match)) return "聚餐"
    if (/课程|上课/.test(match)) return "课程"
    if (/面试/.test(match)) return "面试"
    if (/医生|医院/.test(match)) return "医疗预约"
    if (/运动|健身/.test(match)) return "运动"
    return "新事件"
  }

  private calculateEndTime(startTime: string): string {
    const [hour, minute] = startTime.split(":").map(Number)
    const endHour = hour + 1
    return `${endHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
  }

  private parseDateFromText(text: string): string {
    const today = new Date()

    if (text.includes("明天")) {
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      return tomorrow.toISOString().split("T")[0]
    }

    if (text.includes("后天")) {
      const dayAfter = new Date(today)
      dayAfter.setDate(today.getDate() + 2)
      return dayAfter.toISOString().split("T")[0]
    }

    return today.toISOString().split("T")[0]
  }
}

// 全局实例
export const speechPostProcessor = new SpeechPostProcessor()
