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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {  Heart, Plus, Camera, Star, Bookmark, Clock, Film, Image, Sparkles } from 'lucide-react'
import { motion } from "framer-motion"

export default function MemoriesPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isFileDragging, setIsFileDragging] = useState(false);
  
  const memories = [
    {
      id: 1,
      title: "Beach Day",
      description: "Our day at the beach last summer. The waves, the sunset, and your smile made it perfect.",
      date: "July 15, 2024",
      imageUrl: "/placeholder.svg?height=300&width=400&text=Beach+Day",
      album: "Vacations",
      isFavorite: true,
      gradient: "from-blue-400 to-teal-400",
    },
    {
      id: 2,
      title: "Dinner Date",
      description: "Anniversary dinner at our favorite restaurant. Candlelight, wine, and your eyes across the table.",
      date: "February 14, 2025",
      imageUrl: "/placeholder.svg?height=300&width=400&text=Dinner+Date",
      album: "Special Occasions",
      isFavorite: true,
      gradient: "from-pink-400 to-purple-500",
    },
    {
      id: 3,
      title: "Hiking Trip",
      description: "Beautiful views from our weekend hike. Reaching the summit together felt symbolic of our journey.",
      date: "January 20, 2025",
      imageUrl: "/placeholder.svg?height=300&width=400&text=Hiking+Trip",
      album: "Adventures",
      isFavorite: false,
      gradient: "from-green-400 to-emerald-500",
    },
    {
      id: 4,
      title: "Movie Night",
      description: "Cozy night watching our favorite films. Your laughter during the funny scenes is my favorite sound.",
      date: "March 5, 2025",
      imageUrl: "/placeholder.svg?height=300&width=400&text=Movie+Night",
      album: "Everyday Moments",
      isFavorite: false,
      gradient: "from-indigo-400 to-blue-500",
    },
    {
      id: 5,
      title: "Concert",
      description: "Amazing live music experience together. Dancing with you in the crowd, feeling the bass and your heartbeat.",
      date: "December 10, 2024",
      imageUrl: "/placeholder.svg?height=300&width=400&text=Concert",
      album: "Entertainment",
      isFavorite: true,
      gradient: "from-purple-400 to-indigo-500",
    },
    {
      id: 6,
      title: "Cooking Together",
      description: "Making our favorite pasta recipe. Flour on your nose, wine in our glasses, and love in the air.",
      date: "March 1, 2025",
      imageUrl: "/placeholder.svg?height=300&width=400&text=Cooking",
      album: "Everyday Moments",
      isFavorite: false,
      gradient: "from-amber-400 to-orange-500",
    },
  ]

  const albums = [...new Set(memories.map(memory => memory.album))]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // const cardVariants = {
  //   hidden: { y: 20, opacity: 0 },
  //   show: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  // };

  const heartBeat = {
    rest: { scale: 1 },
    hover: { scale: 1.2, transition: { duration: 0.3, repeat: Infinity, repeatType: "reverse" as const } }
  };

  const dropzoneVariants = {
    default: { 
      borderColor: "rgba(236, 72, 153, 0.3)",
      backgroundColor: "rgba(236, 72, 153, 0.05)"
    },
    dragging: { 
      borderColor: "rgba(236, 72, 153, 1)",
      backgroundColor: "rgba(236, 72, 153, 0.1)",
      scale: 1.02
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4">
      <motion.div 
        className="flex items-center justify-between bg-gradient-to-r from-pink-500 via-red-500 to-purple-500 p-6 rounded-xl text-white shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial="rest"
            whileHover="hover"
            animate="rest"
            variants={heartBeat}
          >
            <Camera className="h-8 w-8" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Our Intimate Moments</h2>
            <p className="text-pink-100 mt-1">Capturing our journey of passion and love</p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-white text-pink-600 hover:bg-pink-100 hover:text-pink-700 transition-all duration-300 shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              Capture Moment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] border-pink-200 dark:border-pink-800 bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800">
            <DialogHeader>
              <DialogTitle className="text-xl text-pink-600 dark:text-pink-300 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Capture a New Intimate Moment
              </DialogTitle>
              <DialogDescription className="text-pink-500 dark:text-pink-400">
                Save this special memory together forever
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-pink-600 dark:text-pink-300 font-medium">Title Your Moment</Label>
                <Input id="title" placeholder="What would you call this memory?" className="border-pink-200 focus:border-pink-500 focus:ring-pink-500" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-pink-600 dark:text-pink-300 font-medium">Describe Your Feelings</Label>
                <Textarea id="description" placeholder="How did this moment make you feel?" className="border-pink-200 focus:border-pink-500 focus:ring-pink-500 min-h-24" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="album" className="text-pink-600 dark:text-pink-300 font-medium">Choose a Collection</Label>
                <Select>
                  <SelectTrigger id="album" className="border-pink-200 focus:border-pink-500 focus:ring-pink-500">
                    <SelectValue placeholder="Where does this memory belong?" />
                  </SelectTrigger>
                  <SelectContent>
                    {albums.map(album => (
                      <SelectItem key={album} value={album}>{album}</SelectItem>
                    ))}
                    <SelectItem value="new" className="text-pink-600">+ Create New Collection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file" className="text-pink-600 dark:text-pink-300 font-medium">Upload Your Memory</Label>
                <motion.div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
                  variants={dropzoneVariants}
                  animate={isFileDragging ? "dragging" : "default"}
                  onDragEnter={() => setIsFileDragging(true)}
                  onDragLeave={() => setIsFileDragging(false)}
                  onDrop={() => setIsFileDragging(false)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-pink-100 dark:bg-pink-900">
                      <Image className="h-6 w-6 text-pink-500" />
                    </div>
                    <p className="text-sm text-pink-600 dark:text-pink-300 font-medium">Drag photos or videos here</p>
                    <p className="text-xs text-pink-400 dark:text-pink-500">or click to browse</p>
                    <Input id="file" type="file" className="hidden" />
                  </div>
                </motion.div>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-pink-50 dark:bg-gray-800">
                <input type="checkbox" id="favorite" className="rounded text-pink-500 border-pink-300 focus:ring-pink-500" />
                <Label htmlFor="favorite" className="flex items-center cursor-pointer">
                  <Star className="h-4 w-4 mr-1 text-pink-500" />
                  <span className="text-pink-700 dark:text-pink-300 font-medium">Mark as favorite moment</span>
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300">
                Save This Moment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="flex flex-wrap gap-1 p-1 bg-pink-50 dark:bg-gray-800 rounded-lg mb-6">
          <TabsTrigger 
            value="all" 
            className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
          >
            All Memories
          </TabsTrigger>
          <TabsTrigger 
            value="favorites" 
            className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
          >
            <Star className="h-4 w-4 mr-1" /> Favorites
          </TabsTrigger>
          {albums.map(album => (
            <TabsTrigger 
              key={album} 
              value={album}
              className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
            >
              {album}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all">
          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {memories.map((memory) => (
              <MemoryCard 
                key={memory.id} 
                memory={memory} 
                isHovered={hoveredCard === memory.id}
                onHover={() => setHoveredCard(memory.id)}
                onLeave={() => setHoveredCard(null)}
              />
            ))}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="favorites">
          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {memories
              .filter(memory => memory.isFavorite)
              .map((memory) => (
                <MemoryCard 
                  key={memory.id} 
                  memory={memory} 
                  isHovered={hoveredCard === memory.id}
                  onHover={() => setHoveredCard(memory.id)}
                  onLeave={() => setHoveredCard(null)}
                />
              ))}
          </motion.div>
        </TabsContent>

        {albums.map(album => (
          <TabsContent key={album} value={album}>
            <motion.div 
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {memories
                .filter(memory => memory.album === album)
                .map((memory) => (
                  <MemoryCard 
                    key={memory.id} 
                    memory={memory}
                    isHovered={hoveredCard === memory.id}
                    onHover={() => setHoveredCard(memory.id)}
                    onLeave={() => setHoveredCard(null)}
                  />
                ))}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

interface Memory {
  id: number;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  album: string;
  isFavorite: boolean;
  gradient: string;
}

function MemoryCard({ memory, isHovered, onHover, onLeave }: { 
  memory: Memory;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  const isFavoriteBtnVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.2 }
  };

  const imageOverlayVariants = {
    hidden: { opacity: 0 },
    hover: { opacity: 1 }
  };
  
  // Determine glow color based on gradient
  const getGlowColor = (gradient: string) => {
    if (gradient.includes('pink')) return 'pink-400';
    if (gradient.includes('blue')) return 'blue-400';
    if (gradient.includes('green')) return 'green-400';
    if (gradient.includes('purple')) return 'purple-400';
    if (gradient.includes('amber')) return 'amber-400';
    if (gradient.includes('indigo')) return 'indigo-400';
    if (gradient.includes('teal')) return 'teal-400';
    return 'pink-400'; // default
  };
  
  const glowColor = getGlowColor(memory.gradient);
  
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <Card className={`overflow-hidden relative bg-white dark:bg-gray-800 border-0 transition-all duration-300`}>
        {/* Animated glow effect */}
        <motion.div 
          className={`absolute -inset-0.5 bg-${glowColor} opacity-75 rounded-xl blur-sm z-0`}
          animate={{
            opacity: isHovered ? [0.5, 0.8, 0.5] : 0.15,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Card content with raised z-index */}
        <div className="relative z-10 bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <div className={`h-1 bg-gradient-to-r ${memory.gradient}`}></div>
          <div className="aspect-video relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 flex items-end p-4"
              variants={imageOverlayVariants}
              initial="hidden"
              animate={isHovered ? "hover" : "hidden"}
              transition={{ duration: 0.2 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 rounded-full"
              >
                <Film className="h-4 w-4 mr-2" /> View Full Memory
              </Button>
            </motion.div>
            <img
              src={memory.imageUrl || "/placeholder.svg"}
              alt={memory.title}
              className="h-full w-full object-cover transition-transform duration-500"
              style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
            />
            <motion.button 
              className={`absolute right-3 top-3 rounded-full p-2 z-20 ${
                memory.isFavorite 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-white/80 text-pink-500 hover:bg-pink-100'
              } backdrop-blur-sm shadow-md transition-all duration-300`}
              variants={isFavoriteBtnVariants}
              initial="initial"
              whileHover="hover"
            >
              <Heart className={`h-4 w-4 ${memory.isFavorite ? 'fill-white' : ''}`} />
            </motion.button>
          </div>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg text-pink-700 dark:text-pink-300">{memory.title}</CardTitle>
              <div className="rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20 px-2 py-1 text-xs font-medium text-pink-600 dark:text-pink-300">
                {memory.album}
              </div>
            </div>
            <CardDescription className="flex items-center gap-1 text-pink-400 dark:text-pink-500">
              <Clock className="h-3 w-3" />
              {memory.date}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground line-clamp-2">{memory.description}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 p-0"
            >
              <Bookmark className="h-4 w-4 mr-1" /> Save
            </Button>
            {memory.isFavorite && (
              <div className="flex items-center gap-1 text-pink-500">
                <Star className="h-4 w-4 fill-pink-500" />
                <span className="text-xs font-medium">Favorite</span>
              </div>
            )}
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  )
}