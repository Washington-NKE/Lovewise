'use client'


import React, {useState, useEffect} from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Flame, Sparkles } from 'lucide-react'
import { motion } from "framer-motion"
import { CreateGameDialog } from '@/components/create-game-dialog'

// Add a local Game interface if not globally available
interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  maxPlayers: number;
}

const gamesPage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (!response.ok) throw new Error('Failed to fetch games');
      const data = await response.json();
      setGames(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  if (loading) return <div className="p-8">Loading games...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 }
  };

  const hoverAnimation = {
    whileHover: { scale: 1.02, rotate: 0.2, transition: { duration: 0.25 } }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: { staggerChildren: 0.08 }
    }
  };

  const shimmerKeyframes = {
    animate: {
      backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
      transition: { duration: 6, repeat: Infinity, ease: 'linear' }
    }
  };

  return (
    <div className="space-y-8 p-6 rounded-xl relative">
      {/* Romantic gradient backdrop */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-100" />
      {/* Soft glow orbs */}
      <motion.div
        className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-rose-200/40 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-fuchsia-200/40 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-rose-900">Games for Two</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-rose-600">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm">Playful & romantic</span>
          </div>
          <CreateGameDialog onGameCreated={fetchGames} />
        </div>
      </div>

      <motion.div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {games.map((game, idx) => (
          <motion.div
            key={game.id}
            variants={fadeInUp}
            whileHover={hoverAnimation.whileHover}
            className="group h-full"
          >
            <Card
              className="h-full flex flex-col overflow-hidden border-rose-200/60 bg-white/70 backdrop-blur-md shadow-sm transition-all duration-300 group-hover:shadow-rose-200/60"
            >
              {/* Animated romantic ribbon */}
              <motion.div
                className="h-1 w-full"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #fb7185, #f472b6, #a78bfa, #fb7185)',
                  backgroundSize: '200% 100%',
                }}
                animate={shimmerKeyframes.animate}
              />

              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-rose-800">
                  {game.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-rose-500">
                  <Heart className="h-4 w-4" />
                  <span className="text-xs">x{game.maxPlayers}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-rose-700/80">
                  {game.description}
                </p>

                {/* bottom actions */}
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <Link
                    href={`/dashboard/games/${game.slug}`}
                    className="text-sm font-medium text-fuchsia-700 hover:text-fuchsia-800 transition"
                  >
                    Explore
                  </Link>

                  <motion.div
                    className="flex items-center gap-2 text-fuchsia-500"
                    animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <Flame className="h-4 w-4" />
                    <span className="text-xs">Feel the spark</span>
                  </motion.div>
                </div>
              </CardContent>

              {/* subtle floating glow */}
              <motion.div
                className="absolute bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-to-t from-fuchsia-200 to-transparent opacity-40"
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default gamesPage
