import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { metrics, webVitals, timestamp } = await request.json()

    // In production, you would send this to analytics services like:
    // - Google Analytics 4
    // - New Relic
    // - DataDog
    // - Custom analytics dashboard

    console.log("Performance Metrics Received:", {
      timestamp: new Date(timestamp).toISOString(),
      metricsCount: metrics.length,
      webVitals,
    })

    // Log key metrics
    metrics.forEach((metric: any) => {
      if (["LCP", "FID", "CLS", "FCP", "TTFB"].includes(metric.name)) {
        console.log(`Web Vital - ${metric.name}: ${metric.value}ms`)
      }
    })

    // Alert on poor performance
    if (webVitals.LCP > 2500) {
      console.warn("Poor LCP detected:", webVitals.LCP)
    }
    if (webVitals.FID > 100) {
      console.warn("Poor FID detected:", webVitals.FID)
    }
    if (webVitals.CLS > 0.1) {
      console.warn("Poor CLS detected:", webVitals.CLS)
    }

    return NextResponse.json({ success: true, processed: metrics.length })
  } catch (error) {
    console.error("Performance monitoring failed:", error)
    return NextResponse.json({ error: "Failed to process performance data" }, { status: 500 })
  }
}
