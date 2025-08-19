interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  url: string
  userId?: string
  metadata?: Record<string, any>
}

interface WebVitals {
  CLS: number | null
  FID: number | null
  FCP: number | null
  LCP: number | null
  TTFB: number | null
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private webVitals: WebVitals = {
    CLS: null,
    FID: null,
    FCP: null,
    LCP: null,
    TTFB: null,
  }

  init() {
    if (typeof window === "undefined") return

    // Monitor Core Web Vitals
    this.observeWebVitals()

    // Monitor custom metrics
    this.observePageLoad()
    this.observeUserInteractions()
    this.observeResourceLoading()

    // Send metrics periodically
    this.startMetricsSending()
  }

  private observeWebVitals() {
    // Use web-vitals library approach
    if ("PerformanceObserver" in window) {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.webVitals.LCP = lastEntry.startTime
        this.recordMetric("LCP", lastEntry.startTime)
      }).observe({ type: "largest-contentful-paint", buffered: true })

      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.webVitals.FID = entry.processingStart - entry.startTime
          this.recordMetric("FID", entry.processingStart - entry.startTime)
        })
      }).observe({ type: "first-input", buffered: true })

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.webVitals.CLS = clsValue
        this.recordMetric("CLS", clsValue)
      }).observe({ type: "layout-shift", buffered: true })

      // First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          this.webVitals.FCP = entry.startTime
          this.recordMetric("FCP", entry.startTime)
        })
      }).observe({ type: "paint", buffered: true })
    }

    // Time to First Byte
    if ("navigation" in performance) {
      const navTiming = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      if (navTiming) {
        this.webVitals.TTFB = navTiming.responseStart - navTiming.requestStart
        this.recordMetric("TTFB", this.webVitals.TTFB)
      }
    }
  }

  private observePageLoad() {
    window.addEventListener("load", () => {
      const loadTime = performance.now()
      this.recordMetric("page-load-time", loadTime)

      // Memory usage
      if ("memory" in performance) {
        const memory = (performance as any).memory
        this.recordMetric("memory-used", memory.usedJSHeapSize, {
          totalHeapSize: memory.totalJSHeapSize,
          heapSizeLimit: memory.jsHeapSizeLimit,
        })
      }
    })
  }

  private observeUserInteractions() {
    // Track typing performance
    let typingStartTime: number | null = null

    document.addEventListener("keydown", () => {
      if (!typingStartTime) {
        typingStartTime = performance.now()
      }
    })

    document.addEventListener("keyup", () => {
      if (typingStartTime) {
        const typingLatency = performance.now() - typingStartTime
        this.recordMetric("typing-latency", typingLatency)
        typingStartTime = null
      }
    })

    // Track click responsiveness
    document.addEventListener("click", (event) => {
      const clickTime = performance.now()
      requestAnimationFrame(() => {
        const responseTime = performance.now() - clickTime
        this.recordMetric("click-response-time", responseTime, {
          target: (event.target as Element)?.tagName,
        })
      })
    })
  }

  private observeResourceLoading() {
    if ("PerformanceObserver" in window) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === "resource") {
            const resourceEntry = entry as PerformanceResourceTiming
            this.recordMetric("resource-load-time", resourceEntry.duration, {
              resourceType: resourceEntry.initiatorType,
              resourceName: resourceEntry.name,
              transferSize: resourceEntry.transferSize,
            })
          }
        })
      }).observe({ type: "resource", buffered: true })
    }
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      metadata,
    }

    // Add user ID if available
    const userData = localStorage.getItem("learning-enhanced-user")
    if (userData) {
      try {
        const user = JSON.parse(userData)
        metric.userId = user.id
      } catch (e) {
        // Ignore parsing errors
      }
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500)
    }
  }

  getWebVitals(): WebVitals {
    return { ...this.webVitals }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  private startMetricsSending() {
    // Send metrics every 30 seconds
    setInterval(() => {
      if (this.metrics.length > 0) {
        this.sendMetricsToServer()
      }
    }, 30000)

    // Send metrics before page unload
    window.addEventListener("beforeunload", () => {
      if (this.metrics.length > 0) {
        this.sendMetricsToServer(true)
      }
    })
  }

  private async sendMetricsToServer(isBeforeUnload = false) {
    try {
      const metricsToSend = [...this.metrics]
      this.metrics = []

      const payload = {
        metrics: metricsToSend,
        webVitals: this.webVitals,
        timestamp: Date.now(),
      }

      if (isBeforeUnload && "sendBeacon" in navigator) {
        navigator.sendBeacon("/api/performance", JSON.stringify(payload))
      } else {
        await fetch("/api/performance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
      }
    } catch (error) {
      console.warn("Failed to send performance metrics:", error)
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Auto-initialize in browser
if (typeof window !== "undefined") {
  performanceMonitor.init()
}
