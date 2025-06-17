"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export type Language = "zh" | "ja" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  zh: {
    // Header
    "header.title": "我的日历",
    "header.logout": "退出登录",

    // Calendar
    "calendar.today": "今天",
    "calendar.addEvent": "添加事件",
    "calendar.searchEvents": "搜索事件",
    "calendar.quickActions": "快速操作",
    "calendar.viewWeek": "查看本周",
    "calendar.viewMonth": "查看本月",
    "calendar.noEvents": "暂无事件安排",

    // Event Dialog
    "event.add": "添加新事件",
    "event.edit": "编辑事件",
    "event.title": "标题",
    "event.description": "描述",
    "event.date": "日期",
    "event.startTime": "开始时间",
    "event.endTime": "结束时间",
    "event.color": "颜色",
    "event.save": "保存",
    "event.cancel": "取消",
    "event.delete": "删除",
    "event.confirmDelete": "确认删除",
    "event.deleteMessage": "您确定要删除这个事件吗？此操作无法撤销。",

    // AI Assistant
    "ai.title": "AI助手",
    "ai.placeholder": "输入消息、上传图片或使用语音...",
    "ai.send": "发送",
    "ai.voice": "语音输入",
    "ai.photo": "上传图片",
    "ai.processing": "处理中...",
    "ai.welcome": "你好！我是你的AI日历助手。我可以通过文字、语音或图片帮你创建和管理日程安排。",

    // Colors
    "color.blue": "蓝色",
    "color.green": "绿色",
    "color.red": "红色",
    "color.purple": "紫色",
    "color.orange": "橙色",
    "color.pink": "粉色",

    // Days
    "day.sun": "日",
    "day.mon": "一",
    "day.tue": "二",
    "day.wed": "三",
    "day.thu": "四",
    "day.fri": "五",
    "day.sat": "六",
  },
  ja: {
    // Header
    "header.title": "マイカレンダー",
    "header.logout": "ログアウト",

    // Calendar
    "calendar.today": "今日",
    "calendar.addEvent": "イベント追加",
    "calendar.searchEvents": "イベント検索",
    "calendar.quickActions": "クイックアクション",
    "calendar.viewWeek": "週表示",
    "calendar.viewMonth": "月表示",
    "calendar.noEvents": "イベントはありません",

    // Event Dialog
    "event.add": "新しいイベント",
    "event.edit": "イベント編集",
    "event.title": "タイトル",
    "event.description": "説明",
    "event.date": "日付",
    "event.startTime": "開始時間",
    "event.endTime": "終了時間",
    "event.color": "色",
    "event.save": "保存",
    "event.cancel": "キャンセル",
    "event.delete": "削除",
    "event.confirmDelete": "削除確認",
    "event.deleteMessage": "このイベントを削除してもよろしいですか？この操作は元に戻せません。",

    // AI Assistant
    "ai.title": "AIアシスタント",
    "ai.placeholder": "メッセージを入力、画像をアップロード、または音声を使用...",
    "ai.send": "送信",
    "ai.voice": "音声入力",
    "ai.photo": "画像アップロード",
    "ai.processing": "処理中...",
    "ai.welcome":
      "こんにちは！私はあなたのAIカレンダーアシスタントです。テキスト、音声、画像を通じてスケジュール管理をお手伝いします。",

    // Colors
    "color.blue": "青",
    "color.green": "緑",
    "color.red": "赤",
    "color.purple": "紫",
    "color.orange": "オレンジ",
    "color.pink": "ピンク",

    // Days
    "day.sun": "日",
    "day.mon": "月",
    "day.tue": "火",
    "day.wed": "水",
    "day.thu": "木",
    "day.fri": "金",
    "day.sat": "土",
  },
  en: {
    // Header
    "header.title": "My Calendar",
    "header.logout": "Logout",

    // Calendar
    "calendar.today": "Today",
    "calendar.addEvent": "Add Event",
    "calendar.searchEvents": "Search Events",
    "calendar.quickActions": "Quick Actions",
    "calendar.viewWeek": "View Week",
    "calendar.viewMonth": "View Month",
    "calendar.noEvents": "No events scheduled",

    // Event Dialog
    "event.add": "Add New Event",
    "event.edit": "Edit Event",
    "event.title": "Title",
    "event.description": "Description",
    "event.date": "Date",
    "event.startTime": "Start Time",
    "event.endTime": "End Time",
    "event.color": "Color",
    "event.save": "Save",
    "event.cancel": "Cancel",
    "event.delete": "Delete",
    "event.confirmDelete": "Confirm Delete",
    "event.deleteMessage": "Are you sure you want to delete this event? This action cannot be undone.",

    // AI Assistant
    "ai.title": "AI Assistant",
    "ai.placeholder": "Type message, upload image, or use voice...",
    "ai.send": "Send",
    "ai.voice": "Voice Input",
    "ai.photo": "Upload Photo",
    "ai.processing": "Processing...",
    "ai.welcome":
      "Hello! I'm your AI calendar assistant. I can help you create and manage schedules through text, voice, or images.",

    // Colors
    "color.blue": "Blue",
    "color.green": "Green",
    "color.red": "Red",
    "color.purple": "Purple",
    "color.orange": "Orange",
    "color.pink": "Pink",

    // Days
    "day.sun": "Sun",
    "day.mon": "Mon",
    "day.tue": "Tue",
    "day.wed": "Wed",
    "day.thu": "Thu",
    "day.fri": "Fri",
    "day.sat": "Sat",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("zh")

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
