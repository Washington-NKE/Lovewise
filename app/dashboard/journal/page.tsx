"use client"

import React, { useState, useEffect } from "react"
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
import { toast} from 'sonner'
import { Plus, Heart, Calendar, Lock, Bookmark, Eye, EyeOff, Sparkles, Loader2, Trash, MoreVertical, Edit } from 'lucide-react'
import { motion } from "framer-motion"
import { 
  getJournalEntries, 
  getSharedJournalEntries, 
  getPrivateJournalEntries, 
  createJournalEntry,
  type JournalEntry as DbJournalEntry 
} from "@/database/db"
import { useSession } from "next-auth/react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Enhanced JournalEntry interface with UI properties
interface JournalEntry extends DbJournalEntry {
  emoji: string;
  bgColor: string;
}

// Utility function to get emoji based on mood/content
function getEmojiForEntry(mood?: string | null, content?: string): string {
  if (mood) {
    const moodEmojis: { [key: string]: string } = {
      'happy': '😊',
      'love': '💕',
      'excited': '🎉',
      'romantic': '💖',
      'peaceful': '🌸',
      'grateful': '🙏',
      'nostalgic': '🌅',
      'dreamy': '✨',
      'content': '😌',
      'passionate': '🔥',
    };
    return moodEmojis[mood.toLowerCase()] || '💭';
  }
  
  // Fallback to content-based emoji selection
  const contentLower = content?.toLowerCase() || '';
  if (contentLower.includes('beach') || contentLower.includes('ocean')) return '🌊';
  if (contentLower.includes('future') || contentLower.includes('dream')) return '✨';
  if (contentLower.includes('anniversary') || contentLower.includes('celebrate')) return '💖';
  if (contentLower.includes('travel') || contentLower.includes('trip')) return '✈️';
  if (contentLower.includes('date') || contentLower.includes('dinner')) return '🍽️';
  if (contentLower.includes('home') || contentLower.includes('cozy')) return '🏠';
  if (contentLower.includes('gift') || contentLower.includes('surprise')) return '🎁';
  if (contentLower.includes('nature') || contentLower.includes('walk')) return '🌿';
  
  return '💭'; // Default
}

// Utility function to get background color based on mood/content
function getBgColorForEntry(mood?: string | null, createdAt?: Date): string {
  const colors = [
    "bg-gradient-to-br from-rose-400 to-pink-500",
    "bg-gradient-to-br from-violet-400 to-indigo-500",
    "bg-gradient-to-br from-amber-400 to-red-500",
    "bg-gradient-to-br from-emerald-400 to-teal-500",
    "bg-gradient-to-br from-blue-400 to-purple-500",
    "bg-gradient-to-br from-pink-400 to-rose-500",
    "bg-gradient-to-br from-orange-400 to-red-500",
    "bg-gradient-to-br from-teal-400 to-blue-500",
    "bg-gradient-to-br from-purple-400 to-pink-500",
    "bg-gradient-to-br from-cyan-400 to-blue-500",
  ];
  
  if (mood) {
    const moodColors: { [key: string]: string } = {
      'happy': "bg-gradient-to-br from-yellow-400 to-orange-500",
      'love': "bg-gradient-to-br from-pink-400 to-red-500",
      'excited': "bg-gradient-to-br from-orange-400 to-red-500",
      'romantic': "bg-gradient-to-br from-rose-400 to-pink-500",
      'peaceful': "bg-gradient-to-br from-green-400 to-teal-500",
      'grateful': "bg-gradient-to-br from-amber-400 to-yellow-500",
      'nostalgic': "bg-gradient-to-br from-purple-400 to-indigo-500",
      'dreamy': "bg-gradient-to-br from-violet-400 to-purple-500",
      'content': "bg-gradient-to-br from-blue-400 to-cyan-500",
      'passionate': "bg-gradient-to-br from-red-400 to-rose-500",
    };
    return moodColors[mood.toLowerCase()] || colors[0];
  }
  
  // Use date-based selection for consistent colors
  if (createdAt) {
    const dateIndex = new Date(createdAt).getDate() % colors.length;
    return colors[dateIndex];
  }
  
  return colors[0];
}

// Transform database entries to UI entries
function transformDbEntryToUiEntry(dbEntry: DbJournalEntry): JournalEntry {
  return {
    ...dbEntry,
    emoji: getEmojiForEntry(dbEntry.mood, dbEntry.content),
    bgColor: getBgColorForEntry(dbEntry.mood, dbEntry.createdAt)
  };
}

export default function JournalPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: '',
    isPrivate: false
  });
  
  // Load entries based on active tab
  const loadEntries = async (filter: 'all' | 'shared' | 'private' = 'all') => {
    try {
      setLoading(true);
      let dbEntries: JournalEntry[] = [];
      
      switch (filter) {
        case 'shared':
          dbEntries = await getSharedJournalEntries();
          break;
        case 'private':
          dbEntries = await getPrivateJournalEntries();
          break;
        default:
          dbEntries = await getJournalEntries();
      }
      
      const transformedEntries = dbEntries.map(transformDbEntryToUiEntry);
      setEntries(transformedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
      toast(
        <div>
          <strong>Error</strong>
          <div>Failed to load journal entries</div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  // Load all entries on component mount
  useEffect(() => {
    loadEntries('all');
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast(
        <div>
          <strong>Error</strong>
          <div>Please fill in both title and content</div>
        </div>
      );
      return;
    }

    try {
      setCreating(true);
      await createJournalEntry(formData);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        mood: '',
        isPrivate: false
      });
      
      // Reload entries
      await loadEntries('all');
      toast(
        <div>
          <strong>Success</strong>
          <div>Journal entry created successfully!</div>
        </div>
      );
      setShowCreateForm(false);
    } catch (error) {
      toast(
        <div>
          <strong>Error</strong>
          <div>Failed to create journal entry</div>
        </div>
      );
    } finally {
      setCreating(false);
    }
  };

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
          <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-white text-pink-600 hover:bg-pink-100 hover:text-pink-700 transition-all duration-300 shadow-md"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Memory
        </Button>
      </motion.div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 rounded-full p-1 bg-pink-100 dark:bg-gray-800">
          <TabsTrigger 
            value="all" 
            className="rounded-full data-[state=active]:bg-pink-500 data-[state=active]:text-white transition-all duration-300"
            onClick={() => loadEntries('all')}
          >
            All Entries
          </TabsTrigger>
          <TabsTrigger 
            value="shared" 
            className="rounded-full data-[state=active]:bg-pink-500 data-[state=active]:text-white transition-all duration-300"
            onClick={() => loadEntries('shared')}
          >
            <Heart className="h-4 w-4 mr-1" /> Shared
          </TabsTrigger>
          <TabsTrigger 
            value="private" 
            className="rounded-full data-[state=active]:bg-pink-500 data-[state=active]:text-white transition-all duration-300"
            onClick={() => loadEntries('private')}
          >
            <Lock className="h-4 w-4 mr-1" /> Private
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <JournalEntryGrid entries={entries} loading={loading} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />
        </TabsContent>
        
        <TabsContent value="shared" className="mt-6">
          <JournalEntryGrid entries={entries.filter(e => !e.isPrivate)} loading={loading} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />
        </TabsContent>
        
        <TabsContent value="private" className="mt-6">
          <JournalEntryGrid entries={entries.filter(e => e.isPrivate)} loading={loading} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />
        </TabsContent>
      </Tabs>
{showCreateForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-2xl"
    >
      <Card className="overflow-hidden border-2 border-pink-200 dark:border-pink-800 shadow-lg relative">
            <button 
              onClick={() => setShowCreateForm(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-pink-600 dark:text-pink-300 font-medium flex items-center">
                  <Bookmark className="h-4 w-4 mr-1" /> Title
                </Label>
                <Input 
                  id="title" 
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give your memory a title..." 
                  className="border-pink-200 focus:border-pink-500 focus:ring-pink-500 transition-all duration-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-pink-600 dark:text-pink-300 font-medium flex items-center">
                  <Heart className="h-4 w-4 mr-1" /> Your Memory
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write about your special moment together..."
                  className="min-h-[200px] border-pink-200 focus:border-pink-500 focus:ring-pink-500 transition-all duration-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mood" className="text-pink-600 dark:text-pink-300 font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> Mood
                </Label>
                <Select value={formData.mood} onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}>
                  <SelectTrigger id="mood" className="border-pink-200 focus:border-pink-500 focus:ring-pink-500">
                    <SelectValue placeholder="How are you feeling about this memory?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">😊 Happy</SelectItem>
                    <SelectItem value="love">💕 In Love</SelectItem>
                    <SelectItem value="excited">🎉 Excited</SelectItem>
                    <SelectItem value="romantic">💖 Romantic</SelectItem>
                    <SelectItem value="peaceful">🌸 Peaceful</SelectItem>
                    <SelectItem value="grateful">🙏 Grateful</SelectItem>
                    <SelectItem value="nostalgic">🌅 Nostalgic</SelectItem>
                    <SelectItem value="dreamy">✨ Dreamy</SelectItem>
                    <SelectItem value="content">😌 Content</SelectItem>
                    <SelectItem value="passionate">🔥 Passionate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-pink-50 dark:bg-gray-800">
                <Switch 
                  id="private" 
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
                  className="data-[state=checked]:bg-purple-500" 
                />
                <Label htmlFor="private" className="flex items-center cursor-pointer">
                  <Lock className="h-4 w-4 mr-1 text-purple-500" />
                  <span className="text-purple-700 dark:text-purple-300 font-medium">Make this entry private</span>
                </Label>
              </div>
            </CardContent>
            <CardFooter className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-4">
              <Button 
                type="submit"
                disabled={creating}
                className="ml-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-md transition-all duration-300"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save This Memory'
                )}
              </Button>
            </CardFooter>
          </form>
      </Card>
    </motion.div>
  </div>
)}

    </div>
  );
}


function JournalEntryGrid({ 
  entries, 
  loading, 
  hoveredCard, 
  setHoveredCard 
}: { 
  entries: JournalEntry[]; 
  loading: boolean; 
  hoveredCard: string | null; 
  setHoveredCard: (id: string | null) => void; 
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your memories...</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 text-pink-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No memories yet</h3>
        <p className="text-muted-foreground">Start creating beautiful memories together!</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
      }}
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
  );
}

function JournalEntryCard({ entry, isHovered, onHover, onLeave }: { 
  entry: JournalEntry;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const session = useSession();
  const isOwner = session.data?.user?.id === entry.userId;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Placeholder handlers for edit and delete actions
  const handleEdit = (entry: JournalEntry) => {
    toast(
      <div>
        <strong>Not implemented</strong>
        <div>Edit functionality is coming soon!</div>
      </div>
    );
  };

  const handleDelete = (id: string) => {
    toast(
      <div>
        <strong>Not implemented</strong>
        <div>Delete functionality is coming soon!</div>
      </div>
    );
  };

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
            <CardTitle className="text-lg text-pink-700 dark:text-pink-300 line-clamp-1">{entry.title}</CardTitle>
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
            <Calendar className="h-3 w-3 mr-1" /> {formatDate(entry.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-4 text-sm text-muted-foreground">
            {entry.content}
          </p>
        </CardContent>
 <CardFooter className={`flex justify-between items-center gap-2 p-3 ${entry.bgColor.replace('bg-gradient-to-br', 'bg-gradient-to-r')} bg-opacity-20 dark:bg-opacity-30`}>
  <div className="flex items-center gap-2">
    <Button variant="ghost" size="sm" className="p-2 hover:bg-white/30">
      <Heart className="h-4 w-4" />
    </Button>
    
    <Button 
      variant="outline" 
      size="sm" 
      className={`border-0 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 shadow-sm ${
        entry.isPrivate ? 'text-purple-600 hover:text-purple-700' : 'text-pink-600 hover:text-pink-700'
      }`}
    >
      {isHovered ? "Relive This Moment" : "Read More"}
    </Button>
  </div>
  
  {isOwner && (
    <EntryActionsMenu entry={entry} onEdit={handleEdit} onDelete={handleDelete} />
  )}
</CardFooter>
      </Card>
    </motion.div>
  );
}

function EntryActionsMenu({ entry, onEdit, onDelete }: {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(entry)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(entry.id)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}