'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Calendar, MessageSquare, Camera, Star, ChevronRight } from 'lucide-react'
import { ThemeToggle } from "@/components/ThemeToggle"
import { useState, useEffect } from "react"

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-rose-50 to-white dark:from-rose-950 dark:to-gray-950">
      <header className="sticky top-0 z-50 w-full border-b border-rose-200 dark:border-rose-900 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Heart className="h-7 w-7 text-rose-500 group-hover:animate-ping absolute opacity-75" />
                <Heart className="h-7 w-7 text-rose-500 relative" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-rose-600 to-red-500 dark:from-rose-400 dark:to-red-300 text-transparent bg-clip-text transition-all duration-300 ease-in-out">Lovewise</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-3">
              <ThemeToggle />
              <Link href="/signin">
                <Button variant="ghost" size="sm" className="hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white border-none transition-all duration-300 shadow-md hover:shadow-lg">Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-16 md:py-28 lg:py-36 overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div 
                className={`flex flex-col justify-center space-y-6 transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}
              >
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                    <span className="block bg-gradient-to-r from-rose-600 to-red-500 dark:from-rose-400 dark:to-red-300 text-transparent bg-clip-text">Ignite Your Love Story</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                    A private, passionate digital sanctuary where you and your partner can 
                    cherish intimate moments, share your deepest thoughts, and keep your 
                    flame burning brighter than ever.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="w-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                      Begin Your Love Story <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline" className="w-full border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transform hover:scale-105 transition-all duration-300">
                      Discover More
                    </Button>
                  </Link>
                </div>
              </div>
              <div 
                className={`flex items-center justify-center transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}
              >
                <div className="relative max-w-md w-full aspect-square">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-300 via-red-300 to-amber-200 dark:from-rose-700 dark:via-red-600 dark:to-amber-800 shadow-xl animate-pulse-slow"></div>
                  <div className="absolute inset-4 rounded-xl bg-white/95 dark:bg-black/95 p-6 shadow-lg backdrop-blur-sm transform transition-all duration-500 hover:scale-105">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-rose-500 to-red-500 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-3 w-32 rounded-full bg-gradient-to-r from-rose-300 to-amber-200 dark:from-rose-700 dark:to-amber-600"></div>
                        <div className="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-3 w-3/4 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="mt-8 grid grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div 
                          key={i} 
                          className="aspect-square rounded-lg bg-gradient-to-br from-rose-100 to-amber-100 dark:from-rose-900 dark:to-amber-900 shadow-sm transform transition-all duration-300 hover:scale-110 hover:shadow-md"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full bg-gradient-to-r from-rose-100 to-amber-50 dark:from-rose-950 dark:to-amber-950 py-16 md:py-28 lg:py-36">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-12">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-4xl md:text-5xl bg-gradient-to-r from-rose-600 to-red-500 dark:from-rose-400 dark:to-red-300 text-transparent bg-clip-text">
                Kindle Your Passion
              </h2>
              <p className="max-w-[85%] text-muted-foreground sm:text-xl">
                Everything you need to keep your love affair endlessly passionate.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-2xl border border-rose-200 dark:border-rose-900 bg-white/80 dark:bg-black/50 p-8 shadow-lg backdrop-blur-sm transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
                <div className="rounded-full bg-rose-100 dark:bg-rose-900/60 p-4">
                  <MessageSquare className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">Intimate Journal</h3>
                <p className="text-center text-muted-foreground">
                  Share your deepest thoughts, desires, and fantasies in a private space just for the two of you.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-2xl border border-rose-200 dark:border-rose-900 bg-white/80 dark:bg-black/50 p-8 shadow-lg backdrop-blur-sm transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
                <div className="rounded-full bg-rose-100 dark:bg-rose-900/60 p-4">
                  <Camera className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">Romantic Gallery</h3>
                <p className="text-center text-muted-foreground">
                  Capture your most passionate moments in a beautiful, private collection.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-2xl border border-rose-200 dark:border-rose-900 bg-white/80 dark:bg-black/50 p-8 shadow-lg backdrop-blur-sm transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
                <div className="rounded-full bg-rose-100 dark:bg-rose-900/60 p-4">
                  <Calendar className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">Special Moments</h3>
                <p className="text-center text-muted-foreground">
                  Plan and remember intimate date nights and special anniversaries.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-16 md:py-28 lg:py-36 overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="hidden md:block">
                <div className="relative h-[500px] w-full max-w-md mx-auto">
                  <div className="absolute top-0 left-0 h-64 w-64 rounded-2xl bg-gradient-to-br from-rose-400 to-red-300 dark:from-rose-600 dark:to-red-500 shadow-xl transform -rotate-6 transition-all duration-500 hover:rotate-0 hover:scale-110"></div>
                  <div className="absolute bottom-0 right-0 h-64 w-64 rounded-2xl bg-gradient-to-br from-amber-300 to-rose-300 dark:from-amber-700 dark:to-rose-600 shadow-xl transform rotate-6 transition-all duration-500 hover:rotate-0 hover:scale-110"></div>
                  <div className="absolute inset-6 rounded-2xl bg-white/90 dark:bg-black/90 p-6 shadow-lg backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-rose-500 to-red-500 flex items-center justify-center">
                        <Heart className="h-8 w-8 text-white animate-pulse" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Create Your Love Story</h3>
                      <p className="text-muted-foreground">Share intimate moments, memories, and dreams with your partner in your own private sanctuary.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-6">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-rose-600 to-red-500 dark:from-rose-400 dark:to-red-300 text-transparent bg-clip-text">
                  Deepen Your Connection
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Discover new ways to express your love, keep the flame alive, and build an enduring bond that grows stronger with every shared moment.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: <Star className="h-5 w-5 text-rose-500" />, text: "Exclusive couple challenges to spice up your relationship" },
                    { icon: <Heart className="h-5 w-5 text-rose-500" />, text: "Private messaging for your most intimate conversations" },
                    { icon: <Calendar className="h-5 w-5 text-rose-500" />, text: "Customizable anniversary and special date reminders" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="rounded-full bg-rose-100 dark:bg-rose-900/60 p-2">
                        {item.icon}
                      </div>
                      <span className="text-muted-foreground">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-rose-500 to-red-600 text-white">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-6 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-4xl md:text-5xl text-white">
                Begin Your Passionate Journey Today
              </h2>
              <p className="max-w-[85%] text-rose-100 sm:text-xl">
                Create your private sanctuary and invite your lover to join you.
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-white text-rose-600 hover:bg-rose-100 font-semibold shadow-lg transform hover:scale-105 transition-all duration-300">
                  Start Your Love Story <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-rose-200 dark:border-rose-900 py-8 md:py-12">
        <div className="container flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © 2025 Lovewise. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 underline-offset-4 hover:underline transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 underline-offset-4 hover:underline transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 underline-offset-4 hover:underline transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}