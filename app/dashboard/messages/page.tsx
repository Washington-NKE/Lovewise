"use client"

import { useState, useEffect, useRef } from "react"
import EmojiPicker from 'emoji-picker-react'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { Grid } from '@giphy/react-components'
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Clock, Heart, Check, CheckCheck, AlertCircle, Calendar as CalendarIcon, MapPin, Users } from 'lucide-react'
import { useTheme } from "next-themes"
import { format } from "date-fns"

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  isRead: boolean
  createdAt: string
}

interface User {
  id: string
  name: string
  profileImage?: string
  lastActive?: string
  isOnline?: boolean
}

interface Relationship {
  id: string
  userId: string
  partnerId: string
  status: string
  user: User
  partner: User
}

interface DateProposal {
  id?: string
  title: string
  description: string
  proposedDate: Date
  proposedTime: string
  location: string
  type: string
  status: 'pending' | 'accepted' | 'declined'
  createdBy: string
  createdAt: string
}

const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'your-default-key')

export default function MessagesPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [partner, setPartner] = useState<User | null>(null)
  const [relationship, setRelationship] = useState<Relationship | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

     const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  const [dateProposal, setDateProposal] = useState<DateProposal>({
    title: '',
    description: '',
    proposedDate: new Date(),
    proposedTime: '',
    location: '',
    type: 'dinner',
    status: 'pending',
    createdBy: '',
    createdAt: ''
  })
    const [isDateCalendarOpen, setIsDateCalendarOpen] = useState(false)
  const [isSubmittingDate, setIsSubmittingDate] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [gifSearchTerm, setGifSearchTerm] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Theme handling
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize user and relationship
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Get current user from session/auth
        const userResponse = await fetch('/api/auth/me')
        if (!userResponse.ok) throw new Error('Failed to get current user')
        const userData = await userResponse.json()
        setCurrentUser(userData)

        // Get active relationship
        const relationshipResponse = await fetch('/api/relationships/active')
        if (!relationshipResponse.ok) throw new Error('No active relationship found')
        const relationshipData = await relationshipResponse.json()
        setRelationship(relationshipData)

        // Set partner based on relationship
        const partnerData = relationshipData.userId === userData.id 
          ? relationshipData.partner 
          : relationshipData.user
        setPartner(partnerData)

        // Load existing messages
        await loadMessages(relationshipData.id)
      } catch (error) {
        console.error('Error initializing user:', error)
        setError('Failed to initialize messaging. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    initializeUser()
  }, [])

  // Load messages from database
  const loadMessages = async (relationshipId?: string) => {
    try {
      const relId = relationshipId || relationship?.id
      if (!relId) return

      const response = await fetch(`/api/messages?relationshipId=${relId}`)
      if (!response.ok) throw new Error('Failed to load messages')
      const messagesData = await response.json()
      setMessages(messagesData)
    } catch (error) {
      console.error('Error loading messages:', error)
      setError('Failed to load messages')
    }
  }

  // WebSocket connection
  useEffect(() => {
    if (!currentUser?.id) return

    const connectWebSocket = () => {
      const wsUrl = `ws://localhost:3001?userId=${currentUser.id}`
      const websocket = new WebSocket(wsUrl)

      websocket.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setError(null)
        // Send presence update
        websocket.send(JSON.stringify({ type: 'presence_update' }))
      }

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleWebSocketMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      websocket.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000)
      }

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('Connection error. Reconnecting...')
      }

      setWs(websocket)
    }

    connectWebSocket()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (ws) {
        ws.close()
      }
    }
  }, [currentUser?.id])

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'new_message':
        setMessages(prev => [...prev, data.message])
        // Mark as read if it's from partner
        if (data.message.senderId !== currentUser?.id) {
          markMessageAsRead(data.message.id)
        }
        break
      
      case 'message_read':
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId ? { ...msg, isRead: true } : msg
        ))
        break
      
      case 'presence_change':
        if (data.userId === partner?.id) {
          setPartner(prev => prev ? { ...prev, isOnline: data.isOnline } : null)
        }
        break
      
      case 'presence_update':
        const partnerPresence = data.partners.find((p: any) => p.userId === partner?.id)
        if (partnerPresence) {
          setPartner(prev => prev ? { 
            ...prev, 
            isOnline: partnerPresence.isOnline,
            lastActive: partnerPresence.lastSeen
          } : null)
        }
        break
      
      case 'pong':
        // Handle ping response
        break
    }
  }

    // Add emoji to message
  const onEmojiClick = (emojiData: any) => {
    setNewMessage(prev => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  // Add GIF to message
  const onGifClick = (gif: any, e: React.SyntheticEvent) => {
    e.preventDefault()
    const gifUrl = gif.images.fixed_height.url
    setNewMessage(prev => prev + ` [GIF:${gifUrl}] `)
    setShowGifPicker(false)
  }

  // Send message
  const handleSendMessage = async () => {
 if (!newMessage.trim() || !currentUser || !partner || !relationship) return

  try {
    // Parse message for GIFs
    const gifRegex = /\[GIF:(.*?)\]/g
    const gifMatches = [...newMessage.matchAll(gifRegex)]
    const gifUrls = gifMatches.map(match => match[1])

    const attachments = gifUrls.length > 0 ? {
      gifs: gifUrls.map(url => ({ url }))
    } : undefined

    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: newMessage,
        senderId: currentUser.id,
        receiverId: partner.id,
        relationshipId: relationship.id,
        attachments
      }),
    })


      if (!response.ok) throw new Error('Failed to send message')
      
      const messageData = await response.json()
      
      // Add message to local state
      setMessages(prev => [...prev, messageData])
      setNewMessage("")
      
      // Send via WebSocket for real-time delivery
      if (ws && isConnected) {
        ws.send(JSON.stringify({
          type: 'send_message',
          message: messageData,
          receiverId: partner.id
        }))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message. Please try again.')
    }
  }

  // Mark message as read
  const markMessageAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PATCH',
      })

      if (!response.ok) throw new Error('Failed to mark message as read')
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ))

      // Notify sender via WebSocket
      if (ws && isConnected) {
        ws.send(JSON.stringify({
          type: 'message_read',
          messageId,
          senderId: messages.find(m => m.id === messageId)?.senderId
        }))
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  // Handle date scheduling
  const handleScheduleDate = async () => {
    if (!currentUser || !partner || !relationship) return
    
    setIsSubmittingDate(true)
    
    try {
      const newDateProposal: DateProposal = {
        ...dateProposal,
        id: `date_${Date.now()}`,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString()
      }

      // Create a special message for the date proposal
      const dateMessage: Message = {
        id: `msg_${Date.now()}`,
        content: `📅 Date Proposal: ${newDateProposal.title}\n📍 ${newDateProposal.location}\n📅 ${format(newDateProposal.proposedDate, 'PPP')} at ${newDateProposal.proposedTime}\n\n${newDateProposal.description}`,
        senderId: currentUser.id,
        receiverId: partner.id,
        isRead: false,
        createdAt: new Date().toISOString()
      }

      setMessages(prev => [...prev, dateMessage])
      
      // Reset form and close modal
      setDateProposal({
        title: '',
        description: '',
        proposedDate: new Date(),
        proposedTime: '',
        location: '',
        type: 'dinner',
        status: 'pending',
        createdBy: '',
        createdAt: ''
      })
      setIsDateModalOpen(false)
    } catch (error) {
      console.error('Error scheduling date:', error)
      setError('Failed to schedule date. Please try again.')
    } finally {
      setIsSubmittingDate(false)
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  // Get message status icon
  const getMessageStatusIcon = (message: Message) => {
    if (message.senderId !== currentUser?.id) return null
    
    if (message.isRead) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />
    }
    return <Check className="h-3 w-3 text-gray-400" />
  }

    // Generate time options
  const timeOptions = []
  for (let i = 9; i <= 23; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hour = i.toString().padStart(2, '0')
      const minute = j.toString().padStart(2, '0')
      timeOptions.push(`${hour}:${minute}`)
    }
  }

  if (!mounted) return null

  const isDark = theme === "dark"
  
  const themeStyles = {
    background: isDark ? "bg-zinc-900" : "bg-rose-50",
    card: isDark ? "bg-zinc-800 border-purple-800" : "bg-white border-pink-200",
    userMessage: isDark ? "bg-purple-700 text-purple-50" : "bg-pink-500 text-pink-50",
    partnerMessage: isDark ? "bg-gray-700 text-zinc-100" : "bg-pink-100 text-pink-900",
    input: isDark ? "bg-zinc-700 border-purple-600 text-purple-50" : "bg-white border-pink-300 text-pink-900",
    button: isDark ? "bg-purple-600 hover:bg-purple-700" : "bg-pink-500 hover:bg-pink-600",
    header: isDark ? "border-purple-800 bg-zinc-800" : "border-pink-200 bg-white",
    footer: isDark ? "border-purple-800 bg-zinc-800" : "border-pink-200 bg-white",
    title: isDark ? "text-purple-50" : "text-pink-900",
    desc: isDark ? "text-purple-200" : "text-pink-700"
  }

  if (isLoading) {
    return (
      <div className={`flex h-[calc(100vh-8rem)] items-center justify-center ${themeStyles.background}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className={themeStyles.title}>Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
 <div className={`flex h-[calc(100vh-8rem)] flex-col ${themeStyles.background}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className={`text-2xl font-bold tracking-tight ${themeStyles.title}`}>
            Private Messages
          </h2>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm ${themeStyles.desc}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <Dialog open={isDateModalOpen} onOpenChange={setIsDateModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className={`border-pink-400 ${isDark ? 'border-purple-500' : ''}`}>
              <Clock className={`mr-2 h-4 w-4 ${isDark ? 'text-purple-300' : 'text-pink-500'}`} />
              Schedule Date
            </Button>
          </DialogTrigger>
          <DialogContent className={`sm:max-w-[500px] ${isDark ? 'bg-zinc-800 border-purple-800' : 'bg-white border-pink-200'}`}>
            <DialogHeader>
              <DialogTitle className={`flex items-center gap-2 ${themeStyles.title}`}>
                <Heart className="h-5 w-5 text-pink-500" />
                Plan a Date with {partner?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className={`text-right ${themeStyles.title}`}>
                  Title
                </Label>
                <Input
                  id="title"
                  value={dateProposal.title}
                  onChange={(e) => setDateProposal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Romantic dinner"
                  className={`col-span-3 ${themeStyles.input}`}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className={`text-right ${themeStyles.title}`}>
                  Type
                </Label>
                <Select value={dateProposal.type} onValueChange={(value) => setDateProposal(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className={`col-span-3 ${themeStyles.input}`}>
                    <SelectValue placeholder="Select date type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinner">🍽️ Dinner</SelectItem>
                    <SelectItem value="movie">🎬 Movie</SelectItem>
                    <SelectItem value="coffee">☕ Coffee</SelectItem>
                    <SelectItem value="activity">🎯 Activity</SelectItem>
                    <SelectItem value="adventure">🏃 Adventure</SelectItem>
                    <SelectItem value="romantic">💕 Romantic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className={`text-right ${themeStyles.title}`}>
                  Date
                </Label>
                <Popover open={isDateCalendarOpen} onOpenChange={setIsDateCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`col-span-3 justify-start text-left font-normal ${themeStyles.input}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateProposal.proposedDate ? format(dateProposal.proposedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateProposal.proposedDate}
                      onSelect={(date) => {
                        if (date) {
                          setDateProposal(prev => ({ ...prev, proposedDate: date }))
                          setIsDateCalendarOpen(false)
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className={`text-right ${themeStyles.title}`}>
                  Time
                </Label>
                <Select value={dateProposal.proposedTime} onValueChange={(value) => setDateProposal(prev => ({ ...prev, proposedTime: value }))}>
                  <SelectTrigger className={`col-span-3 ${themeStyles.input}`}>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className={`text-right ${themeStyles.title}`}>
                  Location
                </Label>
                <Input
                  id="location"
                  value={dateProposal.location}
                  onChange={(e) => setDateProposal(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Downtown restaurant"
                  className={`col-span-3 ${themeStyles.input}`}
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className={`text-right ${themeStyles.title}`}>
                  Details
                </Label>
                <Textarea
                  id="description"
                  value={dateProposal.description}
                  onChange={(e) => setDateProposal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What makes this date special?"
                  className={`col-span-3 ${themeStyles.input}`}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDateModalOpen(false)}
                className={`${isDark ? 'border-purple-500' : 'border-pink-300'}`}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleScheduleDate}
                disabled={!dateProposal.title || !dateProposal.location || !dateProposal.proposedTime || isSubmittingDate}
                className={themeStyles.button}
              >
                {isSubmittingDate ? 'Sending...' : 'Send Proposal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <Card className={`flex flex-1 flex-col border ${themeStyles.card}`}>
        <CardHeader className={`border-b px-4 py-3 ${themeStyles.header}`}>
          <div className="flex items-center gap-3">
            <Avatar className={isDark ? "border-2 border-purple-400" : "border-2 border-pink-300"}>
              <AvatarImage src={partner?.profileImage || "/placeholder.svg?height=40&width=40"} alt={partner?.name} />
              <AvatarFallback className={isDark ? "bg-purple-700 text-purple-50" : "bg-pink-300 text-pink-800"}>
                {partner?.name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className={`text-base ${themeStyles.title}`}>
                {partner?.name || 'Partner'}
              </CardTitle>
              <CardDescription className={`flex items-center gap-1 ${themeStyles.desc}`}>
                <span className={isDark ? "text-purple-300" : "text-pink-600"}>
                  {partner?.isOnline ? 'Online' : `Last seen ${formatTime(partner?.lastActive || '')}`}
                </span>
                <Heart className={`h-3 w-3 ${isDark ? "text-purple-400" : "text-pink-500"} fill-current`} />
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <ScrollArea className={`flex-1 p-4 ${themeStyles.background}`}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === currentUser?.id ? "justify-end" : "justify-start"
                }`}
              >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.senderId === currentUser?.id
                    ? themeStyles.userMessage
                    : themeStyles.partnerMessage
                }`}
              >
                <p className="text-sm whitespace-pre-line">
                  <MessageContent content={message.content} />
                </p>
                <div className="mt-1 flex items-center justify-between text-xs opacity-70">
                  <span>{formatTime(message.createdAt)}</span>
                  {getMessageStatusIcon(message)}
                </div>
              </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
          <CardFooter className={`border-t p-3 ${themeStyles.footer}`}>
                <div className="flex w-full items-center gap-2 relative">
                  <div className="flex gap-1">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker)
                        setShowGifPicker(false)
                      }}
                      className="h-9 w-9"
                    >
                      <span role="img" aria-label="Emoji">😊</span>
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setShowGifPicker(!showGifPicker)
                        setShowEmojiPicker(false)
                      }}
                      className="h-9 w-9"
                    >
                      <span className="font-bold">GIF</span>
                    </Button>
                  </div>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 z-10">
                      <EmojiPicker 
                        onEmojiClick={onEmojiClick} 
                        width={300}
                        height={350}
                        previewConfig={{ showPreview: false }}
                        theme={isDark ? 'dark' : 'light'}
                      />
                    </div>
                  )}

                  {/* GIF Picker */}
                  {showGifPicker && (
                    <div className="absolute bottom-12 left-0 z-10 w-[300px] bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-2">
                      <Input
                        placeholder="Search GIFs..."
                        value={gifSearchTerm}
                        onChange={(e) => setGifSearchTerm(e.target.value)}
                        className="mb-2"
                      />
                      <Grid
                        width={300}
                        columns={3}
                        gutter={6}
                        fetchGifs={(offset: number) => 
                          gifSearchTerm 
                            ? gf.search(gifSearchTerm, { offset, limit: 10 })
                            : gf.trending({ offset, limit: 10 })
                        }
                        key={gifSearchTerm}
                        onGifClick={onGifClick}
                        hideAttribution={true}
                      />
                    </div>
                  )}

                  <Input
                    placeholder="Say something loving..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`flex-1 ${themeStyles.input}`}
                    disabled={!isConnected}
                    onClick={() => {
                      setShowEmojiPicker(false)
                      setShowGifPicker(false)
                    }}
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSendMessage} 
                    className={themeStyles.button}
                    disabled={!newMessage.trim() || !isConnected}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
      </Card>
    </div>
  )
}

const MessageContent = ({ content }: { content: string }) => {
  // Parse GIFs
  const parts = content.split(/(\[GIF:.*?\])/g)
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('[GIF:')) {
          const url = part.replace('[GIF:', '').replace(']', '').trim()
          return (
            <div key={i} className="my-1">
              <img 
                src={url} 
                alt="GIF" 
                className="max-w-[200px] max-h-[150px] rounded-md object-cover"
              />
            </div>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}