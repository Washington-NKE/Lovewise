type CacheEntry<T> = {
  value: T
  expiresAt: number
}

class ServerCache {
  private store = new Map<string, CacheEntry<unknown>>()

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }

    return entry.value as T
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    })
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  deleteByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key)
      }
    }
  }
}

const globalForCache = globalThis as unknown as {
  __lovewiseServerCache?: ServerCache
}

export const serverCache =
  globalForCache.__lovewiseServerCache ?? (globalForCache.__lovewiseServerCache = new ServerCache())
