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
import { Calendar, Clock, Plus, Heart, Star, Gift, Film, ChevronRight, Cake, Coffee, Plane, Music, PartyPopper, Camera, Sparkles, Users } from 'lucide-react'
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { getUpcomingEventsByRelationship, getPastEventsByRelationship, getRelationshipId, createEvent } from "@/database/db"
import type { Event as DBEvent } from "@/database/db"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

export default function EventsPage() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [showHearts, setShowHearts] = useState(false)
  const [events, setEvents] = useState<DBEvent[]>([])
  const [pastEvents, setPastEvents] = useState<DBEvent[]>([])
  const [relationshipId, setRelationshipId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    time: '',
    type: '',
    isAllDay: false,
    reminderTime: '',
  })

  const { data: session } = useSession()
  const currentUserId = session?.user?.id

  const fetchEventsData = async () => {
    try {
      console.log("🔍 Starting to fetch relationship ID...")
      const relId = await getRelationshipId()
      console.log("✅ Fetched relationship ID:", relId)
      console.log("🔍 Type of relId:", typeof relId)
      
      setRelationshipId(relId)
      
      if (relId) {
        console.log("🔍 Attempting to fetch events for relationship ID:", relId)
        const fetchedEvents = await getUpcomingEventsByRelationship(relId)
        console.log("✅ Raw fetched events:", fetchedEvents)
        console.log("🔍 Number of events:", fetchedEvents?.length || 0)
        console.log("🔍 Type of fetchedEvents:", typeof fetchedEvents)
        console.log("🔍 Is array?", Array.isArray(fetchedEvents))
        
        if (fetchedEvents && Array.isArray(fetchedEvents)) {
          setEvents(fetchedEvents)
          console.log("✅ Events set in state")
        } else {
          console.warn("⚠️ fetchedEvents is not an array or is null/undefined")
          setEvents([])
        }
      } else {
        console.error("❌ No relationship ID found.")
        setEvents([])
      }
    } catch (error) {
      console.error("❌ Failed to fetch events:", error)
      if (error instanceof Error) {
        console.error("❌ Error details:", error.message)
        console.error("❌ Error stack:", error.stack)
      }
      setEvents([])
    }
  }

  const fetchPastEventsData = async () => {
    try {
      const relId = await getRelationshipId()
      
      setRelationshipId(relId)
      
      if (relId) {
        const fetchedPastEvents = await getPastEventsByRelationship(relId)
        
        if (fetchedPastEvents && Array.isArray(fetchedPastEvents)) {
          setPastEvents(fetchedPastEvents)
        } else {
          console.warn("⚠️ fetchedPastEvents is not an array or is null/undefined")
          setPastEvents([])
        }
      } else {
        console.error("❌ No relationship ID found.")
        setPastEvents([])
      }
    } catch (error) {
      console.error("❌ Failed to fetch past events:", error)
      if (error instanceof Error) {
        console.error("❌ Error details:", error.message)
        console.error("❌ Error stack:", error.stack)
      }
      setPastEvents([])
    }
  }

  useEffect(() => {
    // Trigger heart animation at random intervals
    const interval = setInterval(() => {
      setShowHearts(true)
      setTimeout(() => setShowHearts(false), 3000)
    }, 10000)

    // Fetch relationship ID and events
    fetchEventsData()
    fetchPastEventsData()
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    console.log("📊 State updated - Relationship ID:", relationshipId)
  }, [relationshipId])

  useEffect(() => {
    console.log("📊 State updated - Events:", events)
    console.log("📊 Events length:", events?.length || 0)
  }, [events])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateEvent = async () => {
    if (!date || !formData.title || !relationshipId || !currentUserId) {
      toast("Missing Information: Please fill in all required fields")
      return
    }

    setIsCreating(true)
    
    try {
      // Format the date and time
      const startDate = new Date(date)
      if (formData.time) {
        const [hours, minutes] = formData.time.split(':')
        startDate.setHours(parseInt(hours), parseInt(minutes))
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startDate: startDate,
        endDate: startDate, // For now, same as start date
        time: formData.time,
        type: formData.type,
        isAllDay: formData.isAllDay,
        reminderTime: formData.reminderTime,
        relationshipId: relationshipId,
        creatorId: currentUserId,
      }

      await createEvent(eventData)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        time: '',
        type: '',
        isAllDay: false,
        reminderTime: '',
      })
      setDate(undefined)
      setIsDialogOpen(false)
      
      // Refresh events
      await fetchEventsData()
      await fetchPastEventsData()
      
      toast("Event Created! Your special moment has been added successfully")
    } catch (error) {
      console.error("❌ Failed to create event:", error)
      toast("Error: Failed to create event. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  console.log("Relationship ID", relationshipId)
  console.log("Fetched events:", events)
  
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
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200), 
                  y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20 
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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <Input 
                  id="title" 
                  placeholder="Enter event title" 
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="border-pink-200 focus:border-pink-500 focus:ring-pink-500" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-pink-600 dark:text-pink-300 font-medium">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe this special moment" 
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="border-pink-200 focus:border-pink-500 focus:ring-pink-500" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location" className="text-pink-600 dark:text-pink-300 font-medium">Location (Optional)</Label>
                <Input 
                  id="location" 
                  placeholder="Where will this happen?" 
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="border-pink-200 focus:border-pink-500 focus:ring-pink-500" 
                />
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
                      <Calendar className="mr-2 h-4 w-4" />
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
                <Input 
                  id="time" 
                  type="time" 
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="border-pink-200 focus:border-pink-500 focus:ring-pink-500" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-pink-600 dark:text-pink-300 font-medium">Type of Moment</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
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
                <input 
                  type="checkbox" 
                  id="reminder" 
                  checked={formData.isAllDay}
                  onChange={(e) => handleInputChange('isAllDay', e.target.checked)}
                  className="rounded text-pink-500 border-pink-300 focus:ring-pink-500" 
                />
                <Label htmlFor="reminder" className="flex items-center cursor-pointer">
                  <span className="text-pink-700 dark:text-pink-300 font-medium">All day event</span>
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleCreateEvent}
                disabled={isCreating}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300"
              >
                {isCreating ? 'Creating...' : 'Save This Moment'}
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
          {pastEvents.length > 0 ? ( 
            <motion.div 
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {pastEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  isHovered={hoveredCard === event.id}
                  onHover={() => setHoveredCard(event.id)}
                  onLeave={() => setHoveredCard(null)}
                />
              ))}
            </motion.div>
          ) : (
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
              </div>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

const getIconByType = (type: string) => {
  const typeIconMap = {
    'anniversary': Heart,
    'birthday': Cake,
    'date-night': Coffee,
    'intimate': Heart,
    'milestone': Star,
    'surprise': Gift,
    'movie': Film,
    'travel': Plane,
    'music': Music,
    'party': PartyPopper,
    'photo': Camera,
    'celebration': Sparkles,
    'meeting': Users,
    'other': Calendar,
  }
  
  return typeIconMap[type.toLowerCase() as keyof typeof typeIconMap] || Heart 
}

const getIconByKeywords = (title: string, description: string) => {
  const text = `${title} ${description}`.toLowerCase()
  
  if (text.includes('birthday') || text.includes('birth')) return Cake
  if (text.includes('anniversary') || text.includes('love')) return Heart
  if (text.includes('dinner') || text.includes('restaurant') || text.includes('coffee')) return Coffee
  if (text.includes('movie') || text.includes('film') || text.includes('cinema')) return Film
  if (text.includes('travel') || text.includes('trip') || text.includes('vacation')) return Plane
  if (text.includes('party') || text.includes('celebration')) return PartyPopper
  if (text.includes('photo') || text.includes('picture')) return Camera
  if (text.includes('music') || text.includes('concert')) return Music
  if (text.includes('surprise') || text.includes('gift')) return Gift
  if (text.includes('milestone') || text.includes('achievement')) return Star
  if (text.includes('meeting') || text.includes('friends')) return Users
  
  return Heart // Default icon
}

function EventCard({ event, isHovered, onHover, onLeave }: { 
  event: DBEvent; 
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const eventDate = new Date(event.date)
  const today = new Date()
  const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const dueDate = format(new Date(eventDate), "MMMM d, yyyy")
  
  // Combine approaches with priority
  const IconComponent = event.type ? getIconByType(event.type) : getIconByKeywords(event.title || '', event.description || '')
  
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  }
  
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
                  <IconComponent className="h-4 w-4" />
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
                {daysUntil < 0 ? `${dueDate}` : daysUntil === 0 ? `Today` : daysUntil === 1 ? `Tomorrow` : `${daysUntil} days away`}
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