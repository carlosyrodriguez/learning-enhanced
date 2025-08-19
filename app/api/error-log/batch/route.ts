import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { logs } = await request.json()

    // Process batch of error logs
    console.log(`Processing ${logs.length} error logs:`)
    logs.forEach((log: any) => {
      console.error("Batch Error:", {
        timestamp: new Date(log.timestamp).toISOString(),
        severity: log.severity,
        message: log.message,
        userId: log.userId,
      })
    })

    return NextResponse.json({ success: true, processed: logs.length })
  } catch (error) {
    console.error("Batch error logging failed:", error)
    return NextResponse.json({ error: "Failed to process error logs" }, { status: 500 })
  }
}
