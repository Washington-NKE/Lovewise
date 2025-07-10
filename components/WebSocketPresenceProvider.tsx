// components/providers/WebSocketPresenceProvider.tsx 
'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { useWebSocketClient } from '@/hooks/useWebSocketClient'

interface PresenceData {
  userId: string
  name: string
  profileImage?: string
  isOnline: boolean
  lastSeen?: Date
}

interface WebSocketPresenceContextType {
  isConnected: boolean
  reconnectAttempts: number
  partners: PresenceData[]
  updatePresence: () => void
  requestPresence: () => void
  getPartnerPresence: (partnerId: string) => PresenceData | undefined
}

const WebSocketPresenceContext = createContext<WebSocketPresenceContextType | null>(null)

interface WebSocketPresenceProviderProps {
  children: React.ReactNode
  userId: string
}

interface WebSocketPresenceProviderProps {
  children: React.ReactNode
  userId: string
}

export const WebSocketPresenceProvider: React.FC<WebSocketPresenceProviderProps> = ({
  children,
  userId
}) => {
  const [partners, setPartners] = useState<PresenceData[]>([])

  // FIX 6: Memoize callbacks to prevent unnecessary re-renders
  const handlePresenceUpdate = useMemo(() => (partnersList: PresenceData[]) => {
    setPartners(partnersList)
  }, [])

  const handlePresenceChange = useMemo(() => (changedUserId: string, isOnline: boolean) => {
    setPartners(prev =>
      prev.map(partner =>
        partner.userId === changedUserId
          ? { 
              ...partner, 
              isOnline, 
              // FIX 7: Only update lastSeen when going offline
              lastSeen: isOnline ? partner.lastSeen : new Date() 
            }
          : partner
      )
    )
  }, [])

  const handleConnectionChange = useMemo(() => (connected: boolean) => {
    console.log('WebSocket connection changed:', connected)
  }, [])

  const {
    isConnected,
    reconnectAttempts,
    updatePresence,
    requestPresence
  } = useWebSocketClient({
    userId,
    onPresenceUpdate: handlePresenceUpdate,
    onPresenceChange: handlePresenceChange,
    onConnectionChange: handleConnectionChange
  })

  const getPartnerPresence = useMemo(() => (partnerId: string): PresenceData | undefined => {
    return partners.find(partner => partner.userId === partnerId)
  }, [partners])

  // FIX 8: Improved activity detection with better throttling
  useEffect(() => {
    if (!isConnected) return

    let lastUpdate = 0
    let isUserActive = true
    let activityTimeout: NodeJS.Timeout | null = null

    const handleUserActivity = () => {
      const now = Date.now()
      
      // Reset activity timeout
      if (activityTimeout) {
        clearTimeout(activityTimeout)
      }
      
      // Set user as inactive after 5 minutes of no activity
      activityTimeout = setTimeout(() => {
        isUserActive = false
      }, 5 * 60 * 1000)

      // Update presence if enough time has passed and user is active
      if (now - lastUpdate > 30000 && isUserActive) {
        lastUpdate = now
        updatePresence()
      }
    }

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'focus']
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true })
    })

    // Initial activity
    handleUserActivity()

    return () => {
      if (activityTimeout) {
        clearTimeout(activityTimeout)
      }
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity)
      })
    }
  }, [isConnected, updatePresence])

  // FIX 9: Memoize context value to prevent unnecessary re-renders
  const value = useMemo<WebSocketPresenceContextType>(() => ({
    isConnected,
    reconnectAttempts,
    partners,
    updatePresence,
    requestPresence,
    getPartnerPresence
  }), [isConnected, reconnectAttempts, partners, updatePresence, requestPresence, getPartnerPresence])

  return (
    <WebSocketPresenceContext.Provider value={value}>
      {children}
    </WebSocketPresenceContext.Provider>
  )
}

export const useWebSocketPresence = () => {
  const context = useContext(WebSocketPresenceContext)
  if (!context) {
    throw new Error('useWebSocketPresence must be used within a WebSocketPresenceProvider')
  }
  return context
}

// FIX 10: Improved hook with better error handling
export const usePartnerPresenceSimple = (partnerId?: string) => {
  const { partners, isConnected, getPartnerPresence } = useWebSocketPresence()
  
  const partner = useMemo(() => {
    return partnerId ? getPartnerPresence(partnerId) : undefined
  }, [partnerId, getPartnerPresence])

  return useMemo(() => ({
    isPartnerOnline: partner?.isOnline || false,
    partnerLastSeen: partner?.lastSeen,
    partnerData: partner,
    isWebSocketConnected: isConnected,
    partnerPresenceLoading: false
  }), [partner, isConnected])
}