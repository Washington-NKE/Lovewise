"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Avatar, 
  AvatarFallback 
} from "@/components/ui/avatar";

import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Gift, 
  Heart,  
  Star, 
  PlusCircle, 
  Edit, 
  Trash, 
  LockIcon, 
  Sparkles, 
  Camera, 
  DollarSign,
  Flame
} from 'lucide-react'

export default function GiftsPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Theme handling
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock data for demonstration
  const [giftHistory] = useState([
    {
      id: 1,
      giftName: "Silk Lingerie Set",
      date: "February 14, 2025",
      occasion: "Valentine's Day",
      giver: "user",
      recipient: "partner",
      description: "Delicate black lace with red accents",
      reaction: "She loved it! Couldn't wait to try it on...",
      image: "/placeholder.svg?height=150&width=200",
      favorite: true
    },
    {
      id: 2,
      giftName: "Couples Massage Package",
      date: "January 18, 2025",
      occasion: "Date Night",
      giver: "partner",
      recipient: "user",
      description: "Private massage studio with aromatherapy",
      reaction: "Perfect way to relax together. The evening that followed was unforgettable.",
      image: "/placeholder.svg?height=150&width=200",
      favorite: true
    },
    {
      id: 3,
      giftName: "Handwritten Love Letters",
      date: "December 25, 2024",
      occasion: "Christmas",
      giver: "user",
      recipient: "partner",
      description: "A collection of 12 sealed letters, one to open each month",
      reaction: "Made her cry. She said it was the most thoughtful gift ever.",
      image: "/placeholder.svg?height=150&width=200",
      favorite: false
    }
  ])

  const [wishlist] = useState([
    {
      id: 1,
      item: "Weekend Getaway",
      priority: "Must-Have",
      surprise: 70,
      person: "partner",
      notes: "A cabin in the woods, just the two of us"
    },
    {
      id: 2,
      item: "Leather Cuffs",
      priority: "Would Love",
      surprise: 90,
      person: "user",
      notes: "The ones from that store we visited"
    },
    {
      id: 3,
      item: "Scented Candles Collection",
      priority: "Nice to Have",
      surprise: 50,
      person: "partner",
      notes: "Especially like the vanilla and sandalwood ones"
    }
  ])

  const [occasions] = useState([
    {
      id: 1,
      title: "Anniversary",
      date: "April 15, 2025",
      daysLeft: 17,
      suggestions: ["Jewelry", "Weekend Trip", "Custom Photo Album"],
      budget: 300
    },
    {
      id: 2,
      title: "Partner's Birthday",
      date: "May 22, 2025",
      daysLeft: 54,
      suggestions: ["Spa Day", "Concert Tickets", "That watch they've been eyeing"],
      budget: 250
    }
  ])

  const [thoughtfulIdeas] = useState([
    {
      id: 1,
      title: "Memory Jar",
      description: "Fill a jar with 52 memories/reasons why you love them - one to read each week",
      type: "DIY",
      progress: 75
    },
    {
      id: 2,
      title: "Recreate First Date",
      description: "With some spicy new additions at the end of the night",
      type: "Experience",
      progress: 30
    }
  ])

  // Mock new gift form state
  const [newGift, setNewGift] = useState({
    giftName: "",
    date: "",
    occasion: "",
    recipient: "partner",
    description: "",
    reaction: ""
  })

  // Mock new wishlist item form state
  const [newWishlistItem, setNewWishlistItem] = useState({
    item: "",
    priority: "Would Love",
    surprise: 50,
    person: "user",
    notes: ""
  })

  // Don't render with SSR to avoid hydration mismatch
  if (!mounted) return null

  // Custom theme styles based on dark/light mode
  const isDark = theme === "dark"
  
  const themeStyles = {
    background: isDark ? "bg-zinc-900" : "bg-rose-50",
    card: isDark ? "bg-zinc-800 border-purple-800" : "bg-white border-pink-200",
    cardHover: isDark ? "hover:bg-zinc-700" : "hover:bg-pink-50",
    primary: isDark ? "text-purple-300" : "text-pink-600",
    secondary: isDark ? "text-purple-200" : "text-pink-700",
    accent: isDark ? "text-purple-400" : "text-pink-500",
    button: isDark ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-pink-500 hover:bg-pink-600 text-white",
    buttonOutline: isDark ? "border-purple-500 text-purple-300 hover:bg-purple-900" : "border-pink-400 text-pink-600 hover:bg-pink-100",
    input: isDark ? "bg-zinc-700 border-purple-600 text-purple-50" : "bg-white border-pink-300 text-pink-900",
    header: isDark ? "border-purple-800 bg-zinc-800/50" : "border-pink-200 bg-white/50",
    footer: isDark ? "border-purple-800 bg-zinc-800/50" : "border-pink-200 bg-white/50",
    title: isDark ? "text-purple-50" : "text-pink-900",
    tabs: isDark ? "bg-zinc-800" : "bg-white",
    tabSelected: isDark ? "bg-purple-700 text-white" : "bg-pink-500 text-white",
    tabList: isDark ? "bg-zinc-700" : "bg-pink-100",
    priorityHigh: isDark ? "bg-purple-700 text-white" : "bg-pink-600 text-white",
    priorityMed: isDark ? "bg-purple-500 text-white" : "bg-pink-400 text-white",
    priorityLow: isDark ? "bg-purple-400 text-white" : "bg-pink-300 text-white",
    flame: isDark ? "text-purple-500" : "text-pink-500",
    divider: isDark ? "border-purple-700" : "border-pink-200",
    highlight: isDark ? "bg-purple-900/30" : "bg-pink-100/50"
  }

  const getPriorityBadge = (priority : string) => {
    switch (priority) {
      case "Must-Have":
        return <Badge className={themeStyles.priorityHigh}>{priority}</Badge>
      case "Would Love":
        return <Badge className={themeStyles.priorityMed}>{priority}</Badge>
      case "Nice to Have":
        return <Badge className={themeStyles.priorityLow}>{priority}</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  return (
    <div className={`flex min-h-[calc(100vh-8rem)] flex-col ${themeStyles.background}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={`text-2xl font-bold tracking-tight flex items-center ${themeStyles.title}`}>
          <Gift className={`mr-2 h-6 w-6 ${themeStyles.accent}`} />
          Intimate Gifts
          <Flame className={`ml-2 h-5 w-5 ${themeStyles.flame}`} />
        </h2>
        <Button className={themeStyles.button}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Gift
        </Button>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className={`w-full justify-start mb-6 ${themeStyles.tabList}`}>
          <TabsTrigger value="history" className={`data-[state=active]:${themeStyles.tabSelected}`}>
            Gift History
          </TabsTrigger>
          <TabsTrigger value="wishlist" className={`data-[state=active]:${themeStyles.tabSelected}`}>
            Wishlist
          </TabsTrigger>
          <TabsTrigger value="occasions" className={`data-[state=active]:${themeStyles.tabSelected}`}>
            Special Occasions
          </TabsTrigger>
          <TabsTrigger value="ideas" className={`data-[state=active]:${themeStyles.tabSelected}`}>
            Thoughtful Ideas
          </TabsTrigger>
          <TabsTrigger value="secret" className={`data-[state=active]:${themeStyles.tabSelected}`}>
            <LockIcon className="mr-1 h-3 w-3" />
            Secret Plans
          </TabsTrigger>
          <TabsTrigger value="favorites" className={`data-[state=active]:${themeStyles.tabSelected}`}>
            <Heart className="mr-1 h-3 w-3" />
            Favorites
          </TabsTrigger>
        </TabsList>

        {/* Gift History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {giftHistory.map(gift => (
              <Card key={gift.id} className={`${themeStyles.card} ${themeStyles.cardHover} transition-all`}>
                <CardHeader className={`${themeStyles.header} pb-2`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className={themeStyles.title}>{gift.giftName}</CardTitle>
                      <CardDescription className={themeStyles.secondary}>
                        {gift.date} • {gift.occasion}
                      </CardDescription>
                    </div>
                    {gift.favorite && (
                      <Star className="h-5 w-5 fill-current text-yellow-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex gap-4 mb-4">
                    <div className="w-1/3">
                      <img 
                        src={gift.image} 
                        alt={gift.giftName} 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                    <div className="w-2/3">
                      <p className={`mb-1 ${themeStyles.primary}`}>
                        <span className="font-semibold">From:</span> {gift.giver === "user" ? "You" : "Partner"}
                      </p>
                      <p className={`mb-1 ${themeStyles.primary}`}>
                        <span className="font-semibold">To:</span> {gift.recipient === "user" ? "You" : "Partner"}
                      </p>
                      <p className={`mb-1 ${themeStyles.primary}`}>
                        <span className="font-semibold">Description:</span> {gift.description}
                      </p>
                      <div className={`mt-3 p-3 italic rounded-md ${themeStyles.highlight}`}>
                        &quot;{gift.reaction}&quot;
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className={`${themeStyles.footer} pt-1 flex justify-between`}>
                  <Button variant="outline" size="sm" className={themeStyles.buttonOutline}>
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className={themeStyles.buttonOutline}>
                    <Heart className={`mr-1 h-3 w-3 ${gift.favorite ? "fill-current" : ""}`} />
                    Favorite
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <Card className={themeStyles.card}>
            <CardHeader>
              <CardTitle className={themeStyles.title}>Add New Gift Memory</CardTitle>
              <CardDescription className={themeStyles.secondary}>
                Record a new gift you&apos;ve given or received
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className={themeStyles.primary}>Gift Name</Label>
                    <Input 
                      placeholder="What was the gift?" 
                      className={themeStyles.input}
                      value={newGift.giftName}
                      onChange={(e : React.ChangeEvent<HTMLInputElement>) => setNewGift({...newGift, giftName: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label className={themeStyles.primary}>Date</Label>
                    <Input 
                      type="date" 
                      className={themeStyles.input}
                      value={newGift.date}
                      onChange={(e : React.ChangeEvent<HTMLInputElement>) => setNewGift({...newGift, date: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label className={themeStyles.primary}>Occasion</Label>
                    <Input 
                      placeholder="What was the occasion?" 
                      className={themeStyles.input}
                      value={newGift.occasion}
                      onChange={(e : React.ChangeEvent<HTMLInputElement>) => setNewGift({...newGift, occasion: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label className={themeStyles.primary}>Gift Direction</Label>
                    <Select 
                      value={newGift.recipient} 
                      onValueChange={(value : string) => setNewGift({...newGift, recipient: value})}
                    >
                      <SelectTrigger className={themeStyles.input}>
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="partner">Given to Partner</SelectItem>
                        <SelectItem value="user">Received from Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className={themeStyles.primary}>Description</Label>
                    <Textarea 
                      placeholder="Describe the gift..." 
                      className={themeStyles.input}
                      value={newGift.description}
                      onChange={(e : React.ChangeEvent<HTMLTextAreaElement>) => setNewGift({...newGift, description: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label className={themeStyles.primary}>Reaction</Label>
                    <Textarea 
                      placeholder="How did they react? How did it make you feel?" 
                      className={themeStyles.input}
                      value={newGift.reaction}
                      onChange={(e : React.ChangeEvent<HTMLTextAreaElement>) => setNewGift({...newGift, reaction: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label className={themeStyles.primary}>Upload Photo</Label>
                    <div className={`border-2 border-dashed rounded-md p-6 text-center ${themeStyles.buttonOutline} hover:cursor-pointer`}>
                      <Camera className={`mx-auto h-8 w-8 mb-2 ${themeStyles.accent}`} />
                      <p className={themeStyles.secondary}>Drop image here or click to upload</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button className={themeStyles.button}>Save Gift Memory</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={themeStyles.card}>
              <CardHeader>
                <CardTitle className={themeStyles.title}>Your Wishlist</CardTitle>
                <CardDescription className={themeStyles.secondary}>
                  What you would love to receive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {wishlist.filter(item => item.person === "user").map(item => (
                      <div key={item.id} className={`p-3 rounded-md ${themeStyles.highlight} mb-3`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-medium ${themeStyles.title}`}>{item.item}</h4>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <p className={`text-sm mb-2 ${themeStyles.secondary}`}>{item.notes}</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className={themeStyles.primary}>Surprise Level</span>
                            <span className={themeStyles.accent}>{item.surprise}%</span>
                          </div>
                          <Progress value={item.surprise} max={100} className="h-2 bg-gray-200" />
                        </div>
                        <div className="flex gap-2 mt-3 justify-end">
                          <Button variant="outline" size="sm" className={themeStyles.buttonOutline}>
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className={themeStyles.buttonOutline}>
                            <Trash className="mr-1 h-3 w-3" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button className={`w-full ${themeStyles.button}`}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add to Your Wishlist
                </Button>
              </CardFooter>
            </Card>

            <Card className={themeStyles.card}>
              <CardHeader>
                <CardTitle className={themeStyles.title}>Partner&apos;s Wishlist</CardTitle>
                <CardDescription className={themeStyles.secondary}>
                  What they would love to receive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {wishlist.filter(item => item.person === "partner").map(item => (
                      <div key={item.id} className={`p-3 rounded-md ${themeStyles.highlight} mb-3`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-medium ${themeStyles.title}`}>{item.item}</h4>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <p className={`text-sm mb-2 ${themeStyles.secondary}`}>{item.notes}</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className={themeStyles.primary}>Surprise Level</span>
                            <span className={themeStyles.accent}>{item.surprise}%</span>
                          </div>
                          <Progress value={item.surprise} max={100} className="h-2 bg-gray-200" />
                        </div>
                        <div className="flex gap-2 mt-3 justify-end">
                          <Button variant="outline" size="sm" className={themeStyles.buttonOutline}>
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className={themeStyles.buttonOutline}>
                            <Gift className="mr-1 h-3 w-3" />
                            Mark as Gifted
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button className={`w-full ${themeStyles.button}`}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add to Partner&apos;s Wishlist
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card className={themeStyles.card}>
            <CardHeader>
              <CardTitle className={themeStyles.title}>Add New Wishlist Item</CardTitle>
              <CardDescription className={themeStyles.secondary}>
                Let your partner know what you desire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className={themeStyles.primary}>Item Name</Label>
                    <Input 
                      placeholder="What do you want?" 
                      className={themeStyles.input}
                      value={newWishlistItem.item}
                      onChange={(e : React.ChangeEvent<HTMLInputElement>) => setNewWishlistItem({...newWishlistItem, item: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label className={themeStyles.primary}>Priority</Label>
                    <Select 
                      value={newWishlistItem.priority} 
                      onValueChange={(value: string) => setNewWishlistItem({...newWishlistItem, priority: value})}
                    >
                      <SelectTrigger className={themeStyles.input}>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Must-Have">Must-Have</SelectItem>
                        <SelectItem value="Would Love">Would Love</SelectItem>
                        <SelectItem value="Nice to Have">Nice to Have</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className={themeStyles.primary}>Whose Wishlist?</Label>
                    <Select 
                      value={newWishlistItem.person} 
                      onValueChange={(value: string) => setNewWishlistItem({...newWishlistItem, person: value})}
                    >
                      <SelectTrigger className={themeStyles.input}>
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Your Wishlist</SelectItem>
                        <SelectItem value="partner">Partner&apos;s Wishlist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className={themeStyles.primary}>Notes/Details</Label>
                    <Textarea 
                      placeholder="Any specific details about this item..." 
                      className={themeStyles.input}
                      value={newWishlistItem.notes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewWishlistItem({...newWishlistItem, notes: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label className={themeStyles.primary}>
                      Surprise Level: {newWishlistItem.surprise}%
                    </Label>
                    <div className="pt-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={newWishlistItem.surprise}
                        onChange={(e) => setNewWishlistItem({...newWishlistItem, surprise: parseInt(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className={themeStyles.secondary}>Tell me exactly what to get</span>
                      <span className={themeStyles.secondary}>Surprise me completely</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button className={themeStyles.button}>Add to Wishlist</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Special Occasions Tab */}
        <TabsContent value="occasions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {occasions.map(occasion => (
              <Card key={occasion.id} className={themeStyles.card}>
                <CardHeader className={`${themeStyles.header}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className={themeStyles.title}>{occasion.title}</CardTitle>
                      <CardDescription className={themeStyles.secondary}>
                        {occasion.date} • {occasion.daysLeft} days left
                      </CardDescription>
                    </div>
                    <Avatar className={isDark ? "bg-purple-700" : "bg-pink-100"}>
                      <AvatarFallback className={isDark ? "text-white" : "text-pink-700"}>{occasion.daysLeft}</AvatarFallback>
                    </Avatar>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className={`text-sm font-medium mb-2 ${themeStyles.primary}`}>Gift Ideas:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {occasion.suggestions.map((suggestion, index) => (
                          <li key={index} className={themeStyles.secondary}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className={`text-sm font-medium mb-2 ${themeStyles.primary}`}>Budget Planning:</h4>
                      <div className="flex items-center">
                        <DollarSign className={`h-5 w-5 mr-1 ${themeStyles.accent}`} />
                        <span className={`text-lg font-medium ${themeStyles.title}`}>${occasion.budget}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className={`${themeStyles.footer} flex justify-between`}>
                  <Button variant="outline" className={themeStyles.buttonOutline}>
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button className={themeStyles.button}>
                    <Gift className="mr-1 h-3 w-3" />
                    Plan Gift
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <Card className={themeStyles.card}>
            <CardHeader>
              <CardTitle className={themeStyles.title}>Add New Special Occasion</CardTitle>
              <CardDescription className={themeStyles.secondary}>
                Never miss an important date again
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className={themeStyles.primary}>Occasion Name</Label>
                    <Input placeholder="Anniversary, Birthday, etc." className={themeStyles.input} />
                  </div>
                  
                  <div>
                    <Label className={themeStyles.primary}>Date</Label>
                    <Input type="date" className={themeStyles.input} />
                  </div>
                  
                  <div>
                    <Label className={themeStyles.primary}>Budget</Label>
                    <div className="relative">
                      <DollarSign className={`absolute left-3 top-3 h-4 w-4 ${themeStyles.secondary}`} />
                      <Input type="number" className={`${themeStyles.input} pl-9`} placeholder="0" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className={themeStyles.primary}>Gift Ideas</Label>
                    <Textarea 
                      placeholder="List some gift ideas (one per line)" 
                      className={`${themeStyles.input} h-32`} 
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="reminder" />
                    <Label htmlFor="reminder" className={themeStyles.primary}>
                      Set reminder (2 weeks before)
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button className={themeStyles.button}>Save Occasion</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        {/* Thoughtful Ideas Tab */}
        <TabsContent value="ideas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {thoughtfulIdeas.map(idea => (
              <Card key={idea.id} className={themeStyles.card}>
                <CardHeader className={themeStyles.header}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className={themeStyles.title}>{idea.title}</CardTitle>
                      <CardDescription className={`flex items-center ${themeStyles.secondary}`}>
                        <Badge className={isDark ? "bg-purple-600" : "bg-pink-400"}>
                          {idea.type}
                        </Badge>
                      </CardDescription>
                    </div>
                    {idea.type === "DIY" && (
                      <div className="text-right">
                        <p className={`text-xs mb-1 ${themeStyles.secondary}`}>Progress</p>
                        <Progress value={idea.progress} max={100} className="h-2 w-20 bg-gray-200" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={themeStyles.primary}>{idea.description}</p>
                </CardContent>
                <CardFooter className={`${themeStyles.footer} flex justify-between`}>
                  <Button variant="outline" className={themeStyles.buttonOutline}>
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button className={themeStyles.button}>
                    <Gift className="mr-1 h-3 w-3" />
                    Start Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <Card className={themeStyles.card}>
            <CardHeader>
              <CardTitle className={themeStyles.title}>Add New Thoughtful Idea</CardTitle>
              <CardDescription className={themeStyles.secondary}>
                Track DIY projects and personalized gift ideas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className={themeStyles.primary}>Idea Title</Label>
                    <Input placeholder="Name your gift idea" className={themeStyles.input} />
                  </div>
                  
                  <div>
                    <Label className={themeStyles.primary}>Type</Label>
                    <Select defaultValue="DIY">
                      <SelectTrigger className={themeStyles.input}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DIY">DIY Project</SelectItem>
                        <SelectItem value="Experience">Experience</SelectItem>
                        <SelectItem value="Intimate">Intimate Gift</SelectItem>
                        <SelectItem value="Personalized">Personalized Item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className={themeStyles.primary}>Target Completion</Label>
                    <Input type="date" className={themeStyles.input} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className={themeStyles.primary}>Description</Label>
                    <Textarea 
                      placeholder="Describe your idea in detail..." 
                      className={`${themeStyles.input} h-32`} 
                    />
                  </div>
                  
                  <div>
                    <Label className={themeStyles.primary}>
                      Progress (for DIY projects)
                    </Label>
                    <div className="pt-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        defaultValue="0"
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className={themeStyles.secondary}>Not Started</span>
                      <span className={themeStyles.secondary}>Complete</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button className={themeStyles.button}>Save Idea</Button>
            </CardFooter>
          </Card>
          
          <Card className={themeStyles.card}>
            <CardHeader>
              <CardTitle className={themeStyles.title}>Love Notes & Letters</CardTitle>
              <CardDescription className={themeStyles.secondary}>
                Sometimes words are the most intimate gift
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`p-4 rounded-md border ${themeStyles.highlight} border-dashed ${themeStyles.divider}`}>
                  <h4 className={`font-medium mb-2 ${themeStyles.title}`}>Write a Love Letter</h4>
                  <Textarea 
                    placeholder="Dear love of my life..." 
                    className={`${themeStyles.input} h-32 mb-3`} 
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input type="checkbox" id="secret-letter" className="mr-2" />
                      <Label htmlFor="secret-letter" className={`text-sm ${themeStyles.primary}`}>
                        Keep private until delivered
                      </Label>
                    </div>
                    <Button className={themeStyles.button}>
                      Save Letter
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className={`font-medium mb-3 ${themeStyles.title}`}>Your Saved Love Notes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className={`p-3 rounded-md cursor-pointer ${themeStyles.highlight} hover:shadow-md transition-all`}>
                      <p className={`italic text-sm ${themeStyles.secondary}`}>&quot;For when you need a reminder of how much I cherish you...&quot;</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs ${themeStyles.accent}`}>Saved 3 days ago</span>
                        <Heart className={`h-4 w-4 ${themeStyles.flame}`} />
                      </div>
                    </div>
                    <div className={`p-3 rounded-md cursor-pointer ${themeStyles.highlight} hover:shadow-md transition-all`}>
                      <p className={`italic text-sm ${themeStyles.secondary}`}>&quot;Tonight, I want to show you just how much you mean to me...&quot;</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs ${themeStyles.accent}`}>Saved 1 week ago</span>
                        <LockIcon className={`h-4 w-4 ${themeStyles.flame}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Secret Plans Tab */}
        <TabsContent value="secret" className="space-y-4">
          <Card className={themeStyles.card}>
            <CardHeader className="text-center">
              <LockIcon className={`mx-auto h-8 w-8 mb-2 ${themeStyles.accent}`} />
              <CardTitle className={themeStyles.title}>Secret Gift Planning</CardTitle>
              <CardDescription className={themeStyles.secondary}>
                Your partner can&apos;t see what you add here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-md border text-center ${themeStyles.highlight} border-dashed ${themeStyles.divider}`}>
                <h4 className={`font-medium mb-3 ${themeStyles.title}`}>Your Secret Gift Plans</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className={`p-3 rounded-md ${isDark ? "bg-zinc-700" : "bg-white"} shadow-sm`}>
                    <h5 className={`font-medium ${themeStyles.title}`}>Anniversary Surprise</h5>
                    <p className={`text-sm mt-2 ${themeStyles.secondary}`}>
                      Book the cabin retreat + champagne delivery
                    </p>
                    <div className="mt-3">
                      <Progress value={60} max={100} className="h-2 bg-gray-200" />
                      <p className={`text-xs mt-1 ${themeStyles.accent}`}>Progress: 60%</p>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button variant="outline" size="sm" className={themeStyles.buttonOutline}>
                        Edit Plan
                      </Button>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-md ${isDark ? "bg-zinc-700" : "bg-white"} shadow-sm`}>
                    <h5 className={`font-medium ${themeStyles.title}`}>Birthday Gift Collection</h5>
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between">
                        <span className={`text-sm ${themeStyles.secondary}`}>Leather journal</span>
                        <span className={`text-xs ${themeStyles.accent}`}>✓ Purchased</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${themeStyles.secondary}`}>Massage oil set</span>
                        <span className={`text-xs ${themeStyles.accent}`}>✓ Purchased</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${themeStyles.secondary}`}>Custom playlist</span>
                        <span className={`text-xs ${themeStyles.accent}`}>In progress</span>
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button variant="outline" size="sm" className={themeStyles.buttonOutline}>
                        Edit Items
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button className={`mx-auto ${themeStyles.button}`}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Secret Plan
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className={themeStyles.card}>
            <CardHeader>
              <CardTitle className={themeStyles.title}>Collaborative Gifts</CardTitle>
              <CardDescription className={themeStyles.secondary}>
                Plan joint gifts for friends and family
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`p-4 rounded-md ${themeStyles.highlight}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className={`font-medium ${themeStyles.title}`}>Mom&apos;s 60th Birthday</h4>
                      <p className={`text-sm ${themeStyles.secondary}`}>May 15, 2025</p>
                    </div>
                    <Badge className={isDark ? "bg-purple-500" : "bg-pink-500"}>
                      Shared
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <h5 className={`text-sm font-medium ${themeStyles.primary}`}>Gift Ideas:</h5>
                    <div className="pl-3 space-y-1">
                      <div className="flex items-center">
                        <input type="radio" id="idea1" name="momGift" className="mr-2" />
                        <Label htmlFor="idea1" className={themeStyles.secondary}>
                          Weekend spa package
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <input type="radio" id="idea2" name="momGift" className="mr-2" />
                        <Label htmlFor="idea2" className={themeStyles.secondary}>
                          Kitchen renovation contribution
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <input type="radio" id="idea3" name="momGift" className="mr-2" checked />
                        <Label htmlFor="idea3" className={themeStyles.secondary}>
                          Family photo album + dinner
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-md ${isDark ? "bg-zinc-700/50" : "bg-white"} mt-4`}>
                    <h5 className={`text-sm font-medium mb-2 ${themeStyles.primary}`}>
                      Budget & Contributions:
                    </h5>
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className={themeStyles.secondary}>Total Budget:</span>
                        <span className={themeStyles.title}>$400</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={themeStyles.secondary}>You:</span>
                        <span className={themeStyles.title}>$200</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={themeStyles.secondary}>Partner:</span>
                        <span className={themeStyles.title}>$200</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-3">
                    <Button className={themeStyles.button}>
                      Update Plan
                    </Button>
                  </div>
                </div>
                
                <Button className={`w-full ${themeStyles.buttonOutline}`} variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Collaborative Gift
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={themeStyles.card}>
              <CardHeader>
                <CardTitle className={themeStyles.title}>Most Memorable Gifts</CardTitle>
                <CardDescription className={themeStyles.secondary}>
                  Your all-time favorites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`p-4 rounded-md ${themeStyles.highlight} relative`}>
                    <div className="absolute top-2 right-2">
                      <Star className="h-5 w-5 fill-current text-yellow-500" />
                    </div>
                    <h4 className={`font-medium ${themeStyles.title} pr-7`}>Silk Lingerie Set</h4>
                    <p className={`text-sm ${themeStyles.secondary} mb-2`}>
                      Valentine&apos;s Day • 2025
                    </p>
                    <div className={`italic text-sm p-2 rounded-md ${isDark ? "bg-zinc-700/50" : "bg-white"}`}>
                      &quot;The way her eyes lit up when she opened the box... unforgettable moment.&quot;
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-md ${themeStyles.highlight} relative`}>
                    <div className="absolute top-2 right-2">
                      <Star className="h-5 w-5 fill-current text-yellow-500" />
                    </div>
                    <h4 className={`font-medium ${themeStyles.title} pr-7`}>Couples Massage Package</h4>
                    <p className={`text-sm ${themeStyles.secondary} mb-2`}>
                      Date Night • 2025
                    </p>
                    <div className={`italic text-sm p-2 rounded-md ${isDark ? "bg-zinc-700/50" : "bg-white"}`}>
                      &quot;Perfect combination of relaxation and intimacy. Led to one of our most connected evenings.&quot;
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className={themeStyles.card}>
              <CardHeader>
                <CardTitle className={themeStyles.title}>Gift Insights</CardTitle>
                <CardDescription className={themeStyles.secondary}>
                  What works best for your relationship
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className={`font-medium mb-2 ${themeStyles.title}`}>What They Love:</h4>
                    <ul className={`list-disc pl-5 ${themeStyles.primary}`}>
                      <li>Experiences over objects</li>
                      <li>Intimate apparel & accessories</li>
                      <li>Handwritten notes & personalized touches</li>
                      <li>Surprises that show deep attention to detail</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className={`font-medium mb-2 ${themeStyles.title}`}>What Doesn&apos;t Work:</h4>
                    <ul className={`list-disc pl-5 ${themeStyles.primary}`}>
                      <li>Generic gift cards</li>
                      <li>Practical household items</li>
                      <li>Last-minute selections</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className={`font-medium mb-2 ${themeStyles.title}`}>Best Gift Categories:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={isDark ? "bg-purple-700" : "bg-pink-500"}>
                        <Sparkles className="mr-1 h-3 w-3" />
                        Intimate
                      </Badge>
                      <Badge className={isDark ? "bg-purple-700" : "bg-pink-500"}>
                        <Sparkles className="mr-1 h-3 w-3" />
                        Experiential
                      </Badge>
                      <Badge className={isDark ? "bg-purple-700" : "bg-pink-500"}>
                        <Sparkles className="mr-1 h-3 w-3" />
                        Handmade
                      </Badge>
                      <Badge className={isDark ? "bg-purple-700" : "bg-pink-500"}>
                        <Sparkles className="mr-1 h-3 w-3" />
                        Thoughtful
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className={themeStyles.card}>
            <CardHeader>
              <CardTitle className={themeStyles.title}>Relationship Gift Timeline</CardTitle>
              <CardDescription className={themeStyles.secondary}>
                Your journey of giving together
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="relative">
                <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${isDark ? "bg-purple-700" : "bg-pink-300"}`}></div>
                
                <div className="space-y-8 relative">
                  <div className="ml-10 relative">
                    <div className={`absolute -left-10 w-4 h-4 rounded-full top-1.5 ${isDark ? "bg-purple-500" : "bg-pink-500"}`}></div>
                    <h4 className={`font-medium ${themeStyles.title}`}>First Gift Exchange</h4>
                    <p className={`text-sm ${themeStyles.secondary}`}>November 2023</p>
                    <div className={`mt-2 p-3 rounded-md ${themeStyles.highlight}`}>
                      <p className={themeStyles.primary}>
                        Handwritten poem & dinner reservation
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-10 relative">
                    <div className={`absolute -left-10 w-4 h-4 rounded-full top-1.5 ${isDark ? "bg-purple-500" : "bg-pink-500"}`}></div>
                    <h4 className={`font-medium ${themeStyles.title}`}>First Anniversary</h4>
                    <p className={`text-sm ${themeStyles.secondary}`}>April 2024</p>
                    <div className={`mt-2 p-3 rounded-md ${themeStyles.highlight}`}>
                      <p className={themeStyles.primary}>
                        Weekend trip & custom photo album
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-10 relative">
                    <div className={`absolute -left-10 w-4 h-4 rounded-full top-1.5 ${isDark ? "bg-purple-500" : "bg-pink-500"}`}></div>
                    <h4 className={`font-medium ${themeStyles.title}`}>Moving In Together</h4>
                    <p className={`text-sm ${themeStyles.secondary}`}>September 2024</p>
                    <div className={`mt-2 p-3 rounded-md ${themeStyles.highlight}`}>
                      <p className={themeStyles.primary}>
                        Bedroom accessories & intimate care package
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-10 relative">
                    <div className={`absolute -left-10 w-4 h-4 rounded-full top-1.5 ${isDark ? "bg-purple-600 border-2 border-purple-300" : "bg-pink-600 border-2 border-pink-200"}`}></div>
                    <h4 className={`font-medium ${themeStyles.title}`}>Today</h4>
                    <p className={`text-sm ${themeStyles.secondary}`}>March 2025</p>
                    <div className={`mt-2 p-3 rounded-md ${themeStyles.highlight}`}>
                      <p className={themeStyles.primary}>
                        Planning your next special surprise...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}