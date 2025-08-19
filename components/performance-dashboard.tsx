"use client"

import { useEffect, useState } from "react"
import { performanceMonitor } from "@/lib/performance-monitor"

interface WebVitals {
  CLS: number | null
  FID: number | null
  FCP: number | null
  LCP: number | null
  TTFB: number | null
}

export function PerformanceDashboard() {
  const [webVitals, setWebVitals] = useState<WebVitals>({
    CLS: null,
    FID: null,
    FCP: null,
    LCP: null,
    TTFB: null,
  })

  useEffect(() => {
    const updateVitals = () => {
      setWebVitals(performanceMonitor.getWebVitals())
    }

    updateVitals()
    const interval = setInterval(updateVitals, 1000)

    return () => clearInterval(interval)
  }, [])

  const getScoreColor = (metric: string, value: number | null) => {
    if (value === null) return "text-muted-foreground"

    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    }

    const threshold = thresholds[metric]
    if (!threshold) return "text-muted-foreground"

    if (value <= threshold.good) return "text-green-500"
    if (value <= threshold.poor) return "text-yellow-500"
    return "text-red-500"
  }

  const formatValue = (metric: string, value: number | null) => {
    if (value === null) return "—"
    if (metric === "CLS") return value.toFixed(3)
    return `${Math.round(value)}ms`
  }

  if (process.env.NODE_ENV !== "development") {
    return null // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-50">
      <h3 className="text-sm font-semibold text-foreground mb-2">Web Vitals</h3>
      <div className="space-y-1 text-xs">
        {Object.entries(webVitals).map(([metric, value]) => (
          <div key={metric} className="flex justify-between items-center">
            <span className="text-muted-foreground">{metric}:</span>
            <span className={getScoreColor(metric, value)}>{formatValue(metric, value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
