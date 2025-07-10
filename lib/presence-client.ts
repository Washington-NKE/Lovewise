// lib/presence-client.ts (Client-side WebSocket handling)
export class PresenceClient {
  private ws: WebSocket | null = null
  private userId: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private pingInterval: NodeJS.Timeout | null = null

  constructor(userId: string) {
    this.userId = userId
  }

  connect() {
    try {
      this.ws = new WebSocket(`ws://localhost:3001?userId=${this.userId}`)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.startPinging()
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.stopPinging()
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Error connecting to WebSocket:', error)
      this.attemptReconnect()
    }
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'ping':
        this.send({ type: 'pong' })
        break
      
      case 'presence_change':
        if (typeof message.userId === 'string' && typeof message.isOnline === 'boolean') {
          this.onPresenceChange?.(message.userId, message.isOnline)
        } else {
          console.error('Invalid presence_change message: userId or isOnline has wrong type', message)
        }
        break
      
      case 'presence_update':
        if (Array.isArray(message.partners)) {
          this.onPresenceUpdate?.(message.partners as PresenceStatus[])
        } else {
          console.error('Invalid presence_update message: partners is not an array', message.partners)
        }
        break
    }
  }

  private startPinging() {
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping' })
    }, 30000) // Ping every 30 seconds
  }

  private stopPinging() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect()
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  updatePresence() {
    this.send({ type: 'presence_update' })
  }

  requestPresence() {
    this.send({ type: 'request_presence' })
  }

  disconnect() {
    this.stopPinging()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  // Event handlers (to be set by the consumer)
  onPresenceChange?: (userId: string, isOnline: boolean) => void
  onPresenceUpdate?: (partners: PresenceStatus[]) => void
}

// types/presence.ts (TypeScript types)
export interface PresenceStatus {
  userId: string
  name: string
  profileImage?: string
  isOnline: boolean
  lastSeen?: Date
}

export interface PresenceUpdate {
  type: 'presence_update'
  partners: PresenceStatus[]
}

export interface PresenceChange {
  type: 'presence_change'
  userId: string
  isOnline: boolean
  timestamp: string
}

export interface WebSocketMessage {
  type: 'ping' | 'pong' | 'presence_update' | 'presence_change' | 'request_presence'
  [key: string]: unknown
}