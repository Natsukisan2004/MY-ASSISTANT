"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Chrome } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const { user, isLoading, signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/calendar")
    }
  }, [user, router])

  const handleGoogleSignIn = async () => {
    await signIn()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Calendar className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">欢迎使用日历应用</CardTitle>
          <CardDescription>使用您的Google账户登录来管理您的日程安排</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full" size="lg">
            <Chrome className="mr-2 h-5 w-5" />
            {isLoading ? "登录中..." : "使用Google账户登录"}
          </Button>
          <p className="text-xs text-gray-500 mt-4 text-center">* 这是演示版本，使用模拟的Google登录</p>
        </CardContent>
      </Card>
    </div>
  )
}
