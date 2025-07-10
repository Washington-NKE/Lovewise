// hooks/useOnlineStatus.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

interface OnlineStatusReturn {
  isOnline: boolean
  lastSeen?: Date
  updatePresence: () => void
  isConnected: boolean
}

interface PresenceData {
  userId: string
  name: string
  profileImage?: string
  isOnline: boolean
  lastSeen?: Date
}

export const useOnlineStatus = (userId?: string): OnlineStatusReturn => {
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<Date>()
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  // Update user's online presence
  const updatePresence = useCallback(async () => {
    if (!userId) return

    try {
      const response = await fetch('/api/presence/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, timestamp: new Date().toISOString() })
      })

      if (!response.ok) {
        throw new Error('Failed to update presence')
      }
    } catch (error) {
      console.error('Failed to update presence:', error)
    }
  }, [userId])

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (!userId || wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
      const websocket = new WebSocket(`${wsUrl}?userId=${userId}`)
      wsRef.current = websocket

      websocket.onopen = () => {
        console.log('Connected to presence WebSocket')
        setIsConnected(true)
        reconnectAttempts.current = 0
        
        // Request initial presence data
        websocket.send(JSON.stringify({ type: 'request_presence' }))
      }

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'presence_update':
              // Handle partner presence updates
              if (data.partners && Array.isArray(data.partners)) {
                data.partners.forEach((partner: PresenceData) => {
                  if (partner.userId !== userId) {
                    // This is for partner status - you might want to handle this differently
                    // For now, we'll just log it
                    console.log('Partner presence update:', partner)
                  }
                })
              }
              break
              
            case 'presence_change':
              // Handle real-time presence changes
              if (data.userId && data.userId !== userId) {
                const partnerName = data.partnerName || 'Your partner'
                
                if (data.isOnline) {
                  toast.success(`${partnerName} is now online`, {
                    description: "Your partner just came online",
                    duration: 3000,
                  })
                } else {
                  toast.info(`${partnerName} went offline`, {
                    description: data.lastSeen ? `Last seen ${formatLastSeen(new Date(data.lastSeen))}` : 'Just went offline',
                    duration: 3000,
                  })
                }
              }
              break
              
            case 'ping':
              // Respond to ping
              websocket.send(JSON.stringify({ type: 'pong' }))
              break
              
            case 'pong':
              // Handle pong response
              break
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      websocket.onclose = () => {
        console.log('Disconnected from presence WebSocket')
        setIsConnected(false)
        wsRef.current = null
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          reconnectAttempts.current++
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`)
            connectWebSocket()
          }, delay)
        } else {
          toast.error('Connection lost', {
            description: 'Unable to maintain real-time connection. Please refresh the page.',
            duration: 5000,
          })
        }
      }

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      setIsConnected(false)
    }
  }, [userId])

  // Fetch initial presence status
  const fetchPresenceStatus = useCallback(async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/presence/status?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setIsOnline(data.isOnline)
        setLastSeen(data.lastSeen ? new Date(data.lastSeen) : undefined)
      }
    } catch (error) {
      console.error('Failed to fetch presence status:', error)
    }
  }, [userId])

  // Set up WebSocket connection and presence tracking
  useEffect(() => {
    if (!userId) return

    // Fetch initial status
    fetchPresenceStatus()
    
    // Connect to WebSocket
    connectWebSocket()

    // Set up presence update interval
    presenceIntervalRef.current = setInterval(updatePresence, 30000)

    // Initial presence update
    updatePresence()

    return () => {
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current)
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [userId, connectWebSocket, updatePresence, fetchPresenceStatus])

  // Handle visibility change and page unload
  useEffect(() => {
    if (!userId) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence()
        // Reconnect WebSocket if needed
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          connectWebSocket()
        }
      }
    }

    const handleBeforeUnload = () => {
      // Mark user as offline when leaving
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/presence/offline', JSON.stringify({ userId }))
      }
    }

    const handleFocus = () => {
      updatePresence()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('focus', handleFocus)
    }
  }, [userId, updatePresence, connectWebSocket])

  return { isOnline, lastSeen, updatePresence, isConnected }
}

// Helper function to format last seen time
const formatLastSeen = (lastSeen: Date): string => {
  const now = new Date()
  const diff = now.getTime() - lastSeen.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} minutes ago`
  if (hours < 24) return `${hours} hours ago`
  if (days < 7) return `${days} days ago`
  return lastSeen.toLocaleDateString()
}
