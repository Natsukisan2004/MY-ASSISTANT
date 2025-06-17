"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { createAIService } from "@/lib/ai-service"
import { CheckCircle, XCircle, AlertTriangle, Settings } from "lucide-react"

export function APIDebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testInput, setTestInput] = useState("明天下午2点开会")

  const aiService = createAIService()

  const testAPI = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      if (!aiService) {
        throw new Error("AI Service not configured - missing API key")
      }

      const result = await aiService.processUserInput(testInput, "text")
      setTestResult({ success: true, data: result })
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        details: error.stack,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getAPIStatus = () => {
    const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY
    const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL

    if (!apiKey) return { status: "error", message: "API密钥未配置" }
    if (!apiKey.startsWith("sk-")) return { status: "warning", message: "API密钥格式可能不正确" }
    if (!apiUrl) return { status: "warning", message: "使用默认API地址" }

    return { status: "success", message: "配置正常" }
  }

  const apiStatus = getAPIStatus()

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="fixed bottom-20 right-6 z-40">
        <Settings className="h-4 w-4 mr-2" />
        API调试
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-20 right-6 w-96 z-40 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">API调试面板</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API状态 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {apiStatus.status === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
            {apiStatus.status === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
            {apiStatus.status === "error" && <XCircle className="h-4 w-4 text-red-600" />}
            <span className="text-sm font-medium">API状态</span>
          </div>
          <Badge variant={apiStatus.status === "success" ? "default" : "destructive"}>{apiStatus.message}</Badge>
        </div>

        {/* 配置信息 */}
        <div className="text-xs space-y-1">
          <div>API地址: {process.env.NEXT_PUBLIC_AI_API_URL || "默认"}</div>
          <div>API密钥: {process.env.NEXT_PUBLIC_AI_API_KEY ? "已配置" : "未配置"}</div>
          <div>模型: gpt-3.5-turbo</div>
        </div>

        {/* 测试输入 */}
        <div>
          <label className="text-sm font-medium mb-2 block">测试输入:</label>
          <Textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="输入测试文本..."
            rows={2}
          />
        </div>

        {/* 测试按钮 */}
        <Button onClick={testAPI} disabled={isLoading || !aiService} className="w-full" size="sm">
          {isLoading ? "测试中..." : "测试API"}
        </Button>

        {/* 测试结果 */}
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            <AlertDescription className="text-xs">
              {testResult.success ? (
                <div>
                  <div className="font-medium text-green-700">✅ API调用成功</div>
                  <div className="mt-1">
                    提取事件: {testResult.data.events.length} 个<br />
                    置信度: {Math.round(testResult.data.confidence * 100)}%
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium text-red-700">❌ API调用失败</div>
                  <div className="mt-1">{testResult.error}</div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
