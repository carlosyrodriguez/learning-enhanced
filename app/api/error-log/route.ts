import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const errorLog = await request.json()

    // In a real application, you would send this to a service like Sentry, LogRocket, or your own logging service
    // For now, we'll just log to console and store in memory
    console.error("Client Error:", {
      timestamp: new Date(errorLog.timestamp).toISOString(),
      severity: errorLog.severity,
      message: errorLog.message,
      url: errorLog.url,
      userId: errorLog.userId,
      context: errorLog.context,
    })

    // Here you would typically:
    // - Send to Sentry: Sentry.captureException(error)
    // - Send to LogRocket: LogRocket.captureException(error)
    // - Store in database for analysis
    // - Send alerts for critical errors

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging failed:", error)
    return NextResponse.json({ error: "Failed to log error" }, { status: 500 })
  }
}
