"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Clock, Heart } from 'lucide-react'
import { useTheme } from "next-themes"

export default function MessagesPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Theme handling
  useEffect(() => {
    setMounted(true)
  }, [])

  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hey, I've been thinking about you all day...",
      sender: "partner",
      timestamp: "Today, 9:30 PM",
      read: true,
    },
    {
      id: 2,
      content: "I can't wait to see you tonight. I have something special planned.",
      sender: "user",
      timestamp: "Today, 9:35 PM",
      read: true,
    },
    {
      id: 3,
      content: "Oh? Now I'm intrigued. Give me a hint...",
      sender: "partner",
      timestamp: "Today, 9:40 PM",
      read: true,
    },
    {
      id: 4,
      content: "Let's just say it involves that thing you mentioned last week... 😉",
      sender: "user",
      timestamp: "Today, 9:45 PM",
      read: true,
    },
    {
      id: 5,
      content: "You always know exactly what I want. Can't wait to see you soon! ❤️",
      sender: "partner",
      timestamp: "Today, 9:50 PM",
      read: false,
    },
  ])

  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return

    const message = {
      id: messages.length + 1,
      content: newMessage,
      sender: "user",
      timestamp: "Just now",
      read: true,
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Don't render with SSR to avoid hydration mismatch
  if (!mounted) return null

  // Custom theme styles based on dark/light mode
  const isDark = theme === "dark"
  
  const themeStyles = {
    background: isDark ? "bg-zinc-900" : "bg-rose-50",
    card: isDark ? "bg-zinc-800 border-purple-800" : "bg-white border-pink-200",
    userMessage: isDark ? "bg-purple-700 text-purple-50" : "bg-pink-500 text-pink-50",
    partnerMessage: isDark ? "bg-gray-950 text-zinc-100" : "bg-pink-100 text-pink-900",
    input: isDark ? "bg-zinc-700 border-purple-600 text-purple-50" : "bg-white border-pink-300 text-pink-900",
    button: isDark ? "bg-purple-600 hover:bg-purple-700" : "bg-pink-500 hover:bg-pink-600",
    header: isDark ? "border-purple-800 bg-zinc-800" : "border-pink-200 bg-white",
    footer: isDark ? "border-purple-800 bg-zinc-800" : "border-pink-200 bg-white",
    title: isDark ? "text-purple-50" : "text-pink-900",
    desc: isDark ? "text-purple-200" : "text-pink-700"
  }

  return (
    <div className={`flex h-[calc(100vh-8rem)] flex-col ${themeStyles.background}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={`text-2xl font-bold tracking-tight ${themeStyles.title}`}>Private Messages</h2>
        <Button variant="outline" size="sm" className={`border-pink-400 ${isDark ? 'border-purple-500' : ''}`}>
          <Clock className={`mr-2 h-4 w-4 ${isDark ? 'text-purple-300' : 'text-pink-500'}`} />
          Schedule Date
        </Button>
      </div>

      <Card className={`flex flex-1 flex-col border ${themeStyles.card}`}>
        <CardHeader className={`border-b px-4 py-3 ${themeStyles.header}`}>
          <div className="flex items-center gap-3">
            <Avatar className={isDark ? "border-2 border-purple-400" : "border-2 border-pink-300"}>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Partner" />
              <AvatarFallback className={isDark ? "bg-purple-700 text-purple-50" : "bg-pink-300 text-pink-800"}>JS</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className={`text-base ${themeStyles.title}`}>Jane Smith</CardTitle>
              <CardDescription className={`flex items-center gap-1 ${themeStyles.desc}`}>
                <span className={isDark ? "text-purple-300" : "text-pink-600"}>Online</span>
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
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? themeStyles.userMessage
                      : themeStyles.partnerMessage
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="mt-1 text-right text-xs opacity-70">
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <CardFooter className={`border-t p-3 ${themeStyles.footer}`}>
          <div className="flex w-full items-center gap-2">
            <Input
              placeholder="Say something tempting..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 ${themeStyles.input}`}
            />
            <Button 
              size="icon" 
              onClick={handleSendMessage} 
              className={themeStyles.button}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}