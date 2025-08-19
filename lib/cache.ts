interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()
  private maxSize = 100

  set<T>(key: string, data: T, ttlSeconds = 300): void {
    // Clean up expired items if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }
}

export const memoryCache = new MemoryCache()

// Browser storage cache with compression
export class BrowserCache {
  private prefix = "learning-enhanced-"

  set(key: string, data: any, ttlSeconds = 3600): void {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl: ttlSeconds * 1000,
      }
      localStorage.setItem(this.prefix + key, JSON.stringify(item))
    } catch (error) {
      console.warn("Failed to cache data:", error)
    }
  }

  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(this.prefix + key)
      if (!stored) return null

      const item = JSON.parse(stored)
      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(this.prefix + key)
        return null
      }

      return item.data
    } catch (error) {
      console.warn("Failed to retrieve cached data:", error)
      return null
    }
  }

  clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }
}

export const browserCache = new BrowserCache()
