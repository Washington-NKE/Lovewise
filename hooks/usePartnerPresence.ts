// hooks/usePartnerPresence.ts - Updated with WebSocket integration
import { useState, useEffect, useCallback } from 'react'
import { useWebSocketClient } from './useWebSocketClient'

interface PartnerPresenceData {
  userId: string
  name: string
  profileImage?: string
  isOnline: boolean
  lastSeen?: Date
}

interface PartnerPresenceReturn {
  isPartnerOnline: boolean
  partnerLastSeen?: Date
  partnerPresenceLoading: boolean
  partnerData?: PartnerPresenceData
  isWebSocketConnected: boolean
  reconnectAttempts: number
}

export const usePartnerPresence = (
  partnerId?: string,
  currentUserId?: string
): PartnerPresenceReturn => {
  const [isPartnerOnline, setIsPartnerOnline] = useState(false)
  const [partnerLastSeen, setPartnerLastSeen] = useState<Date>()
  const [partnerPresenceLoading, setPartnerPresenceLoading] = useState(true)
  const [partnerData, setPartnerData] = useState<PartnerPresenceData>()

  // WebSocket connection for real-time updates
  const {
    isConnected: isWebSocketConnected,
    reconnectAttempts,
    requestPresence
  } = useWebSocketClient({
    userId: currentUserId || '',
    onPresenceUpdate: (partners: PartnerPresenceData[]) => {
      // Find the specific partner we're tracking
      const partner = partners.find(p => p.userId === partnerId)
      if (partner) {
        setPartnerData(partner)
        setIsPartnerOnline(partner.isOnline)
        setPartnerLastSeen(partner.lastSeen)
        setPartnerPresenceLoading(false)
      }
    },
    onPresenceChange: (userId: string, isOnline: boolean) => {
      // Real-time presence change for our partner
      if (userId === partnerId) {
        setIsPartnerOnline(isOnline)
        setPartnerLastSeen(new Date())
        
        // Update partner data
        setPartnerData(prev => prev ? { ...prev, isOnline, lastSeen: new Date() } : undefined)
      }
    },
    onConnectionChange: (connected: boolean) => {
      // If WebSocket disconnects, we might want to fall back to HTTP polling
      if (!connected && partnerId) {
        fetchPartnerPresenceHTTP()
      }
    }
  })

  // Fallback HTTP method for when WebSocket is not available
  const fetchPartnerPresenceHTTP = useCallback(async () => {
    if (!partnerId) {
      setPartnerPresenceLoading(false)
      return
    }

    try {
      setPartnerPresenceLoading(true)
      const response = await fetch(`/api/presence/status?userId=${partnerId}`)
      
      if (response.ok) {
        const data = await response.json()
        setIsPartnerOnline(data.isOnline)
        setPartnerLastSeen(data.lastSeen ? new Date(data.lastSeen) : undefined)
        setPartnerData({
          userId: partnerId,
          name: data.name || 'Partner',
          profileImage: data.profileImage,
          isOnline: data.isOnline,
          lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined
        })
      }
    } catch (error) {
      console.error('Failed to fetch partner presence via HTTP:', error)
    } finally {
      setPartnerPresenceLoading(false)
    }
  }, [partnerId])

  // Initial setup and fallback polling
  useEffect(() => {
    if (!partnerId || !currentUserId) {
      setPartnerPresenceLoading(false)
      return
    }

    // If WebSocket is connected, request presence data
    if (isWebSocketConnected) {
      requestPresence()
    } else {
      // Fall back to HTTP polling
      fetchPartnerPresenceHTTP()
      
      // Set up polling interval as fallback
      const interval = setInterval(fetchPartnerPresenceHTTP, 60000) // Poll every minute
      
      return () => clearInterval(interval)
    }
  }, [partnerId, currentUserId, isWebSocketConnected, requestPresence, fetchPartnerPresenceHTTP])

  // If WebSocket reconnects, request fresh data
  useEffect(() => {
    if (isWebSocketConnected && partnerId) {
      requestPresence()
    }
  }, [isWebSocketConnected, partnerId, requestPresence])

  return {
    isPartnerOnline,
    partnerLastSeen,
    partnerPresenceLoading,
    partnerData,
    isWebSocketConnected,
    reconnectAttempts
  }
}