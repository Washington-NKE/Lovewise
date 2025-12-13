'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface CreateGameDialogProps {
  onGameCreated: () => void;
}

export function CreateGameDialog({ onGameCreated }: CreateGameDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    maxPlayers: '2'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create game')

      setFormData({ title: '', slug: '', description: '', maxPlayers: '2' })
      setOpen(false)
      onGameCreated()
    } catch (error) {
      console.error('Error creating game:', error)
      alert('Failed to create game. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Create New Game
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] bg-gradient-to-br from-rose-50 to-fuchsia-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-rose-900">Create New Game</DialogTitle>
          <DialogDescription className="text-rose-700/80">
            Add a new romantic game for you and your partner to enjoy together.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-rose-900">Game Title</Label>
            <Input
              id="title"
              placeholder="e.g., Truth or Dare"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="border-rose-200 focus:border-fuchsia-400 focus:ring-fuchsia-400 bg-white text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-rose-900">URL Slug</Label>
            <Input
              id="slug"
              placeholder="auto-generated from title"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              required
              className="border-rose-200 focus:border-fuchsia-400 focus:ring-fuchsia-400 bg-white text-gray-900 placeholder:text-gray-500"
            />
            <p className="text-xs text-rose-600">This will be used in the URL: /games/{formData.slug || 'game-slug'}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-rose-900">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the game and what makes it special..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={4}
              className="border-rose-200 focus:border-fuchsia-400 focus:ring-fuchsia-400 resize-none bg-white text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPlayers" className="text-rose-900">Max Players</Label>
            <Input
              id="maxPlayers"
              type="number"
              min="2"
              max="10"
              value={formData.maxPlayers}
              onChange={(e) => setFormData(prev => ({ ...prev, maxPlayers: e.target.value }))}
              required
              className="border-rose-200 focus:border-fuchsia-400 focus:ring-fuchsia-400 bg-white text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-rose-200 text-rose-900 hover:bg-rose-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white"
            >
              {loading ? 'Creating...' : 'Create Game'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}