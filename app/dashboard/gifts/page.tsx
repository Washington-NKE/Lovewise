"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { 
  Avatar, 
  AvatarFallback 
} from "@/components/ui/avatar"
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
  Flame,
  Loader2
} from 'lucide-react'

// Types
interface Gift {
  id: string
  giftName: string
  date: string
  occasion: string
  description?: string
  reaction?: string
  image?: string
  favorite: boolean
  giverId: string
  recipientId: string
}

interface WishlistItem {
  id: string
  item: string
  priority: 'MUST_HAVE' | 'WOULD_LOVE' | 'NICE_TO_HAVE'
  surprise: number
  notes?: string
  gifted: boolean
  userId: string
}

interface SpecialOccasion {
  id: string
  title: string
  date: string
  budget?: number
  suggestions: string[]
  reminder: boolean
  userId: string
}

interface ThoughtfulIdea {
  id: string
  title: string
  description: string
  type: 'DIY' | 'EXPERIENCE' | 'INTIMATE' | 'PERSONALIZED'
  progress: number
  targetDate?: string
  completed: boolean
  userId: string
}

interface SecretPlan {
  id: string
  title: string
  description?: string
  progress: number
  budget?: number
  targetDate?: string
  userId: string
}

interface SecretPlanItem {
  id: string
  secretPlanId: string
  item: string
  completed: boolean
  cost?: number
  notes?: string
}

interface LoveLetter {
  id: string
  content: string
  title?: string
  private: boolean
  delivered: boolean
  userId: string
  createdAt: string
}

export default function GiftsPage() {
  const { theme } = useTheme()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  
  // State for all data
  const [gifts, setGifts] = useState<Gift[]>([])
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [occasions, setOccasions] = useState<SpecialOccasion[]>([])
  const [thoughtfulIdeas, setThoughtfulIdeas] = useState<ThoughtfulIdea[]>([])
  const [secretPlans, setSecretPlans] = useState<SecretPlan[]>([])
  const [secretPlanItems, setSecretPlanItems] = useState<SecretPlanItem[]>([])
  const [loveLetters, setLoveLetters] = useState<LoveLetter[]>([])
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [newGift, setNewGift] = useState({
    giftName: "",
    date: "",
    occasion: "",
    recipientId: "",
    description: "",
    reaction: "",
    favorite: false
  })
  
  const [newWishlistItem, setNewWishlistItem] = useState({
    item: "",
    priority: "WOULD_LOVE" as const,
    surprise: 50,
    notes: "",
    gifted: false
  })
  
  const [newOccasion, setNewOccasion] = useState({
    title: "",
    date: "",
    budget: "",
    suggestions: "",
    reminder: true
  })
  
  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    type: "DIY" as const,
    progress: 0,
    targetDate: "",
    completed: false
  })
  
  const [newSecretPlan, setNewSecretPlan] = useState({
    title: "",
    description: "",
    budget: "",
    targetDate: ""
  })
  
  const [newLoveLetter, setNewLoveLetter] = useState({
    content: "",
    title: "",
    private: false
  })

  // Theme handling
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load data on component mount
  useEffect(() => {
    if (mounted && session?.user?.id) {
      loadAllData()
    }
  }, [mounted, session])

  const loadAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadGifts(),
        loadWishlist(),
        loadOccasions(),
        loadThoughtfulIdeas(),
        loadSecretPlans(),
        loadLoveLetters()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadGifts = async () => {
    try {
      const response = await fetch('/api/gifts')
      if (response.ok) {
        const data = await response.json()
        setGifts(data)
      }
    } catch (error) {
      console.error('Error loading gifts:', error)
    }
  }

  const loadWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data)
      }
    } catch (error) {
      console.error('Error loading wishlist:', error)
    }
  }

  const loadOccasions = async () => {
    try {
      const response = await fetch('/api/occasions')
      if (response.ok) {
        const data = await response.json()
        setOccasions(data)
      }
    } catch (error) {
      console.error('Error loading occasions:', error)
    }
  }

  const loadThoughtfulIdeas = async () => {
    try {
      const response = await fetch('/api/thoughtful-ideas')
      if (response.ok) {
        const data = await response.json()
        setThoughtfulIdeas(data)
      }
    } catch (error) {
      console.error('Error loading thoughtful ideas:', error)
    }
  }

  const loadSecretPlans = async () => {
    try {
      const response = await fetch('/api/secret-plans')
      if (response.ok) {
        const data = await response.json()
        setSecretPlans(data)
      }
      
      const itemsResponse = await fetch('/api/secret-plan-items')
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setSecretPlanItems(itemsData)
      }
    } catch (error) {
      console.error('Error loading secret plans:', error)
    }
  }

  const loadLoveLetters = async () => {
    try {
      const response = await fetch('/api/love-letters')
      if (response.ok) {
        const data = await response.json()
        setLoveLetters(data)
      }
    } catch (error) {
      console.error('Error loading love letters:', error)
    }
  }

  // Submit handlers
  const handleSubmitGift = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/gifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newGift,
          giverId: session.user.id,
          recipientId: newGift.recipientId || session.user.id
        }),
      })

      if (response.ok) {
        const gift = await response.json()
        setGifts(prev => [...prev, gift])
        setNewGift({
          giftName: "",
          date: "",
          occasion: "",
          recipientId: "",
          description: "",
          reaction: "",
          favorite: false
        })
      }
    } catch (error) {
      console.error('Error creating gift:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitWishlistItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newWishlistItem,
          userId: session.user.id
        }),
      })

      if (response.ok) {
        const item = await response.json()
        setWishlistItems(prev => [...prev, item])
        setNewWishlistItem({
          item: "",
          priority: "WOULD_LOVE" as const,
          surprise: 50,
          notes: "",
          gifted: false
        })
      }
    } catch (error) {
      console.error('Error creating wishlist item:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitOccasion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/occasions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newOccasion.title,
          date: newOccasion.date,
          budget: newOccasion.budget ? parseFloat(newOccasion.budget) : undefined,
          suggestions: newOccasion.suggestions.split('\n').filter(s => s.trim()),
          reminder: newOccasion.reminder,
          userId: session.user.id
        }),
      })

      if (response.ok) {
        const occasion = await response.json()
        setOccasions(prev => [...prev, occasion])
        setNewOccasion({
          title: "",
          date: "",
          budget: "",
          suggestions: "",
          reminder: true
        })
      }
    } catch (error) {
      console.error('Error creating occasion:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/thoughtful-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newIdea,
          userId: session.user.id
        }),
      })

      if (response.ok) {
        const idea = await response.json()
        setThoughtfulIdeas(prev => [...prev, idea])
        setNewIdea({
          title: "",
          description: "",
          type: "DIY" as const,
          progress: 0,
          targetDate: "",
          completed: false
        })
      }
    } catch (error) {
      console.error('Error creating idea:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitSecretPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setSubmitting(true)
    try {
      const targetDate = new Date(newSecretPlan.targetDate)
      const response = await fetch('/api/secret-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newSecretPlan.title,
          description: newSecretPlan.description,
          budget: newSecretPlan.budget ? parseFloat(newSecretPlan.budget) : undefined,
          targetDate: targetDate,
          progress: 0,
          userId: session.user.id
        }),
      })

      if (response.ok) {
        const plan = await response.json()
        setSecretPlans(prev => [...prev, plan])
        setNewSecretPlan({
          title: "",
          description: "",
          budget: "",
          targetDate: ""
        })
      }
    } catch (error) {
      console.error('Error creating secret plan:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitLoveLetter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/love-letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newLoveLetter,
          userId: session.user.id,
          delivered: false
        }),
      })

      if (response.ok) {
        const letter = await response.json()
        setLoveLetters(prev => [...prev, letter])
        setNewLoveLetter({
          content: "",
          title: "",
          private: false
        })
      }
    } catch (error) {
      console.error('Error creating love letter:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Update handlers
  const toggleGiftFavorite = async (giftId: string) => {
    try {
      const gift = gifts.find(g => g.id === giftId)
      if (!gift) return

      const response = await fetch(`/api/gifts/${giftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...gift,
          favorite: !gift.favorite
        }),
      })

      if (response.ok) {
        const updatedGift = await response.json()
        setGifts(prev => prev.map(g => g.id === giftId ? updatedGift : g))
      }
    } catch (error) {
      console.error('Error updating gift favorite:', error)
    }
  }

  const markWishlistItemAsGifted = async (itemId: string) => {
    try {
      const item = wishlistItems.find(w => w.id === itemId)
      if (!item) return

      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          gifted: true
        }),
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setWishlistItems(prev => prev.map(w => w.id === itemId ? updatedItem : w))
      }
    } catch (error) {
      console.error('Error updating wishlist item:', error)
    }
  }

  const updateIdeaProgress = async (ideaId: string, progress: number) => {
    try {
      const idea = thoughtfulIdeas.find(i => i.id === ideaId)
      if (!idea) return

      const response = await fetch(`/api/thoughtful-ideas/${ideaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...idea,
          progress,
          completed: progress >= 100
        }),
      })

      if (response.ok) {
        const updatedIdea = await response.json()
        setThoughtfulIdeas(prev => prev.map(i => i.id === ideaId ? updatedIdea : i))
      }
    } catch (error) {
      console.error('Error updating idea progress:', error)
    }
  }

  // Delete handlers
  const deleteGift = async (giftId: string) => {
    try {
      const response = await fetch(`/api/gifts/${giftId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setGifts(prev => prev.filter(g => g.id !== giftId))
      }
    } catch (error) {
      console.error('Error deleting gift:', error)
    }
  }

  const deleteWishlistItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setWishlistItems(prev => prev.filter(w => w.id !== itemId))
      }
    } catch (error) {
      console.error('Error deleting wishlist item:', error)
    }
  }

  // Utility functions
  const calculateDaysUntil = (date: string) => {
    const today = new Date()
    const targetDate = new Date(date)
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getPriorityBadge = (priority: string) => {
    const isDark = theme === "dark"
    switch (priority) {
      case "MUST_HAVE":
        return <Badge className={isDark ? "bg-purple-700 text-white" : "bg-pink-600 text-white"}>Must Have</Badge>
      case "WOULD_LOVE":
        return <Badge className={isDark ? "bg-purple-500 text-white" : "bg-pink-400 text-white"}>Would Love</Badge>
      case "NICE_TO_HAVE":
        return <Badge className={isDark ? "bg-purple-400 text-white" : "bg-pink-300 text-white"}>Nice to Have</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  const getItemsForSecretPlan = (planId: string) => {
    return secretPlanItems.filter(item => item.secretPlanId === planId)
  }

  const getFavoriteGifts = () => {
    return gifts.filter(gift => gift.favorite)
  }

  // Don't render with SSR to avoid hydration mismatch
  if (!mounted) return null

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

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
    flame: isDark ? "text-purple-500" : "text-pink-500",
    divider: isDark ? "border-purple-700" : "border-pink-200",
    highlight: isDark ? "bg-purple-900/30" : "bg-pink-100/50"
  }

  return (
    <div className={`flex min-h-[calc(100vh-8rem)] flex-col ${themeStyles.background}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={`text-2xl font-bold tracking-tight flex items-center ${themeStyles.title}`}>
          <Gift className={`mr-2 h-6 w-6 ${themeStyles.accent}`} />
          Intimate Gifts
          <Flame className={`ml-2 h-5 w-5 ${themeStyles.flame}`} />
        </h2>
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
            {gifts.map(gift => (
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
                  <div className="mb-4">
                    <p className={`mb-2 ${themeStyles.primary}`}>
                      <span className="font-semibold">Description:</span> {gift.description}
                    </p>
                    {gift.reaction && (
                      <div className={`mt-3 p-3 italic rounded-md ${themeStyles.highlight}`}>
                        "{gift.reaction}"
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className={`${themeStyles.footer} pt-1 flex justify-between`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={themeStyles.buttonOutline}
                    onClick={() => toggleGiftFavorite(gift.id)}
                  >
                    <Heart className={`mr-1 h-3 w-3 ${gift.favorite ? "fill-current" : ""}`} />
                    {gift.favorite ? "Unfavorite" : "Favorite"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={themeStyles.buttonOutline}
                    onClick={() => deleteGift(gift.id)}
                  >
                    <Trash className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <Card className={themeStyles.card}>
            <CardHeader>
              <CardTitle className={themeStyles.title}>Add New Gift Memory</CardTitle>
              <CardDescription className={themeStyles.secondary}>
                Record a new gift you've given or received
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitGift}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className={themeStyles.primary}>Gift Name</Label>
                      <Input 
                        placeholder="What was the gift?" 
                        className={themeStyles.input}
                        value={newGift.giftName}
                        onChange={(e) => setNewGift({...newGift, giftName: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label className={themeStyles.primary}>Date</Label>
                      <Input 
                        type="date" 
                        className={themeStyles.input}
                        value={newGift.date}
                        onChange={(e) => setNewGift({...newGift, date: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label className={themeStyles.primary}>Occasion</Label>
                      <Input 
                        placeholder="What was the occasion?" 
                        className={themeStyles.input}
                        value={newGift.occasion}
                        onChange={(e) => setNewGift({...newGift, occasion: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className={themeStyles.primary}>Description</Label>
                      <Textarea 
                        placeholder="Describe the gift..." 
                        className={themeStyles.input}
                        value={newGift.description}
                        onChange={(e) => setNewGift({...newGift, description: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label className={themeStyles.primary}>Reaction</Label>
                      <Textarea 
                        placeholder="How did they react? How did it make you feel?" 
                        className={themeStyles.input}
                        value={newGift.reaction}
                        onChange={(e) => setNewGift({...newGift, reaction: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="favorite" 
                        checked={newGift.favorite}
                        onChange={(e) => setNewGift({...newGift, favorite: e.target.checked})}
                      />
                      <Label htmlFor="favorite" className={themeStyles.primary}>
                        Mark as favorite
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button type="submit" className={themeStyles.button} disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Gift Memory
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishlistItems.map(item => (
              <Card key={item.id} className={`${themeStyles.card} ${themeStyles.cardHover} transition-all`}>
                <CardHeader className={`${themeStyles.header} pb-2`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className={themeStyles.title}>{item.item}</CardTitle>
                      <CardDescription className={themeStyles.secondary}>
                        {getPriorityBadge(item.priority)}
                      </CardDescription>
                    </div>
                    {item.gifted && (
                      <Badge className="bg-green-500 text-white">Gifted</Badge>
                    )}
                    </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="mb-4">
                    <div className={`mb-2 ${themeStyles.primary}`}>
                      <span className="font-semibold">Surprise Level:</span> {item.surprise}%
                    </div>
                    {item.notes && (
                      <div className={`mt-3 p-3 italic rounded-md ${themeStyles.highlight}`}>
                        "{item.notes}"
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className={`${themeStyles.footer} pt-1 flex justify-between`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={themeStyles.buttonOutline}
                    onClick={() => markWishlistItemAsGifted(item.id)}
                    disabled={item.gifted}
                  >
                    <Gift className="mr-1 h-3 w-3" />
                    {item.gifted ? "Gifted" : "Mark as Gifted"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={themeStyles.buttonOutline}
                    onClick={() => deleteWishlistItem(item.id)}
                  >
                    <Trash className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <Card className={themeStyles.card}>
            <CardHeader>
              <CardTitle className={themeStyles.title}>Add to Wishlist</CardTitle>
              <CardDescription className={themeStyles.secondary}>
                Add something you'd love to receive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitWishlistItem}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className={themeStyles.primary}>Item</Label>
                      <Input 
                        placeholder="What would you like?" 
                        className={themeStyles.input}
                        value={newWishlistItem.item}
                        onChange={(e) => setNewWishlistItem({...newWishlistItem, item: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label className={themeStyles.primary}>Priority</Label>
                      <Select value={newWishlistItem.priority} onValueChange={(value) => setNewWishlistItem({...newWishlistItem, priority: value as any})}>
                        <SelectTrigger className={themeStyles.input}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MUST_HAVE">Must Have</SelectItem>
                          <SelectItem value="WOULD_LOVE">Would Love</SelectItem>
                          <SelectItem value="NICE_TO_HAVE">Nice to Have</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className={themeStyles.primary}>Surprise Level: {newWishlistItem.surprise}%</Label>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={newWishlistItem.surprise}
                        onChange={(e) => setNewWishlistItem({...newWishlistItem, surprise: parseInt(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className={themeStyles.primary}>Notes</Label>
                      <Textarea 
                        placeholder="Any specific details, links, or notes..." 
                        className={themeStyles.input}
                        value={newWishlistItem.notes}
                        onChange={(e) => setNewWishlistItem({...newWishlistItem, notes: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button type="submit" className={themeStyles.button} disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add to Wishlist
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Special Occasions Tab */}
        <TabsContent value="occasions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {occasions.map(occasion => (
              <Card key={occasion.id} className={`${themeStyles.card} ${themeStyles.cardHover} transition-all`}>
                <CardHeader className={`${themeStyles.header} pb-2`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className={themeStyles.title}>{occasion.title}</CardTitle>
                      <CardDescription className={themeStyles.secondary}>
                        {occasion.date} • {calculateDaysUntil(occasion.date) > 0 ? `${calculateDaysUntil(occasion.date)} days to go` : 'Today or past'}
                      </CardDescription>
                    </div>
                    {occasion.budget && (
                      <Badge className={themeStyles.buttonOutline}>
                        <DollarSign className="mr-1 h-3 w-3" />
                        ${occasion.budget}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  {occasion.suggestions.length > 0 && (
                    <div className="mb-4">
                      <h4 className={`font-semibold mb-2 ${themeStyles.primary}`}>Gift Ideas:</h4>
                      <ul className={`space-y-1 ${themeStyles.secondary}`}>
                        {occasion.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-center">
                            <Sparkles className="mr-2 h-3 w-3" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter className={`${themeStyles.footer} pt-1 flex justify-between`}>
                  <Badge variant={occasion.reminder ? "default" : "secondary"}>
                    {occasion.reminder ? "Reminder On" : "Reminder Off"}
                  </Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <Card className={themeStyles.card}>
            <CardHeader>
              <CardTitle className={themeStyles.title}>Add Special Occasion</CardTitle>
              <CardDescription className={themeStyles.secondary}>
                Plan ahead for important dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitOccasion}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className={themeStyles.primary}>Occasion</Label>
                      <Input 
                        placeholder="Birthday, Anniversary, etc." 
                        className={themeStyles.input}
                        value={newOccasion.title}
                        onChange={(e) => setNewOccasion({...newOccasion, title: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label className={themeStyles.primary}>Date</Label>
                      <Input 
                        type="date" 
                        className={themeStyles.input}
                        value={newOccasion.date}
                        onChange={(e) => setNewOccasion({...newOccasion, date: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label className={themeStyles.primary}>Budget</Label>
                      <Input 
                        type="number" 
                        placeholder="Optional budget" 
                        className={themeStyles.input}
                        value={newOccasion.budget}
                        onChange={(e) => setNewOccasion({...newOccasion, budget: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className={themeStyles.primary}>Gift Ideas</Label>
                      <Textarea 
                        placeholder="One idea per line..." 
                        className={themeStyles.input}
                        value={newOccasion.suggestions}
                        onChange={(e) => setNewOccasion({...newOccasion, suggestions: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="reminder" 
                        checked={newOccasion.reminder}
                        onChange={(e) => setNewOccasion({...newOccasion, reminder: e.target.checked})}
                      />
                      <Label htmlFor="reminder" className={themeStyles.primary}>
                        Set reminder
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button type="submit" className={themeStyles.button} disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Occasion
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Thoughtful Ideas Tab */}
        <TabsContent value="ideas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {thoughtfulIdeas.map(idea => (
              <Card key={idea.id} className={`${themeStyles.card} ${themeStyles.cardHover} transition-all`}>
                <CardHeader className={`${themeStyles.header} pb-2`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className={themeStyles.title}>{idea.title}</CardTitle>
                      <CardDescription className={themeStyles.secondary}>
                        <Badge variant="outline">{idea.type}</Badge>
                        {idea.targetDate && (
                          <span className="ml-2">Target: {idea.targetDate}</span>
                        )}
                      </CardDescription>
                    </div>
                    {idea.completed && (
                      <Badge className="bg-green-500 text-white">Completed</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className={`mb-4 ${themeStyles.primary}`}>{idea.description}</p>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${themeStyles.secondary}`}>
                        Progress: {idea.progress}%
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={themeStyles.buttonOutline}
                        onClick={() => updateIdeaProgress(idea.id, Math.min(idea.progress + 10, 100))}
                      >
                        +10%
                      </Button>
                    </div>
                    <Progress value={idea.progress} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className={themeStyles.card}>
            <CardHeader>
              <CardTitle className={themeStyles.title}>Add Thoughtful Idea</CardTitle>
              <CardDescription className={themeStyles.secondary}>
                Plan a meaningful gift or experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitIdea}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className={themeStyles.primary}>Title</Label>
                      <Input 
                        placeholder="What's your idea?" 
                        className={themeStyles.input}
                        value={newIdea.title}
                        onChange={(e) => setNewIdea({...newIdea, title: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label className={themeStyles.primary}>Type</Label>
                      <Select value={newIdea.type} onValueChange={(value) => setNewIdea({...newIdea, type: value as any})}>
                        <SelectTrigger className={themeStyles.input}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DIY">DIY</SelectItem>
                          <SelectItem value="EXPERIENCE">Experience</SelectItem>
                          <SelectItem value="INTIMATE">Intimate</SelectItem>
                          <SelectItem value="PERSONALIZED">Personalized</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className={themeStyles.primary}>Target Date</Label>
                      <Input 
                        type="date" 
                        className={themeStyles.input}
                        value={newIdea.targetDate}
                        onChange={(e) => setNewIdea({...newIdea, targetDate: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className={themeStyles.primary}>Description</Label>
                      <Textarea 
                        placeholder="Describe your idea in detail..." 
                        className={themeStyles.input}
                        value={newIdea.description}
                        onChange={(e) => setNewIdea({...newIdea, description: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button type="submit" className={themeStyles.button} disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Idea
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Secret Plans Tab */}
        <TabsContent value="secret" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {secretPlans.map(plan => (
              <Card key={plan.id} className={`${themeStyles.card} ${themeStyles.cardHover} transition-all`}>
                <CardHeader className={`${themeStyles.header} pb-2`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className={`${themeStyles.title} flex items-center`}>
                        <LockIcon className="mr-2 h-4 w-4" />
                        {plan.title}
                      </CardTitle>
                      <CardDescription className={themeStyles.secondary}>
                        {plan.targetDate && `Target: ${plan.targetDate}`}
                        {plan.budget && (
                          <Badge className={`ml-2 ${themeStyles.buttonOutline}`}>
                            <DollarSign className="mr-1 h-3 w-3" />
                            ${plan.budget}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  {plan.description && (
                    <p className={`mb-4 ${themeStyles.primary}`}>{plan.description}</p>
                  )}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${themeStyles.secondary}`}>
                        Progress: {plan.progress}%
                      </span>
                    </div>
                    <Progress value={plan.progress} className="w-full" />
                  </div>
                  
                  {getItemsForSecretPlan(plan.id).length > 0 && (
                    <div className="mt-4">
                      <h4 className={`font-semibold mb-2 ${themeStyles.primary}`}>Tasks:</h4>
                      <ul className={`space-y-1 ${themeStyles.secondary}`}>
                        {getItemsForSecretPlan(plan.id).map((item, index) => (
                          <li key={index} className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={item.completed}
                              onChange={() => {/* Handle task toggle */}}
                              className="mr-2"
                            />
                            <span className={item.completed ? "line-through opacity-50" : ""}>
                              {item.item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className={themeStyles.card}>
            <CardHeader>
              <CardTitle className={`${themeStyles.title} flex items-center`}>
                <LockIcon className="mr-2 h-4 w-4" />
                Create Secret Plan
              </CardTitle>
              <CardDescription className={themeStyles.secondary}>
                Plan something special in secret
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitSecretPlan}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className={themeStyles.primary}>Plan Title</Label>
                      <Input 
                        placeholder="What's your secret plan?" 
                        className={themeStyles.input}
                        value={newSecretPlan.title}
                        onChange={(e) => setNewSecretPlan({...newSecretPlan, title: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label className={themeStyles.primary}>Budget</Label>
                      <Input 
                        type="number" 
                        placeholder="Optional budget" 
                        className={themeStyles.input}
                        value={newSecretPlan.budget}
                        onChange={(e) => setNewSecretPlan({...newSecretPlan, budget: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label className={themeStyles.primary}>Target Date</Label>
                      <Input 
                        type="date" 
                        className={themeStyles.input}
                        value={newSecretPlan.targetDate}
                        onChange={(e) => setNewSecretPlan({...newSecretPlan, targetDate: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className={themeStyles.primary}>Description</Label>
                      <Textarea 
                        placeholder="Secret plan details..." 
                        className={themeStyles.input}
                        value={newSecretPlan.description}
                        onChange={(e) => setNewSecretPlan({...newSecretPlan, description: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button type="submit" className={themeStyles.button} disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Secret Plan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFavoriteGifts().map(gift => (
              <Card key={gift.id} className={`${themeStyles.card} ${themeStyles.cardHover} transition-all`}>
                <CardHeader className={`${themeStyles.header} pb-2`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className={`${themeStyles.title} flex items-center`}>
                        <Heart className="mr-2 h-4 w-4 fill-current text-red-500" />
                        {gift.giftName}
                      </CardTitle>
                      <CardDescription className={themeStyles.secondary}>
                        {gift.date} • {gift.occasion}
                      </CardDescription>
                    </div>
                    <Star className="h-5 w-5 fill-current text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className={`mb-2 ${themeStyles.primary}`}>
                    <span className="font-semibold">Description:</span> {gift.description}
                  </p>
                  {gift.reaction && (
                    <div className={`mt-3 p-3 italic rounded-md ${themeStyles.highlight}`}>
                      "{gift.reaction}"
                    </div>
                  )}
                </CardContent>
                <CardFooter className={`${themeStyles.footer} pt-1 flex justify-between`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={themeStyles.buttonOutline}
                    onClick={() => toggleGiftFavorite(gift.id)}
                  >
                    <Heart className="mr-1 h-3 w-3 fill-current" />
                    Unfavorite
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {getFavoriteGifts().length === 0 && (
            <Card className={themeStyles.card}>
              <CardContent className="text-center py-8">
                <Heart className={`mx-auto h-12 w-12 mb-4 ${themeStyles.accent}`} />
                <p className={`text-lg font-medium ${themeStyles.title}`}>No favorite gifts yet</p>
                <p className={themeStyles.secondary}>
                  Mark gifts as favorites to see them here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}