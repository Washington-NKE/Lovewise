
"use client"

import React, { useState, useEffect, useCallback } from "react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, Plus, Camera, Star, Bookmark, Clock, Film, Image, Sparkles, Upload, X, Loader2, Edit, Trash2, MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { toast } from 'sonner'

// Import database functions
import {
  Memory,
  NewMemoryData,
  getMemoriesByRelationship,
  getAlbumsByRelationship,
  createMemory,
  updateMemory,
  deleteMemory,
  toggleMemoryFavorite,
  toggleMemorySaved,
  getRandomGradient,
  getRelationshipId,
} from "@/database/db"
import { useSession } from "next-auth/react"

// Cloudinary upload function
const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'lovewise_media');
  formData.append('folder', 'lovewise')
  
  const response = await fetch('https://api.cloudinary.com/v1_1/dovexmz4r/image/upload', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(err?.error || 'Upload to Cloudinary failed')
  }

  const data = await response.json();
  return data.secure_url;
};

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [albums, setAlbums] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isFileDragging, setIsFileDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [relationshipId, setRelationshipId] = useState<string | null>(null); 
  const [viewingMemory, setViewingMemory] = useState<Memory | null>(null);

  const { data: session} = useSession();

  const currentUserId = session?.user?.id;
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    album: '',
    isFavorite: false,
    location: ''
  });

  // Load user's relationship and then memories
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🔍 Fetching user's active relationship...");
        
        // First get the user's active relationship ID
        const userRelationshipId = await getRelationshipId();
        
        if (!userRelationshipId) {
          console.log("⚠️ No active relationship found for user");
          setError("No active relationship found. Please create or join a relationship first.");
          toast.error('No active relationship found');
          return;
        }
        
        console.log("✅ Found relationship ID:", userRelationshipId);
        setRelationshipId(userRelationshipId);
        
        // Load memories and albums for this relationship
        const [memoriesData, albumsData] = await Promise.all([
          getMemoriesByRelationship(userRelationshipId),
          getAlbumsByRelationship(userRelationshipId)
        ]);
        
        console.log("📊 Loaded memories:", memoriesData);
        console.log("📁 Loaded albums:", albumsData);
        
        setMemories(memoriesData);
        setAlbums(albumsData);
        
        if (memoriesData.length === 0) {
          console.log("💡 No memories found - user can create their first memory");
        }
        
      } catch (err) {
        console.error('❌ Error loading user data:', err);
        setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        toast.error('Failed to load memories');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // File upload handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsFileDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
    setUploadedFiles(prev => [...prev, ...imageFiles]);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        <p className="mt-2 text-gray-600">Loading your relationship...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-red-500 text-lg font-semibold mb-2">Unable to Load Memories</div>
        <div className="text-gray-600 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()} className="bg-pink-500 hover:bg-pink-600">
          Try Again
        </Button>
      </div>
    );
  }

  // Show no relationship state
  if (!relationshipId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-gray-500 text-lg font-semibold mb-2">No Active Relationship</div>
        <div className="text-gray-400 mb-4">
          You need to be in an active relationship to create and view memories.
        </div>
        <Button className="bg-pink-500 hover:bg-pink-600">
          Create or Join Relationship
        </Button>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory);
    setFormData({
      title: memory.title,
      description: memory.description,
      album: memory.album || '',
      isFavorite: memory.isFavorite,
      location: memory.location || ''
    });
    setUploadedFiles([]);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
  
    try {
      let mediaUrls: string[] = [];
      
      // Only upload if there are files
      if (uploadedFiles.length > 0) {
        const uploadResults = await Promise.allSettled(
          uploadedFiles.map(file => uploadToCloudinary(file))
        );
        const successUrls = uploadResults
          .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
          .map(r => r.value);
        const failedCount = uploadResults.filter(r => r.status === 'rejected').length;
        mediaUrls = successUrls;
        if (failedCount > 0) {
          toast.error(`${failedCount} file(s) failed to upload`);
        }
      }

      if (editingMemory) {
        // Update existing memory
        const updatedMemoryData: Partial<NewMemoryData> = {
          title: formData.title,
          description: formData.description,
          album: formData.album || 'Uncategorized',
          isFavorite: formData.isFavorite,
          location: formData.location || undefined
        };

        // Only update media URLs if new files were uploaded
        if (uploadedFiles.length > 0) {
          updatedMemoryData.mediaUrls = mediaUrls;
        }

        const updatedMemory = await updateMemory(editingMemory.id, updatedMemoryData);
        
        // Update memory in state
        setMemories(prev => 
          prev.map(memory => 
            memory.id === editingMemory.id 
              ? { ...updatedMemory, gradient: memory.gradient || updatedMemory.gradient }
              : memory
          )
        );
        setEditingMemory(null);
        toast.success('Memory updated successfully!');
      } else {
        if (!currentUserId) {
          toast.error('Not authenticated');
          return;
        }
        const newMemoryData: NewMemoryData = {
          title: formData.title,
          description: formData.description,
          album: formData.album || 'Uncategorized',
          mediaUrls, 
          isFavorite: formData.isFavorite,
          relationshipId,
          creatorId: currentUserId,
          location: formData.location || undefined
        };

        const newMemory = await createMemory(newMemoryData);
        
        // Add new memory to state
        setMemories(prev => [newMemory, ...prev]);
        toast.success('Memory created successfully!');
      }

      // Update albums if new album was added
      if (formData.album && !albums.includes(formData.album)) {
        setAlbums(prev => [...prev, formData.album]);
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        album: '',
        isFavorite: false,
        location: ''
      });
      setUploadedFiles([]);
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('Error saving memory:', error);
      toast.error('Failed to save memory');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      await deleteMemory(memoryId);
      
      // Remove memory from state
      setMemories(prev => prev.filter(memory => memory.id !== memoryId));
      toast.success('Memory deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast.error('Failed to delete memory');
    }
  };

  const handleToggleFavorite = async (memoryId: string) => {
    try {
      const updatedMemory = await toggleMemoryFavorite(memoryId);
      
      setMemories(prev => 
        prev.map(memory => 
          memory.id === memoryId 
            ? { ...updatedMemory, gradient: memory.gradient || updatedMemory.gradient } // Preserve gradient
            : memory
        )
      );
      toast.success('Favorite status updated');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleToggleSaved = async (memoryId: string) => {
    try {
      const updatedMemory = await toggleMemorySaved(memoryId);
      
      setMemories(prev => 
        prev.map(memory => 
          memory.id === memoryId 
            ? { ...updatedMemory, gradient: memory.gradient || updatedMemory.gradient } // Preserve gradient
            : memory
        )
      );
      toast.success('Saved status updated');
    } catch (error) {
      console.error('Error toggling saved:', error);
      toast.error('Failed to update saved status');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const heartBeat = {
    rest: { scale: 1 },
    hover: { scale: 1.2, transition: { duration: 0.3, repeat: Infinity, repeatType: "reverse" as const } }
  };

  const dropzoneVariants = {
    default: { 
      borderColor: "rgba(236, 72, 153, 0.3)",
      backgroundColor: "rgba(236, 72, 153, 0.05)"
    },
    dragging: { 
      borderColor: "rgba(236, 72, 153, 1)",
      backgroundColor: "rgba(236, 72, 153, 0.1)",
      scale: 1.02
    }
  };

  console.log('Memories are:', memories);

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4">
      <motion.div 
        className="flex items-center justify-between bg-gradient-to-r from-pink-500 via-red-500 to-purple-500 p-6 rounded-xl text-white shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial="rest"
            whileHover="hover"
            animate="rest"
            variants={heartBeat}
          >
            <Camera className="h-8 w-8" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Our Intimate Moments</h2>
            <p className="text-pink-100 mt-1">Capturing our journey of passion and love</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingMemory(null);
            setFormData({
              title: '',
              description: '',
              album: '',
              isFavorite: false,
              location: ''
            });
            setUploadedFiles([]);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-white text-pink-600 hover:bg-pink-100 hover:text-pink-700 transition-all duration-300 shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              Capture Moment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] border-pink-200 dark:border-pink-800 bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-pink-600 dark:text-pink-300 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {editingMemory ? 'Edit Your Memory' : 'Capture a New Intimate Moment'}
              </DialogTitle>
              <DialogDescription className="text-pink-500 dark:text-pink-400">
                {editingMemory ? 'Update this special memory' : 'Save this special memory together forever'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-pink-600 dark:text-pink-300 font-medium">Title Your Moment*</Label>
                  <Input 
                    id="title" 
                    placeholder="What would you call this memory?" 
                    className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-pink-600 dark:text-pink-300 font-medium">Describe Your Feelings*</Label>
                  <Textarea 
                    id="description" 
                    placeholder="How did this moment make you feel?" 
                    className="border-pink-200 focus:border-pink-500 focus:ring-pink-500 min-h-24"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="location" className="text-pink-600 dark:text-pink-300 font-medium">Location (Optional)</Label>
                  <Input 
                    id="location" 
                    placeholder="Where did this happen?" 
                    className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="album" className="text-pink-600 dark:text-pink-300 font-medium">Choose a Collection</Label>
                  <Select value={formData.album} onValueChange={(value) => setFormData(prev => ({ ...prev, album: value }))}>
                    <SelectTrigger id="album" className="border-pink-200 focus:border-pink-500 focus:ring-pink-500">
                      <SelectValue placeholder="Where does this memory belong?" />
                    </SelectTrigger>
                    <SelectContent>
                      {albums.map(album => (
                        <SelectItem key={album} value={album}>{album}</SelectItem>
                      ))}
                      <SelectItem value="Vacations">Vacations</SelectItem>
                      <SelectItem value="Special Occasions">Special Occasions</SelectItem>
                      <SelectItem value="Adventures">Adventures</SelectItem>
                      <SelectItem value="Everyday Moments">Everyday Moments</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="file" className="text-pink-600 dark:text-pink-300 font-medium">Upload Your Memory</Label>
                  <motion.div
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors relative"
                    variants={dropzoneVariants}
                    animate={isFileDragging ? "dragging" : "default"}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setIsFileDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsFileDragging(false);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 rounded-full bg-pink-100 dark:bg-pink-900">
                        <Upload className="h-6 w-6 text-pink-500" />
                      </div>
                      <p className="text-sm text-pink-600 dark:text-pink-300 font-medium">
                        {uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) selected` : 'Drag photos or videos here'}
                      </p>
                      <p className="text-xs text-pink-400 dark:text-pink-500">or click to browse</p>
                    </div>
                    <input 
                      id="file-input"
                      type="file" 
                      className="hidden" 
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                    />
                  </motion.div>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <AnimatePresence>
                        {uploadedFiles.map((file, index) => (
                          <motion.div
                            key={`${file.name}-${index}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative group"
                          >
                            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs p-2 text-center">
                              <Image className="h-4 w-4 text-pink-500 mb-1" />
                              <span className="text-pink-600 dark:text-pink-300 text-xs truncate">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-pink-50 dark:bg-gray-800">
                  <input 
                    type="checkbox" 
                    id="favorite" 
                    className="rounded text-pink-500 border-pink-300 focus:ring-pink-500"
                    checked={formData.isFavorite}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                  />
                  <Label htmlFor="favorite" className="flex items-center cursor-pointer">
                    <Star className="h-4 w-4 mr-1 text-pink-500" />
                    <span className="text-pink-700 dark:text-pink-300 font-medium">Mark as favorite moment</span>
                  </Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isUploading}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingMemory ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    editingMemory ? 'Update Memory' : 'Save This Moment'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </motion.div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="flex flex-wrap gap-1 p-1 bg-pink-50 dark:bg-gray-800 rounded-lg mb-6">
          <TabsTrigger 
            value="all" 
            className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
          >
            All Memories ({memories.length})
          </TabsTrigger>
          <TabsTrigger 
            value="favorites" 
            className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
          >
            <Star className="h-4 w-4 mr-1" /> Favorites ({memories.filter(m => m.isFavorite).length})
          </TabsTrigger>
          <TabsTrigger 
            value="saved" 
            className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
          >
            <Bookmark className="h-4 w-4 mr-1" /> Saved ({memories.filter(m => m.isSaved).length})
          </TabsTrigger>
          {albums.map(album => (
            <TabsTrigger 
              key={album} 
              value={album}
              className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
            >
              {album} ({memories.filter(m => m.album === album).length})
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all">
          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {memories.map((memory) => (
              <MemoryCard 
                key={memory.id} 
                memory={memory} 
                isHovered={hoveredCard === memory.id}
                onHover={() => setHoveredCard(memory.id)}
                onLeave={() => setHoveredCard(null)}
                onToggleFavorite={() => handleToggleFavorite(memory.id)}
                onToggleSaved={() => handleToggleSaved(memory.id)}
                onEdit={() => handleEditMemory(memory)}
                onDelete={() => handleDeleteMemory(memory.id)}
                onView={() => setViewingMemory(memory)}
              />
            ))}

            
        {/* View Memory Dialog */}
        <Dialog open={!!viewingMemory} onOpenChange={(open) => !open && setViewingMemory(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {viewingMemory && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-pink-600 dark:text-pink-300">
                    {viewingMemory.title}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2 text-pink-500 dark:text-pink-400">
                    <span>{formatDate(viewingMemory.date)}</span>
                    {viewingMemory.location && (
                      <>
                        <span>•</span>
                        <span>📍 {viewingMemory.location}</span>
                      </>
                    )}
                  </DialogDescription>
                </DialogHeader>

                {/* Media Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingMemory.mediaUrls?.map((url, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      {url.includes('.mp4') || url.includes('.mov') ? (
                        <video 
                          src={url} 
                          controls 
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      ) : (
                        <img 
                          src={url} 
                          alt={`Memory ${index + 1}`}
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-pink-600 dark:text-pink-300">Description</h3>
                    <p className="text-sm text-muted-foreground">{viewingMemory.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-pink-500 dark:text-pink-400">
                        Album: {viewingMemory.album}
                      </span>
                      {viewingMemory.isFavorite && (
                        <span className="flex items-center gap-1 text-sm text-pink-500">
                          <Star className="h-4 w-4 fill-pink-500" />
                          Favorite
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="favorites">
          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {memories
              .filter(memory => memory.isFavorite)
              .map((memory) => (
                <MemoryCard 
                  key={memory.id} 
                  memory={memory} 
                  isHovered={hoveredCard === memory.id}
                  onHover={() => setHoveredCard(memory.id)}
                  onLeave={() => setHoveredCard(null)}
                  onToggleFavorite={() => handleToggleFavorite(memory.id)}
                  onToggleSaved={() => handleToggleSaved(memory.id)}
                  onEdit={() => handleEditMemory(memory)}
                  onDelete={() => handleDeleteMemory(memory.id)}
                  onView={() => setViewingMemory(memory)}
                />
              ))}

              
        {/* View Memory Dialog */}
        <Dialog open={!!viewingMemory} onOpenChange={(open) => !open && setViewingMemory(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {viewingMemory && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-pink-600 dark:text-pink-300">
                    {viewingMemory.title}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2 text-pink-500 dark:text-pink-400">
                    <span>{formatDate(viewingMemory.date)}</span>
                    {viewingMemory.location && (
                      <>
                        <span>•</span>
                        <span>📍 {viewingMemory.location}</span>
                      </>
                    )}
                  </DialogDescription>
                </DialogHeader>

                {/* Media Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingMemory.mediaUrls?.map((url, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      {url.includes('.mp4') || url.includes('.mov') ? (
                        <video 
                          src={url} 
                          controls 
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      ) : (
                        <img 
                          src={url} 
                          alt={`Memory ${index + 1}`}
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-pink-600 dark:text-pink-300">Description</h3>
                    <p className="text-sm text-muted-foreground">{viewingMemory.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-pink-500 dark:text-pink-400">
                        Album: {viewingMemory.album}
                      </span>
                      {viewingMemory.isFavorite && (
                        <span className="flex items-center gap-1 text-sm text-pink-500">
                          <Star className="h-4 w-4 fill-pink-500" />
                          Favorite
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
          </motion.div>
        </TabsContent>

        <TabsContent value="saved">
          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {memories
              .filter(memory => memory.isSaved)
              .map((memory) => (
                <MemoryCard 
                  key={memory.id} 
                  memory={memory} 
                  isHovered={hoveredCard === memory.id}
                  onHover={() => setHoveredCard(memory.id)}
                  onLeave={() => setHoveredCard(null)}
                  onToggleFavorite={() => handleToggleFavorite(memory.id)}
                  onToggleSaved={() => handleToggleSaved(memory.id)}
                  onEdit={() => handleEditMemory(memory)}
                  onDelete={() => handleDeleteMemory(memory.id)}
                  onView={() => setViewingMemory(memory)}
                />
              ))}

              
        {/* View Memory Dialog */}
        <Dialog open={!!viewingMemory} onOpenChange={(open) => !open && setViewingMemory(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {viewingMemory && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-pink-600 dark:text-pink-300">
                    {viewingMemory.title}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2 text-pink-500 dark:text-pink-400">
                    <span>{formatDate(viewingMemory.date)}</span>
                    {viewingMemory.location && (
                      <>
                        <span>•</span>
                        <span>📍 {viewingMemory.location}</span>
                      </>
                    )}
                  </DialogDescription>
                </DialogHeader>

                {/* Media Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingMemory.mediaUrls?.map((url, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      {url.includes('.mp4') || url.includes('.mov') ? (
                        <video 
                          src={url} 
                          controls 
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      ) : (
                        <img 
                          src={url} 
                          alt={`Memory ${index + 1}`}
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-pink-600 dark:text-pink-300">Description</h3>
                    <p className="text-sm text-muted-foreground">{viewingMemory.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-pink-500 dark:text-pink-400">
                        Album: {viewingMemory.album}
                      </span>
                      {viewingMemory.isFavorite && (
                        <span className="flex items-center gap-1 text-sm text-pink-500">
                          <Star className="h-4 w-4 fill-pink-500" />
                          Favorite
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
          </motion.div>
        </TabsContent>

        {albums.map(album => (
          <TabsContent key={album} value={album}>
            <motion.div 
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {memories
                .filter(memory => memory.album === album)
                .map((memory) => (
                  <MemoryCard 
                    key={memory.id} 
                    memory={memory}
                    isHovered={hoveredCard === memory.id}
                    onHover={() => setHoveredCard(memory.id)}
                    onLeave={() => setHoveredCard(null)}
                    onToggleFavorite={() => handleToggleFavorite(memory.id)}
                    onToggleSaved={() => handleToggleSaved(memory.id)}
                    onEdit={() => handleEditMemory(memory)}
                    onDelete={() => handleDeleteMemory(memory.id)}
                    onView={() => setViewingMemory(memory)}
                  />
                ))}

                
        {/* View Memory Dialog */}
        <Dialog open={!!viewingMemory} onOpenChange={(open) => !open && setViewingMemory(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {viewingMemory && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-pink-600 dark:text-pink-300">
                    {viewingMemory.title}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2 text-pink-500 dark:text-pink-400">
                    <span>{formatDate(viewingMemory.date)}</span>
                    {viewingMemory.location && (
                      <>
                        <span>•</span>
                        <span>📍 {viewingMemory.location}</span>
                      </>
                    )}
                  </DialogDescription>
                </DialogHeader>

                {/* Media Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingMemory.mediaUrls?.map((url, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      {url.includes('.mp4') || url.includes('.mov') ? (
                        <video 
                          src={url} 
                          controls 
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      ) : (
                        <img 
                          src={url} 
                          alt={`Memory ${index + 1}`}
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-pink-600 dark:text-pink-300">Description</h3>
                    <p className="text-sm text-muted-foreground">{viewingMemory.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-pink-500 dark:text-pink-400">
                        Album: {viewingMemory.album}
                      </span>
                      {viewingMemory.isFavorite && (
                        <span className="flex items-center gap-1 text-sm text-pink-500">
                          <Star className="h-4 w-4 fill-pink-500" />
                          Favorite
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function MemoryCard({ 
  memory, 
  isHovered, 
  onHover, 
  onLeave, 
  onToggleFavorite, 
  onToggleSaved,
  onEdit,
  onDelete,
  onView
}: { 
  memory: Memory;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onToggleFavorite: () => void;
  onToggleSaved: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  const isFavoriteBtnVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.2 }
  };

  const imageOverlayVariants = {
    hidden: { opacity: 0 },
    hover: { opacity: 1 }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const primaryImage = memory.mediaUrls?.[0] || "/placeholder.svg";
  const gradient = memory.gradient || "from-pink-400 to-purple-500";
  
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <Card className="overflow-hidden relative bg-white dark:bg-gray-800 border-0 transition-all duration-300">
        {/* Animated glow effect */}
        <motion.div 
          className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} opacity-75 rounded-xl blur-sm z-0`}
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
          <div className={`h-1 bg-gradient-to-r ${gradient}`}></div>
          <div className="aspect-video relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 flex items-end p-4"
              variants={imageOverlayVariants}
              initial="hidden"
              animate={isHovered ? "hover" : "hidden"}
              transition={{ duration: 0.2 }}
            >
              <div className="flex gap-2 w-full">
              <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 rounded-full flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                  }}
                >
                  <Film className="h-4 w-4 mr-2" /> View Full Memory
                </Button>
                
                {/* Edit and Delete dropdown menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 rounded-full p-2"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40" align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
            <img
              src={primaryImage}
              alt={memory.title}
              className="h-full w-full object-cover transition-transform duration-500"
              style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
            />
            {/* Favorite button */}
            <motion.button 
              className={`absolute right-3 top-3 rounded-full p-2 z-20 ${
                memory.isFavorite 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-white/80 text-pink-500 hover:bg-pink-100'
              } backdrop-blur-sm shadow-md transition-all duration-300`}
              variants={isFavoriteBtnVariants}
              initial="initial"
              whileHover="hover"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
            >
              <Heart className={`h-4 w-4 ${memory.isFavorite ? 'fill-white' : ''}`} />
            </motion.button>
          </div>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg text-pink-700 dark:text-pink-300">{memory.title}</CardTitle>
              <div className="rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20 px-2 py-1 text-xs font-medium text-pink-600 dark:text-pink-300">
                {memory.album}
              </div>
            </div>
            <CardDescription className="flex items-center gap-1 text-pink-400 dark:text-pink-500">
              <Clock className="h-3 w-3" />
              {formatDate(memory.date)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground line-clamp-2">{memory.description}</p>
            {memory.location && (
              <p className="text-xs text-pink-500 mt-1 flex items-center gap-1">
                <span>📍</span> {memory.location}
              </p>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 p-0 ${
                memory.isSaved ? 'text-pink-700 dark:text-pink-300' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSaved();
              }}
            >
              <Bookmark className={`h-4 w-4 mr-1 ${memory.isSaved ? 'fill-pink-600' : ''}`} />
              {memory.isSaved ? 'Saved' : 'Save'}
            </Button>
            <div className="flex items-center gap-2">
              {memory.isFavorite && (
                <div className="flex items-center gap-1 text-pink-500">
                  <Star className="h-4 w-4 fill-pink-500" />
                  <span className="text-xs font-medium">Favorite</span>
                </div>
              )}
              {memory.mediaUrls && memory.mediaUrls.length > 1 && (
                <div className="flex items-center gap-1 text-pink-500">
                  <Image className="h-4 w-4" />
                  <span className="text-xs font-medium">+{memory.mediaUrls.length - 1}</span>
                </div>
              )}
            </div>
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  )
}