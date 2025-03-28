"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Clock } from 'lucide-react'

export default function MessagesPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hey, how was your day?",
      sender: "partner",
      timestamp: "Today, 9:30 AM",
      read: true,
    },
    {
      id: 2,
      content: "It was great! I had that meeting I was telling you about. It went really well.",
      sender: "user",
      timestamp: "Today, 9:35 AM",
      read: true,
    },
    {
      id: 3,
      content: "That's awesome! I'm so proud of you. Want to celebrate tonight?",
      sender: "partner",
      timestamp: "Today, 9:40 AM",
      read: true,
    },
    {
      id: 4,
      content: "Definitely! How about that new restaurant we've been wanting to try?",
      sender: "user",
      timestamp: "Today, 9:45 AM",
      read: true,
    },
    {
      id: 5,
      content: "Perfect! I'll make a reservation for 7pm. Love you! ❤️",
      sender: "partner",
      timestamp: "Today, 9:50 AM",
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

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
        <Button variant="outline" size="sm">
          <Clock className="mr-2 h-4 w-4" />
          Schedule Message
        </Button>
      </div>

      <Card className="flex flex-1 flex-col">
        <CardHeader className="border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Partner" />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">Jane Smith</CardTitle>
              <CardDescription>Online</CardDescription>
            </div>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1 p-4">
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
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
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
        <CardFooter className="border-t p-3">
          <div className="flex w-full items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
