"use client"

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
import { Calendar, Heart, Plus } from 'lucide-react'

export default function MemoriesPage() {
  const memories = [
    {
      id: 1,
      title: "Beach Day",
      description: "Our day at the beach last summer",
      date: "July 15, 2024",
      imageUrl: "/placeholder.svg?height=300&width=400&text=Beach+Day",
      album: "Vacations",
    },
    {
      id: 2,
      title: "Dinner Date",
      description: "Anniversary dinner at our favorite restaurant",
      date: "February 14, 2025",
      imageUrl: "/placeholder.svg?height=300&width=400&text=Dinner+Date",
      album: "Special Occasions",
    },
    {
      id: 3,
      title: "Hiking Trip",
      description: "Beautiful views from our weekend hike",
      date: "January 20, 2025",
      imageUrl: "/placeholder.svg?height=300&width=400&text=Hiking+Trip",
      album: "Adventures",
    },
    {
      id: 4,
      title: "Movie Night",
      description: "Cozy night watching our favorite films",
      date: "March 5, 2025",
      imageUrl: "/placeholder.svg?height=300&width=400&text=Movie+Night",
      album: "Everyday Moments",
    },
    {
      id: 5,
      title: "Concert",
      description: "Amazing live music experience together",
      date: "December 10, 2024",
      imageUrl: "/placeholder.svg?height=300&width=400&text=Concert",
      album: "Entertainment",
    },
    {
      id: 6,
      title: "Cooking Together",
      description: "Making our favorite pasta recipe",
      date: "March 1, 2025",
      imageUrl: "/placeholder.svg?height=300&width=400&text=Cooking",
      album: "Everyday Moments",
    },
  ]

  const albums = [...new Set(memories.map(memory => memory.album))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Memories</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Memory
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Memory</DialogTitle>
              <DialogDescription>
                Upload a photo or video to save a special moment
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter a title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe this memory" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="album">Album</Label>
                <Select>
                  <SelectTrigger id="album">
                    <SelectValue placeholder="Select an album" />
                  </SelectTrigger>
                  <SelectContent>
                    {albums.map(album => (
                      <SelectItem key={album} value={album}>{album}</SelectItem>
                    ))}
                    <SelectItem value="new">+ Create New Album</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">Upload Photo/Video</Label>
                <Input id="file" type="file" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Memory</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">All Memories</TabsTrigger>
          {albums.map(album => (
            <TabsTrigger key={album} value={album}>{album}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {memories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        </TabsContent>
        {albums.map(album => (
          <TabsContent key={album} value={album} className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {memories
                .filter(memory => memory.album === album)
                .map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))}
            </div>
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
}

function MemoryCard({ memory }: { memory: Memory }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={memory.imageUrl || "/placeholder.svg"}
          alt={memory.title}
          className="h-full w-full object-cover"
        />
        <button className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 backdrop-blur-sm">
          <Heart className="h-4 w-4" />
        </button>
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">{memory.title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {memory.date}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground">{memory.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
          {memory.album}
        </div>
      </CardFooter>
    </Card>
  )
}
