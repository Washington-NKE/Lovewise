"use client"

import { useState } from "react"
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
import { Calendar, CalendarIcon, Clock, Plus } from 'lucide-react'
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

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
    },
    {
      id: 2,
      title: "Birthday",
      description: "Partner's birthday celebration",
      date: "2025-04-22",
      time: "19:00",
      type: "Birthday",
      reminder: true,
    },
    {
      id: 3,
      title: "Dinner Reservation",
      description: "At our favorite restaurant",
      date: "2025-03-20",
      time: "20:00",
      type: "Date Night",
      reminder: true,
    },
    {
      id: 4,
      title: "Movie Night",
      description: "Watching the new release",
      date: "2025-03-25",
      time: "21:00",
      type: "Date Night",
      reminder: false,
    },
  ]

  const [date, setDate] = useState<Date | undefined>(undefined)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Events & Reminders</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>
                Create a new event or reminder for your calendar
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter event title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe this event" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Event Type</Label>
                <Select>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="date-night">Date Night</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="past" className="mt-6">
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">No past events</h3>
              <p className="text-sm text-muted-foreground">
                Your past events will appear here
              </p>
            </div>
          </div>
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
}

function EventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.date)
  const today = new Date()
  const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {event.type}
          </div>
        </div>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(event.date), "MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{event.time}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-between">
          <div className="text-sm font-medium text-primary">
            {daysUntil} days away
          </div>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
