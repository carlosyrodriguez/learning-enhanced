interface ErrorLog {
  message: string
  stack?: string
  url: string
  userAgent: string
  timestamp: number
  userId?: string
  severity: "low" | "medium" | "high" | "critical"
  context?: Record<string, any>
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private maxLogs = 100
  private endpoint = "/api/error-log"

  logError(error: Error | string, severity: ErrorLog["severity"] = "medium", context?: Record<string, any>) {
    const errorLog: ErrorLog = {
      message: typeof error === "string" ? error : error.message,
      stack: typeof error === "object" ? error.stack : undefined,
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      timestamp: Date.now(),
      severity,
      context,
    }

    // Add user ID if available
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("learning-enhanced-user")
      if (userData) {
        try {
          const user = JSON.parse(userData)
          errorLog.userId = user.id
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }

    this.logs.push(errorLog)

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Send to server for critical errors
    if (severity === "critical" || severity === "high") {
      this.sendToServer(errorLog)
    }

    // Console log for development
    if (process.env.NODE_ENV === "development") {
      console.error(`[${severity.toUpperCase()}]`, errorLog)
    }
  }

  private async sendToServer(errorLog: ErrorLog) {
    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorLog),
      })
    } catch (e) {
      // Silently fail to avoid infinite error loops
      console.warn("Failed to send error log to server:", e)
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }

  // Batch send logs periodically
  startBatchSending(intervalMs = 30000) {
    if (typeof window === "undefined") return

    setInterval(() => {
      if (this.logs.length > 0) {
        const logsToSend = this.logs.filter((log) => log.severity === "medium" || log.severity === "low")
        if (logsToSend.length > 0) {
          this.sendBatchToServer(logsToSend)
        }
      }
    }, intervalMs)
  }

  private async sendBatchToServer(logs: ErrorLog[]) {
    try {
      await fetch("/api/error-log/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logs }),
      })

      // Remove sent logs
      this.logs = this.logs.filter((log) => !logs.includes(log))
    } catch (e) {
      console.warn("Failed to send batch error logs:", e)
    }
  }
}

export const errorLogger = new ErrorLogger()

// Global error handlers
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    errorLogger.logError(event.error || event.message, "high", {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  window.addEventListener("unhandledrejection", (event) => {
    errorLogger.logError(event.reason instanceof Error ? event.reason : String(event.reason), "high", {
      type: "unhandledPromiseRejection",
    })
  })

  // Start batch sending
  errorLogger.startBatchSending()
}
