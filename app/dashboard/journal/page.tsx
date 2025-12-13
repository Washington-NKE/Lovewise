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
import { Plus, Heart, Calendar, Lock, Bookmark, Eye, EyeOff, Sparkles, Loader2, Trash, MoreVertical, Edit, X } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { 
  getJournalEntries, 
  getSharedJournalEntries, 
  getPrivateJournalEntries, 
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  type JournalEntry as DbJournalEntry 
} from "@/database/db"
import { useSession } from "next-auth/react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"

// Enhanced JournalEntry interface with UI properties
interface JournalEntry extends DbJournalEntry {
  emoji: string;
  bgColor: string;
  isLiked?: boolean;
  likeCount?: number;
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
    bgColor: getBgColorForEntry(dbEntry.mood, dbEntry.createdAt),
    isLiked: false, // You can implement this with a separate likes table
    likeCount: 0
  };
}

export default function JournalPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
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
      let dbEntries: DbJournalEntry[] = [];
      
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
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  // Load all entries on component mount
  useEffect(() => {
    loadEntries(activeTab as 'all' | 'shared' | 'private');
  }, [activeTab]);

  // Handle form submission for creating new entries
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in both title and content');
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
      await loadEntries(activeTab as 'all' | 'shared' | 'private');
      toast.success('Journal entry created successfully!');
      setShowCreateForm(false);
    } catch (error) {
      toast.error('Failed to create journal entry');
    } finally {
      setCreating(false);
    }
  };

  // Handle editing an entry
  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      mood: entry.mood || '',
      isPrivate: entry.isPrivate
    });
    setShowEditForm(true);
  };

  // Handle updating an entry
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry || !formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    try {
      setCreating(true);
      await updateJournalEntry(editingEntry.id, formData);
      
      // Reload entries
      await loadEntries(activeTab as 'all' | 'shared' | 'private');
      toast.success('Journal entry updated successfully!');
      setShowEditForm(false);
      setEditingEntry(null);
    } catch (error) {
      toast.error('Failed to update journal entry');
    } finally {
      setCreating(false);
    }
  };

  // Handle deleting an entry
  const handleDelete = async (id: string) => {
    try {
      await deleteJournalEntry(id);
      await loadEntries(activeTab as 'all' | 'shared' | 'private');
      toast.success('Journal entry deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete journal entry');
    }
  };

  // Handle liking an entry
  const handleLike = (entryId: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { 
            ...entry, 
            isLiked: !entry.isLiked,
            likeCount: entry.isLiked ? (entry.likeCount || 0) - 1 : (entry.likeCount || 0) + 1
          }
        : entry
    ));
    
    // Here you would typically save the like status to your database
    toast.success('Like status updated!');
  };

  // Handle "Relive This Moment" button
  const handleReliveThisMoment = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowEntryModal(true);
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 rounded-full p-1 bg-pink-100 dark:bg-gray-800">
          <TabsTrigger 
            value="all" 
            className="rounded-full data-[state=active]:bg-pink-500 data-[state=active]:text-white transition-all duration-300"
          >
            All Entries
          </TabsTrigger>
          <TabsTrigger 
            value="shared" 
            className="rounded-full data-[state=active]:bg-pink-500 data-[state=active]:text-white transition-all duration-300"
          >
            <Heart className="h-4 w-4 mr-1" /> Shared
          </TabsTrigger>
          <TabsTrigger 
            value="private" 
            className="rounded-full data-[state=active]:bg-pink-500 data-[state=active]:text-white transition-all duration-300"
          >
            <Lock className="h-4 w-4 mr-1" /> Private
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <JournalEntryGrid 
            entries={entries} 
            loading={loading} 
            hoveredCard={hoveredCard} 
            setHoveredCard={setHoveredCard}
            onLike={handleLike}
            onRelive={handleReliveThisMoment}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
        
        <TabsContent value="shared" className="mt-6">
          <JournalEntryGrid 
            entries={entries.filter(e => !e.isPrivate)} 
            loading={loading} 
            hoveredCard={hoveredCard} 
            setHoveredCard={setHoveredCard}
            onLike={handleLike}
            onRelive={handleReliveThisMoment}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
        
        <TabsContent value="private" className="mt-6">
          <JournalEntryGrid 
            entries={entries.filter(e => e.isPrivate)} 
            loading={loading} 
            hoveredCard={hoveredCard} 
            setHoveredCard={setHoveredCard}
            onLike={handleLike}
            onRelive={handleReliveThisMoment}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      {/* Create Form Modal */}
      {showCreateForm && (
        <FormModal
          title="Create New Journal Entry"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowCreateForm(false)}
          creating={creating}
          isEditing={false}
        />
      )}

      {/* Edit Form Modal */}
      {showEditForm && editingEntry && (
        <FormModal
          title="Edit Journal Entry"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdate}
          onClose={() => {
            setShowEditForm(false);
            setEditingEntry(null);
          }}
          creating={creating}
          isEditing={true}
        />
      )}

      {/* Entry Detail Modal */}
      {showEntryModal && selectedEntry && (
        <EntryDetailModal
          entry={selectedEntry}
          onClose={() => {
            setShowEntryModal(false);
            setSelectedEntry(null);
          }}
        />
      )}
    </div>
  );
}

// Form Modal Component
function FormModal({
  title,
  formData,
  setFormData,
  onSubmit,
  onClose,
  creating,
  isEditing
}: {
  title: string;
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  creating: boolean;
  isEditing: boolean;
}) {
  return (
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
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
          <div className="absolute right-0 top-0 h-16 w-16">
            <div className="absolute transform rotate-45 bg-pink-500 text-white font-semibold py-1 right-[-35px] top-[32px] w-[170px] text-center">
              {isEditing ? 'Edit' : 'New Memory'}
            </div>
          </div>
          <CardHeader className="pb-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white">
            <CardTitle className="text-xl flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              {title}
            </CardTitle>
            <CardDescription className="text-pink-100">
              {isEditing ? 'Update your special moment' : 'Capture your special moments together'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
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
                    {isEditing ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  isEditing ? 'Update This Memory' : 'Save This Memory'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

// Entry Detail Modal Component
function EntryDetailModal({
  entry,
  onClose
}: {
  entry: JournalEntry;
  onClose: () => void;
}) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="overflow-hidden border-2 border-pink-200 dark:border-pink-800 shadow-lg">
          <div className={`h-2 ${entry.bgColor}`}></div>
          <CardHeader className="pb-4 relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-4xl">{entry.emoji}</div>
              <div>
                <CardTitle className="text-2xl text-pink-700 dark:text-pink-300 mb-2">{entry.title}</CardTitle>
                <CardDescription className="flex items-center text-base">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(entry.createdAt)}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {entry.isPrivate ? (
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-300 flex items-center">
                  <Lock className="h-4 w-4 mr-1" /> Private Memory
                </div>
              ) : (
                <div className="rounded-full bg-pink-100 dark:bg-pink-900 px-3 py-1 text-sm font-medium text-pink-600 dark:text-pink-300 flex items-center">
                  <Heart className="h-4 w-4 mr-1" /> Shared Memory
                </div>
              )}
              {entry.mood && (
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                  {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="prose prose-pink dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
          </CardContent>
          <CardFooter className={`${entry.bgColor.replace('bg-gradient-to-br', 'bg-gradient-to-r')} bg-opacity-20 dark:bg-opacity-30 p-6`}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  💕 A beautiful memory to cherish forever
                </div>
              </div>
              <Button 
                onClick={onClose}
                className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-pink-600 hover:text-pink-700 border-0 shadow-sm"
              >
                Close
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

function JournalEntryGrid({ 
  entries, 
  loading, 
  hoveredCard, 
  setHoveredCard,
  onLike,
  onRelive,
  onEdit,
  onDelete
}: { 
  entries: JournalEntry[]; 
  loading: boolean; 
  hoveredCard: string | null; 
  setHoveredCard: (id: string | null) => void;
  onLike: (id: string) => void;
  onRelive: (entry: JournalEntry) => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
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
          onLike={onLike}
          onRelive={onRelive}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  );
}

function JournalEntryCard({ 
  entry, 
  isHovered, 
  onHover, 
  onLeave, 
  onLike, 
  onRelive, 
  onEdit, 
  onDelete 
}: { 
  entry: JournalEntry;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onLike: (id: string) => void;
  onRelive: (entry: JournalEntry) => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
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
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className={`p-2 hover:bg-white/30 transition-colors ${
                  entry.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                }`}
                onClick={() => onLike(entry.id)}
              >
                <Heart className={`h-4 w-4 ${entry.isLiked ? 'fill-current' : ''}`} />
                {entry.likeCount && entry.likeCount > 0 && (
                  <span className="ml-1 text-xs">{entry.likeCount}</span>
                )}
              </Button>
            </motion.div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onRelive(entry)}
              className={`border-0 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all duration-200 ${
                entry.isPrivate ? 'text-purple-600 hover:text-purple-700' : 'text-pink-600 hover:text-pink-700'
              }`}
            >
              {isHovered ? "Relive This Moment" : "Read More"}
            </Button>
          </div>
          
          {isOwner && (
            <EntryActionsMenu entry={entry} onEdit={onEdit} onDelete={onDelete} />
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
        <Button variant="ghost" size="sm" className="hover:bg-white/30">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(entry)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()}
              className="text-red-600 focus:text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this memory?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete "{entry.title}" and remove it from your journal.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete(entry.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Memory
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}