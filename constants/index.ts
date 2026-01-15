import { Heart, Star, LucideIcon, Gift, Film } from 'lucide-react'

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: string;
  reminder: boolean;
  icon?: LucideIcon;
  gradient?: string;
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  mediaUrls: string[];
  album: string;
  isFavorite: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  relationshipId: string;
  gradient?: string;
}

export const FIELD_NAMES = {
    fullName: "Full name",
    email: "Email",
    password: "Password",
  };
  
  export const FIELD_TYPES = {
    fullName: "text",
    email: "email",
    password: "password",
  };

  export const mockMemories: Memory[] = [
    {
      id: "1",
      title: "Beach Day",
      description: "Our day at the beach last summer. The waves, the sunset, and your smile made it perfect.",
      date: "2024-07-15",
      mediaUrls: ["/placeholder.svg?height=300&width=400&text=Beach+Day"],
      album: "Vacations",
      isFavorite: true,
      isSaved: false,
      createdAt: "2024-07-15T10:00:00Z",
      updatedAt: "2024-07-15T10:00:00Z",
      creatorId: "user1",
      relationshipId: "rel1",
      gradient: "from-cyan-400 via-blue-500 to-purple-600"
    },
    {
      id: "2", 
      title: "Dinner Date",
      description: "Anniversary dinner at our favorite restaurant. Candlelight, wine, and your eyes across the table.",
      date: "2025-02-14",
      mediaUrls: ["/placeholder.svg?height=300&width=400&text=Dinner+Date"],
      album: "Special Occasions",
      isFavorite: true,
      isSaved: true,
      createdAt: "2025-02-14T19:00:00Z",
      updatedAt: "2025-02-14T19:00:00Z",
      creatorId: "user1",
      relationshipId: "rel1",
      gradient: "from-pink-500 via-red-500 to-orange-500"
    },
    {
      id: "3",
      title: "Hiking Adventure",
      description: "Beautiful views from our weekend hike. Reaching the summit together felt symbolic of our journey.",
      date: "2025-01-20",
      mediaUrls: ["/placeholder.svg?height=300&width=400&text=Hiking+Trip"],
      album: "Adventures",
      isFavorite: false,
      isSaved: false,
      createdAt: "2025-01-20T08:00:00Z",
      updatedAt: "2025-01-20T08:00:00Z",
      creatorId: "user1",
      relationshipId: "rel1",
      gradient: "from-emerald-400 via-teal-500 to-green-600"
    },
    {
      id: "4",
      title: "Movie Night",
      description: "Cozy night watching our favorite films. Your laughter during the funny scenes is my favorite sound.",
      date: "2025-03-05",
      mediaUrls: ["/placeholder.svg?height=300&width=400&text=Movie+Night"],
      album: "Everyday Moments",
      isFavorite: false,
      isSaved: true,
      createdAt: "2025-03-05T20:00:00Z",
      updatedAt: "2025-03-05T20:00:00Z",
      creatorId: "user1",
      relationshipId: "rel1",
      gradient: "from-indigo-500 via-purple-600 to-pink-500"
    },
    {
      id: "5",
      title: "Concert Night",
      description: "Amazing live music experience together. Dancing with you in the crowd, feeling the bass and your heartbeat.",
      date: "2024-12-10",
      mediaUrls: ["/placeholder.svg?height=300&width=400&text=Concert"],
      album: "Entertainment",
      isFavorite: true,
      isSaved: false,
      createdAt: "2024-12-10T21:00:00Z",
      updatedAt: "2024-12-10T21:00:00Z",
      creatorId: "user1",
      relationshipId: "rel1",
      gradient: "from-purple-600 via-pink-600 to-red-500"
    },
    {
      id: "6",
      title: "Cooking Together",
      description: "Making our favorite pasta recipe. Flour on your nose, wine in our glasses, and love in the air.",
      date: "2025-03-01",
      mediaUrls: ["/placeholder.svg?height=300&width=400&text=Cooking"],
      album: "Everyday Moments",
      isFavorite: false,
      isSaved: true,
      createdAt: "2025-03-01T18:00:00Z",
      updatedAt: "2025-03-01T18:00:00Z",
      creatorId: "user1",
      relationshipId: "rel1",
      gradient: "from-amber-400 via-orange-500 to-red-500"
    }
  ];

export  const events = [
      {
        id: 1,
        title: "Anniversary",
        description: "Our special day",
        date: "2025-03-15",
        time: "18:00",
        type: "Anniversary",
        reminder: true,
        icon: Heart,
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
        icon: Gift,
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
        icon: Star,
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
        icon: Film,
        gradient: "from-fuchsia-500 to-purple-600",
      },
    ]
  
export  const giftHistory = [
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
    ]
  
export  const wishlist = [
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
    ]
     
export const occasions = [
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
      ]
    
export const thoughtfulIdeas = [
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
      ]