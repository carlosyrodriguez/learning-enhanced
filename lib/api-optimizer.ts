interface RequestMetrics {
  endpoint: string
  duration: number
  status: number
  timestamp: number
  cacheHit: boolean
}

class APIOptimizer {
  private metrics: RequestMetrics[] = []
  private slowRequestThreshold = 2000 // 2 seconds

  logRequest(endpoint: string, duration: number, status: number, cacheHit = false) {
    const metric: RequestMetrics = {
      endpoint,
      duration,
      status,
      timestamp: Date.now(),
      cacheHit,
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500)
    }

    // Log slow requests
    if (duration > this.slowRequestThreshold) {
      console.warn(`Slow API request: ${endpoint} took ${duration}ms`)
    }
  }

  getMetrics() {
    return [...this.metrics]
  }

  getAverageResponseTime(endpoint?: string) {
    const relevantMetrics = endpoint ? this.metrics.filter((m) => m.endpoint === endpoint) : this.metrics

    if (relevantMetrics.length === 0) return 0

    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0)
    return total / relevantMetrics.length
  }

  getCacheHitRate(endpoint?: string) {
    const relevantMetrics = endpoint ? this.metrics.filter((m) => m.endpoint === endpoint) : this.metrics

    if (relevantMetrics.length === 0) return 0

    const cacheHits = relevantMetrics.filter((m) => m.cacheHit).length
    return (cacheHits / relevantMetrics.length) * 100
  }

  getErrorRate(endpoint?: string) {
    const relevantMetrics = endpoint ? this.metrics.filter((m) => m.endpoint === endpoint) : this.metrics

    if (relevantMetrics.length === 0) return 0

    const errors = relevantMetrics.filter((m) => m.status >= 400).length
    return (errors / relevantMetrics.length) * 100
  }
}

export const apiOptimizer = new APIOptimizer()

// Middleware for API monitoring
export function withAPIMonitoring(handler: Function, endpoint: string) {
  return async (request: any) => {
    const startTime = Date.now()
    let status = 200
    let cacheHit = false

    try {
      const response = await handler(request)
      status = response.status || 200
      cacheHit = response.headers?.get?.("X-Cache") === "HIT"
      return response
    } catch (error) {
      status = 500
      throw error
    } finally {
      const duration = Date.now() - startTime
      apiOptimizer.logRequest(endpoint, duration, status, cacheHit)
    }
  }
}
