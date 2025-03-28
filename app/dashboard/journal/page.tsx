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
import { Switch } from "@/components/ui/switch"
import {  Plus } from 'lucide-react'

export default function JournalPage() {
  const entries = [
    {
      id: 1,
      title: "Our Weekend Trip",
      content: "We had an amazing time at the beach this weekend. The sunset was beautiful and we collected seashells together.",
      date: "March 10, 2025",
      isPrivate: false,
    },
    {
      id: 2,
      title: "Thoughts on Our Future",
      content: "Today we talked about our future plans and dreams. It's exciting to think about building a life together.",
      date: "March 3, 2025",
      isPrivate: true,
    },
    {
      id: 3,
      title: "Celebrating 2 Years",
      content: "Today marks two years since we first met. It's been an incredible journey filled with love and growth.",
      date: "February 25, 2025",
      isPrivate: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Journal</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All Entries</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
          <TabsTrigger value="private">Private</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <JournalEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="shared" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entries
              .filter((entry) => !entry.isPrivate)
              .map((entry) => (
                <JournalEntryCard key={entry.id} entry={entry} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="private" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entries
              .filter((entry) => entry.isPrivate)
              .map((entry) => (
                <JournalEntryCard key={entry.id} entry={entry} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Create New Journal Entry</CardTitle>
          <CardDescription>
            Share your thoughts, feelings, and memories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Enter a title for your entry" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your journal entry here..."
              className="min-h-[200px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="memory">Memory</SelectItem>
                <SelectItem value="thought">Thought</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="private" />
            <Label htmlFor="private">Make this entry private</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto">Save Entry</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  date: string;
  isPrivate: boolean;
}

function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{entry.title}</CardTitle>
          {entry.isPrivate && (
            <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              Private
            </div>
          )}
        </div>
        <CardDescription>{entry.date}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-4 text-sm text-muted-foreground">
          {entry.content}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          Read More
        </Button>
      </CardFooter>
    </Card>
  )
}
