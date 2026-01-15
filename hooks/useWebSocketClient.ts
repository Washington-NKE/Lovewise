// hooks/useWebSocketClient.ts
import { useEffect, useRef, useState, useCallback } from 'react'

interface WebSocketMessage {
  type: string
  [key: string]: unknown
}

interface PresenceData {
  userId: string
  name: string
  profileImage?: string
  isOnline: boolean
  lastSeen?: Date
}

interface WebSocketClientOptions {
  userId: string
  onPresenceUpdate?: (partners: PresenceData[]) => void
  onPresenceChange?: (userId: string, isOnline: boolean) => void
  onConnectionChange?: (connected: boolean) => void
}

export const useWebSocketClient = (options: WebSocketClientOptions) => {
  const { userId, onPresenceUpdate, onPresenceChange, onConnectionChange } = options
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 3000

  // Memoize callbacks to prevent infinite re-renders

  const handlePresenceUpdate = useCallback((partners: PresenceData[]) => {
    onPresenceUpdate?.(partners)
  }, [onPresenceUpdate])

  const handlePresenceChange = useCallback((userId: string, isOnline: boolean) => {
    onPresenceChange?.(userId, isOnline)
  }, [onPresenceChange])

  const handleConnectionChange = useCallback((connected: boolean) => {
    onConnectionChange?.(connected)
  }, [onConnectionChange])

 const connect = useCallback(() => {
    if (!userId || wsRef.current?.readyState === WebSocket.OPEN) return

   //Better URL construction with fallback
    const port = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_WEBSOCKET_PORT 
      ? process.env.NEXT_PUBLIC_WEBSOCKET_PORT 
      : '3001'
    const wsUrl = `ws://localhost:${port}?userId=${encodeURIComponent(userId)}`
    
    
    try {
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setReconnectAttempts(0)
        onConnectionChange?.(true)
        
        // Request initial presence data
        wsRef.current?.send(JSON.stringify({ type: 'request_presence' }))
      }

  wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          
          switch (message.type) {
            case 'presence_update':
              if (message.partners && Array.isArray(message.partners)) {
                const partners = message.partners.map((partner: Record<string, unknown>): PresenceData => ({
                  userId: (partner.userId as string) || '',
                  name: (partner.name as string) || '',
                  profileImage: (partner.profileImage as string) || undefined,
                  isOnline: (partner.isOnline as boolean) || false,
                  lastSeen: partner.lastSeen ? new Date(partner.lastSeen as string) : undefined
                }))
                handlePresenceUpdate(partners)
              }
              break
              
            case 'presence_change':
              if (message.userId && typeof message.isOnline === 'boolean') {
                handlePresenceChange(message.userId as string, message.isOnline as boolean)
              }
              break
              
            case 'ping':
              // Respond to server ping
              wsRef.current?.send(JSON.stringify({ type: 'pong' }))
              break
              
            case 'pong':
              // Server acknowledged our ping
              break
              
            default:
              console.log('Unknown message type:', message.type)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        handleConnectionChange(false)
        
        // FIX 3: Only attempt reconnect if not manually closed and within limits
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1)
            connect()
          }, reconnectDelay * Math.pow(2, reconnectAttempts)) // Exponential backoff
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
        handleConnectionChange(false)
      }

    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      setIsConnected(false)
      handleConnectionChange(false)
    }
  }, [userId, handlePresenceUpdate, handlePresenceChange, handleConnectionChange, reconnectAttempts, onConnectionChange])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, 'Client disconnecting')
    }
    wsRef.current = null
    
    setIsConnected(false)
    setReconnectAttempts(0)
  }, [])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  // Send presence update
  const updatePresence = useCallback(() => {
    return sendMessage({ type: 'presence_update' })
  }, [sendMessage])

  // Request latest presence data
  const requestPresence = useCallback(() => {
    return sendMessage({ type: 'request_presence' })
  }, [sendMessage])

  // FIX 4: Cleanup on unmount
  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // FIX 5: Separate effect for reconnection logic
  useEffect(() => {
    if (!isConnected && reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts) {
      const timeout = setTimeout(() => {
        connect()
      }, reconnectDelay * Math.pow(2, reconnectAttempts - 1))
      
      return () => clearTimeout(timeout)
    }
  }, [reconnectAttempts, isConnected, connect])

  // Send periodic presence updates
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      updatePresence()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [isConnected, updatePresence])

  return {
    isConnected,
    reconnectAttempts,
    connect,
    disconnect,
    sendMessage,
    updatePresence,
    requestPresence
  }
}
