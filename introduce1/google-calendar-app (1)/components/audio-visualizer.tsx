"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AudioVisualizerProps {
  isActive: boolean
  className?: string
  type?: "bars" | "circle" | "wave"
  color?: string
}

export function AudioVisualizer({
  isActive,
  className,
  type = "bars",
  color = "rgb(239, 68, 68)",
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [audioData, setAudioData] = useState<number[]>(new Array(32).fill(0))

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      setAudioData(new Array(32).fill(0))
      return
    }

    const animate = () => {
      // 模拟音频数据
      const newData = audioData.map(() => Math.random() * 100)
      setAudioData(newData)

      if (isActive) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    if (type === "bars") {
      drawBars(ctx, width, height, audioData, color)
    } else if (type === "circle") {
      drawCircle(ctx, width, height, audioData, color)
    } else if (type === "wave") {
      drawWave(ctx, width, height, audioData, color)
    }
  }, [audioData, type, color])

  const drawBars = (ctx: CanvasRenderingContext2D, width: number, height: number, data: number[], color: string) => {
    const barWidth = width / data.length
    const maxBarHeight = height * 0.8

    data.forEach((value, index) => {
      const barHeight = (value / 100) * maxBarHeight
      const x = index * barWidth
      const y = height - barHeight

      ctx.fillStyle = color
      ctx.fillRect(x, y, barWidth - 2, barHeight)
    })
  }

  const drawCircle = (ctx: CanvasRenderingContext2D, width: number, height: number, data: number[], color: string) => {
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 4
    const angleStep = (Math.PI * 2) / data.length

    ctx.strokeStyle = color
    ctx.lineWidth = 2

    data.forEach((value, index) => {
      const angle = index * angleStep
      const lineLength = (value / 100) * radius
      const startX = centerX + Math.cos(angle) * radius
      const startY = centerY + Math.sin(angle) * radius
      const endX = centerX + Math.cos(angle) * (radius + lineLength)
      const endY = centerY + Math.sin(angle) * (radius + lineLength)

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.stroke()
    })
  }

  const drawWave = (ctx: CanvasRenderingContext2D, width: number, height: number, data: number[], color: string) => {
    const centerY = height / 2
    const stepX = width / data.length

    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((value, index) => {
      const x = index * stepX
      const y = centerY + ((value - 50) / 50) * (height / 4)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  }

  return <canvas ref={canvasRef} width={200} height={100} className={cn("w-full h-full", className)} />
}
