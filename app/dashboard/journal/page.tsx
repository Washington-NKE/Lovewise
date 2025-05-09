"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Heart, Calendar, Lock, Bookmark, Eye, EyeOff, Sparkles } from 'lucide-react'
import { motion } from "framer-motion"

export default function JournalPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  const entries = [
    {
      id: 1,
      title: "Our Weekend Trip",
      content: "We had an amazing time at the beach this weekend. The sunset was beautiful and we collected seashells together.",
      date: "March 10, 2025",
      isPrivate: false,
      bgColor: "bg-gradient-to-br from-rose-400 to-pink-500",
      emoji: "🌊",
    },
    {
      id: 2,
      title: "Thoughts on Our Future",
      content: "Today we talked about our future plans and dreams. It's exciting to think about building a life together.",
      date: "March 3, 2025",
      isPrivate: true,
      bgColor: "bg-gradient-to-br from-violet-400 to-indigo-500",
      emoji: "✨",
    },
    {
      id: 3,
      title: "Celebrating 2 Years",
      content: "Today marks two years since we first met. It's been an incredible journey filled with love and growth.",
      date: "February 25, 2025",
      isPrivate: false,
      bgColor: "bg-gradient-to-br from-amber-400 to-red-500",
      emoji: "💖",
    },
  ]

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
  const heartBeat = {
    initial: { scale: 1 },
    pulse: { scale: 1.15, transition: { duration: 0.3, yoyo: Infinity } }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <motion.div 
        className="flex items-center justify-between bg-gradient-to-r from-pink-500 via-red-500 to-purple-500 p-6 rounded-xl text-white shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-2">
          <motion.div 
            animate="pulse" 
            variants={heartBeat} 
            className="text-2xl"
          >
            <Heart className="h-8 w-8 fill-white" />
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight">Our Love Journal</h2>
        </div>
        <Button className="bg-white text-pink-600 hover:bg-pink-100 hover:text-pink-700 transition-all duration-300 shadow-md">
          <Plus className="mr-2 h-4 w-4" />
          New Memory
        </Button>
      </motion.div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 rounded-full p-1 bg-pink-100 dark:bg-gray-800">
          <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-pink-500 data-[state=active]:text-white transition-all duration-300">
            All Entries
          </TabsTrigger>
          <TabsTrigger value="shared" className="rounded-full data-[state=active]:bg-pink-500 data-[state=active]:text-white transition-all duration-300">
            <Heart className="h-4 w-4 mr-1" /> Shared
          </TabsTrigger>
          <TabsTrigger value="private" className="rounded-full data-[state=active]:bg-pink-500 data-[state=active]:text-white transition-all duration-300">
            <Lock className="h-4 w-4 mr-1" /> Private
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <motion.div 
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            {entries.map((entry) => (
              <JournalEntryCard 
                key={entry.id} 
                entry={entry} 
                isHovered={hoveredCard === entry.id}
                onHover={() => setHoveredCard(entry.id)}
                onLeave={() => setHoveredCard(null)}
              />
            ))}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="shared" className="mt-6">
          <motion.div 
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            {entries
              .filter((entry) => !entry.isPrivate)
              .map((entry) => (
                <JournalEntryCard 
                  key={entry.id} 
                  entry={entry} 
                  isHovered={hoveredCard === entry.id}
                  onHover={() => setHoveredCard(entry.id)}
                  onLeave={() => setHoveredCard(null)}
                />
              ))}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="private" className="mt-6">
          <motion.div 
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            {entries
              .filter((entry) => entry.isPrivate)
              .map((entry) => (
                <JournalEntryCard 
                  key={entry.id} 
                  entry={entry} 
                  isHovered={hoveredCard === entry.id}
                  onHover={() => setHoveredCard(entry.id)}
                  onLeave={() => setHoveredCard(null)}
                />
              ))}
          </motion.div>
        </TabsContent>
      </Tabs>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border-2 border-pink-200 dark:border-pink-800 shadow-lg">
          <div className="absolute right-0 top-0 h-16 w-16">
            <div className="absolute transform rotate-45 bg-pink-500 text-white font-semibold py-1 right-[-35px] top-[32px] w-[170px] text-center">
              New Memory
            </div>
          </div>
          <CardHeader className="pb-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white">
            <CardTitle className="text-xl flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Create New Journal Entry
            </CardTitle>
            <CardDescription className="text-pink-100">
              Capture your special moments together
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-pink-600 dark:text-pink-300 font-medium flex items-center">
                <Bookmark className="h-4 w-4 mr-1" /> Title
              </Label>
              <Input 
                id="title" 
                placeholder="Give your memory a title..." 
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500 transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-pink-600 dark:text-pink-300 font-medium flex items-center">
                <Heart className="h-4 w-4 mr-1" /> Your Memory
              </Label>
              <Textarea
                id="content"
                placeholder="Write about your special moment together..."
                className="min-h-[200px] border-pink-200 focus:border-pink-500 focus:ring-pink-500 transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-pink-600 dark:text-pink-300 font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1" /> Category
              </Label>
              <Select>
                <SelectTrigger id="category" className="border-pink-200 focus:border-pink-500 focus:ring-pink-500">
                  <SelectValue placeholder="What type of memory is this?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="romance">Romantic Moment</SelectItem>
                  <SelectItem value="date">Special Date</SelectItem>
                  <SelectItem value="milestone">Relationship Milestone</SelectItem>
                  <SelectItem value="intimate">Intimate Moment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-pink-50 dark:bg-gray-800">
              <Switch id="private" className="data-[state=checked]:bg-purple-500" />
              <Label htmlFor="private" className="flex items-center cursor-pointer">
                <Lock className="h-4 w-4 mr-1 text-purple-500" />
                <span className="text-purple-700 dark:text-purple-300 font-medium">Make this entry private</span>
              </Label>
            </div>
          </CardContent>
          <CardFooter className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-4">
            <Button className="ml-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-md transition-all duration-300">
              Save This Memory
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  date: string;
  isPrivate: boolean;
  bgColor: string;
  emoji: string;
}

function JournalEntryCard({ entry, isHovered, onHover, onLeave }: { 
  entry: JournalEntry;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <Card className={`overflow-hidden transition-all duration-300 ${isHovered ? 'shadow-xl scale-102' : 'shadow-md'} border-0`}>
        <div className={`h-2 ${entry.bgColor}`}></div>
        <CardHeader className={`pb-2 relative ${isHovered ? 'pt-8' : 'pt-6'} transition-all duration-300`}>
          <div className="absolute -top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-md text-lg">
            {entry.emoji}
          </div>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-pink-700 dark:text-pink-300">{entry.title}</CardTitle>
            {entry.isPrivate ? (
              <div className="rounded-full bg-purple-100 dark:bg-purple-900 px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-300 flex items-center">
                <EyeOff className="h-3 w-3 mr-1" /> Private
              </div>
            ) : (
              <div className="rounded-full bg-pink-100 dark:bg-pink-900 px-2 py-1 text-xs font-medium text-pink-600 dark:text-pink-300 flex items-center">
                <Eye className="h-3 w-3 mr-1" /> Shared
              </div>
            )}
          </div>
          <CardDescription className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" /> {entry.date}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-4 text-sm text-muted-foreground">
            {entry.content}
          </p>
        </CardContent>
        <CardFooter className={`${entry.bgColor} bg-opacity-10 dark:bg-opacity-20`}>
          <Button 
            variant="outline" 
            size="sm" 
            className={`w-full border-0 bg-white dark:bg-gray-800 hover:bg-opacity-90 shadow-sm transition-all duration-300 ${
              entry.isPrivate ? 'text-purple-600 hover:text-purple-700' : 'text-pink-600 hover:text-pink-700'
            }`}
          >
            {isHovered ? "Relive This Moment" : "Read More"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}