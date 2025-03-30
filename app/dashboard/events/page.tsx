"use client"

import { useState, useEffect } from "react"
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
import { Calendar, CalendarIcon, Clock, Plus, Heart, Star, Gift, Film, ChevronRight } from 'lucide-react'
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function EventsPage() {
  const events = [
    {
      id: 1,
      title: "Anniversary",
      description: "Our special day",
      date: "2025-03-15",
      time: "18:00",
      type: "Anniversary",
      reminder: true,
      icon: <Heart className="h-5 w-5" />,
      gradient: "from-red-400 to-pink-600",
    },
    {
      id: 2,
      title: "Birthday",
      description: "Partner's birthday celebration",
      date: "2025-04-22",
      time: "19:00",
      type: "Birthday",
      reminder: true,
      icon: <Gift className="h-5 w-5" />,
      gradient: "from-purple-400 to-indigo-600",
    },
    {
      id: 3,
      title: "Dinner Reservation",
      description: "At our favorite restaurant",
      date: "2025-03-20",
      time: "20:00",
      type: "Date Night",
      reminder: true,
      icon: <Star className="h-5 w-5" />,
      gradient: "from-pink-500 to-rose-600",
    },
    {
      id: 4,
      title: "Movie Night",
      description: "Watching the new release",
      date: "2025-03-25",
      time: "21:00",
      type: "Date Night",
      reminder: false,
      icon: <Film className="h-5 w-5" />,
      gradient: "from-fuchsia-500 to-purple-600",
    },
  ]

  const [date, setDate] = useState<Date | undefined>(undefined)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [showHearts, setShowHearts] = useState(false)

  useEffect(() => {
    // Trigger heart animation at random intervals
    const interval = setInterval(() => {
      setShowHearts(true)
      setTimeout(() => setShowHearts(false), 3000)
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  // const cardVariants = {
  //   hidden: { y: 20, opacity: 0 },
  //   show: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  // }

  const FloatingHearts = () => {
    return (
      <AnimatePresence>
        {showHearts && (
          <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-pink-500"
                initial={{ 
                  opacity: 1, 
                  scale: Math.random() * 0.5 + 0.5,
                  x: Math.random() * window.innerWidth, 
                  y: window.innerHeight + 20 
                }}
                animate={{ 
                  y: -100, 
                  x: (Math.random() - 0.5) * 200 + (i * 50), 
                  opacity: 0,
                  rotate: Math.random() * 360
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 5, delay: i * 0.2 }}
              >
                <Heart fill="currentColor" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className="space-y-6 relative">
      <FloatingHearts />
      
      <motion.div 
        className="flex items-center justify-between bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 p-6 rounded-xl text-white shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="bg-white/20 p-2 rounded-full backdrop-blur-sm"
          >
            <Heart className="h-6 w-6 text-white" fill="white" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Our Special Moments</h2>
            <p className="text-pink-100">Plan and celebrate your romantic adventures</p>
          </div>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-white text-pink-600 hover:bg-pink-100 hover:text-pink-700 transition-all duration-300 shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              New Moment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-pink-200 dark:border-pink-800 bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800">
            <DialogHeader>
              <DialogTitle className="text-xl text-pink-600 dark:text-pink-300 flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Create New Special Moment
              </DialogTitle>
              <DialogDescription className="text-pink-500 dark:text-pink-400">
                Plan your next romantic adventure together
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-pink-600 dark:text-pink-300 font-medium">What&apos;s the Occasion?</Label>
                <Input id="title" placeholder="Enter event title" className="border-pink-200 focus:border-pink-500 focus:ring-pink-500" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-pink-600 dark:text-pink-300 font-medium">Description</Label>
                <Textarea id="description" placeholder="Describe this special moment" className="border-pink-200 focus:border-pink-500 focus:ring-pink-500" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date" className="text-pink-600 dark:text-pink-300 font-medium">When is it?</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-pink-200 focus:ring-pink-500",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-pink-200">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="rounded-md"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time" className="text-pink-600 dark:text-pink-300 font-medium">At what time?</Label>
                <Input id="time" type="time" className="border-pink-200 focus:border-pink-500 focus:ring-pink-500" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-pink-600 dark:text-pink-300 font-medium">Type of Moment</Label>
                <Select>
                  <SelectTrigger id="type" className="border-pink-200 focus:border-pink-500 focus:ring-pink-500">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="date-night">Date Night</SelectItem>
                    <SelectItem value="intimate">Intimate</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="surprise">Surprise</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-pink-50 dark:bg-gray-800">
                <input type="checkbox" id="reminder" className="rounded text-pink-500 border-pink-300 focus:ring-pink-500" />
                <Label htmlFor="reminder" className="flex items-center cursor-pointer">
                  <span className="text-pink-700 dark:text-pink-300 font-medium">Set reminder for this moment</span>
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

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-pink-50 dark:bg-gray-800 rounded-lg mb-6">
          <TabsTrigger 
            value="upcoming" 
            className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
          >
            Upcoming Moments
          </TabsTrigger>
          <TabsTrigger 
            value="past" 
            className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
          >
            Past Memories
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                isHovered={hoveredCard === event.id}
                onHover={() => setHoveredCard(event.id)}
                onLeave={() => setHoveredCard(null)}
              />
            ))}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          <motion.div 
            className="flex items-center justify-center p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-4">
              <motion.div 
                className="w-20 h-20 mx-auto bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0] 
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Heart className="h-10 w-10 text-pink-500" />
              </motion.div>
              <h3 className="text-xl font-medium text-pink-700 dark:text-pink-300">No past moments yet</h3>
              <p className="text-sm text-pink-500">
                Your shared memories will appear here after they happen
              </p>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 mt-2">
                Create Fake Memory
              </Button>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: string;
  reminder: boolean;
  icon?: React.ReactNode;
  gradient?: string;
}

function EventCard({ event, isHovered, onHover, onLeave }: { 
  event: Event; 
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const eventDate = new Date(event.date)
  const today = new Date()
  const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };
  
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <Card className={`overflow-hidden relative bg-white dark:bg-gray-800 border-0 ${isHovered ? 'shadow-xl' : 'shadow-md'} transition-all duration-300`}>
        {/* Animated glow effect */}
        <motion.div 
          className={`absolute -inset-0.5 bg-gradient-to-r ${event.gradient || 'from-pink-500 to-purple-500'} opacity-75 rounded-xl blur-sm z-0`}
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
          <div className={`h-1 bg-gradient-to-r ${event.gradient || 'from-pink-500 to-purple-500'}`}></div>
          
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className={`p-1 rounded-full bg-gradient-to-r ${event.gradient || 'from-pink-500 to-purple-500'} text-white`}>
                  {event.icon || <Heart className="h-4 w-4" />}
                </div>
                {event.title}
              </CardTitle>
              <div className="rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20 px-2 py-1 text-xs font-medium text-pink-600 dark:text-pink-300">
                {event.type}
              </div>
            </div>
            <CardDescription>{event.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-pink-600 dark:text-pink-400">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{format(new Date(event.date), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center text-sm text-pink-600 dark:text-pink-400">
                <Clock className="mr-2 h-4 w-4" />
                <span>{event.time}</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <div className="flex w-full items-center justify-between">
              <motion.div 
                className={`text-sm font-medium bg-gradient-to-r ${event.gradient || 'from-pink-500 to-purple-500'} text-white px-3 py-1 rounded-full`}
                whileHover={{ scale: 1.05 }}
              >
                {daysUntil} days away
              </motion.div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 hover:bg-pink-50"
              >
                Details <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  )
}