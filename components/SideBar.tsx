"use client"

import { useState, useEffect, type AnchorHTMLAttributes } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar" 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  BookHeart, 
  Calendar, 
  Heart, 
  Image, 
  LogOut, 
  MessageSquareHeart, 
  Settings, 
  Gift,
  HeartHandshake,
  FileQuestion,
  Menu,
  X,
  Gamepad2,
} from 'lucide-react'
import { getInitials } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { Session as NextAuthSession } from "next-auth"
import { usePartnerPresenceSimple } from "@/components/WebSocketPresenceProvider"

interface Session extends NextAuthSession {
  user: NextAuthSession["user"] & {
    image?: string | null
  }
}
import { signOutAction } from "@/lib/actions/auth"

interface Partner {
  id: string
  name: string
  profileImage?: string | null
  lastActive?: Date | null
  isOnline?: boolean
}

interface LoveJournalSidebarProps {
  session: Session | null
  partner?: Partner | null
}

// Mobile Trigger Component
const MobileSidebarTrigger = () => {
  const { setOpenMobile } = useSidebar()
  
  return (
    <div className="md:hidden fixed top-4 left-4 z-50">
      <Button
        variant="outline"
        size="icon"
        className="bg-white/80 backdrop-blur-sm border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
        onClick={() => setOpenMobile(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  )
}

// Custom Link component that closes mobile sidebar on navigation
type SidebarLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, children, className, ...props }) => {
  const { setOpenMobile, isMobile } = useSidebar()
  
  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }
  
  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}

export const LoveJournalSidebar: React.FC<LoveJournalSidebarProps> = ({ session, partner }) => {
  const pathname = usePathname()
  const { isOnline: currentUserOnline, isConnected } = useOnlineStatus(session?.user?.id)
  
  // Use WebSocket-powered presence for real-time updates
  const { 
    isPartnerOnline, 
    partnerLastSeen, 
    partnerData,
    isWebSocketConnected
  } = usePartnerPresenceSimple(partner?.id)
  
  const [isHovering, setIsHovering] = useState(false)
  const [loveQuote, setLoveQuote] = useState("")

  
  // Love quotes to display randomly
  const loveQuotes = [
    "Love is composed of a single soul inhabiting two bodies.",
    "In all the world, there is no heart for me like yours.",
    "I love you not only for what you are, but for what I am when I am with you.",
    "The best thing to hold onto in life is each other.",
    "You are my today and all of my tomorrows.",
    "To love and be loved is to feel the sun from both sides."
  ]
  
  // Particle effect for the heart icon
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; color: string }[]>([])
  
  useEffect(() => {
    // Set a random love quote on load
    setLoveQuote(loveQuotes[Math.floor(Math.random() * loveQuotes.length)])
    
    const interval = setInterval(() => {
      if (isHovering) {
        const newParticle = {
          id: Date.now(),
          x: Math.random() * 30 - 15,
          y: Math.random() * -20 - 10,
          size: Math.random() * 8 + 2,
          duration: Math.random() * 1 + 1,
          color: ['#f43f5e', '#e11d48', '#be185d', '#db2777'][Math.floor(Math.random() * 4)]
        }
        setParticles(prev => [...prev, newParticle])
        
        // Remove particles after they're done
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== newParticle.id))
        }, newParticle.duration * 1000)
      }
    }, 200)
    
    return () => {
      clearInterval(interval)
    }
  }, [isHovering])

  //Handle sign out
  const handleSignOut = async () => {
    await signOutAction()
  }

  // Heart beat animation for active menu item
  const heartbeat = {
    scale: [1, 1.1, 1],
    transition: { 
      duration: 1.5, 
      repeat: Infinity, 
      repeatType: "reverse" as const
    }
  }

  // Format last seen time
  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return "Never"
    
    const now = new Date()
    const diff = now.getTime() - lastSeen.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return lastSeen.toLocaleDateString()
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        exit={{ opacity: 0, x: -20 }} 
        transition={{ duration: 0.3 }}
      >
        <SidebarProvider defaultOpen={true}>
      <MobileSidebarTrigger />
          <Sidebar collapsible="offcanvas" className="border-r-0">
            <SidebarHeader className="border-b border-rose-200 px-6 py-3 bg-gradient-to-r from-rose-100 to-fuchsia-100">
              <div className="flex justify-between items-center">
                <SidebarLink 
                  href="/dashboard" 
                  className="flex items-center gap-2 relative"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >  
                  <motion.div 
                    animate={{ 
                      rotate: isHovering ? [0, 15, -15, 0] : 0,
                      scale: isHovering ? [1, 1.2, 1] : 1
                    }} 
                    transition={{ duration: 0.6 }}
                    className="relative"
                  >
                    <Heart className="h-6 w-6 text-rose-600 fill-rose-500" />
                    
                    {/* Particle effects */}
                    <AnimatePresence>
                      {particles.map(particle => (
                        <motion.div
                          key={particle.id}
                          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                          animate={{ 
                            opacity: [1, 0], 
                            scale: [0, 1], 
                            x: particle.x, 
                            y: particle.y 
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: particle.duration }}
                          style={{ 
                            position: 'absolute',
                            width: particle.size,
                            height: particle.size,
                            borderRadius: '50%',
                            backgroundColor: particle.color,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                  <motion.span 
                    className="font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent"
                    animate={{ 
                      y: isHovering ? [0, -2, 0] : 0
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    Love Journal
                  </motion.span>
                </SidebarLink>
                <SidebarTrigger className="md:hidden">
                  <X className="h-6 w-6 text-rose-600" />
                </SidebarTrigger>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="bg-gradient-to-b from-white to-rose-50">
              <div className="px-4 py-6">
                <motion.div 
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                      <div className="relative">
                        <Avatar className="border-2 border-rose-300 ring-2 ring-rose-100">
                          <AvatarImage src={session?.user?.image || "/placeholder.svg?height=40&width=40"} alt="User" />
                          <AvatarFallback className="bg-gradient-to-br from-rose-400 to-fuchsia-500 text-white">
                            {getInitials(session?.user?.name ?? "") || "ME"}
                          </AvatarFallback>
                        </Avatar>
                        <motion.div 
                          className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                            currentUserOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                          animate={currentUserOnline ? heartbeat : {}}
                        />
                      </div>
                    </motion.div>
                    <div>
                      <p className="text-sm font-medium text-rose-800">{session?.user?.name}</p>
                    </div>
                  </div>
                  
                  {partner ? (
                    <motion.div 
                      whileHover={{ scale: 1.05, rotate: 5 }} 
                      transition={{ duration: 0.2 }}
                      className="relative group"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-rose-500 ring-offset-2">
                        <AvatarImage src={partner.profileImage || "/placeholder.svg?height=32&width=32"} alt="Partner" />
                        <AvatarFallback className="bg-gradient-to-br from-fuchsia-400 to-purple-500 text-white text-xs">
                          {getInitials(partner.name) || "LV"}
                        </AvatarFallback>
                      </Avatar>
                      <motion.div 
                        className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border border-white ${
                          isWebSocketConnected === false ? 'bg-yellow-400' : 
                          isPartnerOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                        animate={isPartnerOnline ? heartbeat : {}}
                      />
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {partner.name} - {
                          isWebSocketConnected === false ? 'Checking...' :
                          isPartnerOnline ? 'Online' : 
                          `Last seen ${formatLastSeen(partnerLastSeen)}`
                        }
                      </div>
                    </motion.div>
                  ) : (
                    <Button variant="outline" size="sm" className="text-xs bg-gradient-to-r from-rose-100 to-fuchsia-100 border-rose-200 text-rose-700 hover:bg-gradient-to-r hover:from-rose-200 hover:to-fuchsia-200 transition-all duration-300">
                      <Heart className="h-3 w-3 mr-1 text-rose-500" />
                      Invite Love
                    </Button>
                  )}
                </motion.div>
                
                {/* Love Quote Banner */}
                <motion.div 
                  className="mt-4 p-3 rounded-lg bg-gradient-to-r from-rose-100/70 to-fuchsia-100/70 text-center shadow-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                >
                  <p className="text-xs italic text-rose-700">{loveQuote}</p>
                </motion.div>
              </div>
              
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard"} className="hover:bg-rose-100/50 transition-all">
                    <SidebarLink href="/dashboard" className="group">
                      <motion.div whileHover={{ rotate: 5 }} className="flex items-center">
                        <motion.div animate={pathname === "/dashboard" ? heartbeat : {}} className="flex items-center">
                          <BookHeart className="h-5 w-5 text-rose-600 group-hover:text-rose-700 transition-colors" />
                          <span className="text-rose-800 group-hover:text-rose-900 transition-colors">Dashboard</span>
                        </motion.div>
                      </motion.div>
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/journal"} className="hover:bg-rose-100/50 transition-all">
                    <SidebarLink href="/dashboard/journal" className="group">
                      <motion.div whileHover={{ rotate: 5 }} className="flex items-center">
                        <motion.div animate={pathname === "/dashboard/journal" ? heartbeat : {}} className="flex items-center">
                          <BookHeart className="h-5 w-5 text-rose-600 group-hover:text-rose-700 transition-colors" />
                          <span className="text-rose-800 group-hover:text-rose-900 transition-colors">Journal</span>
                        </motion.div>
                      </motion.div>
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/memories"} className="hover:bg-fuchsia-100/50 transition-all">
                    <SidebarLink href="/dashboard/memories" className="group">
                      <motion.div whileHover={{ rotate: 5 }} className="flex items-center">
                        <motion.div animate={pathname === "/dashboard/memories" ? heartbeat : {}} className="flex items-center">
                          <Image className="h-5 w-5 text-fuchsia-600 group-hover:text-fuchsia-700 transition-colors" />
                          <span className="text-fuchsia-800 group-hover:text-fuchsia-900 transition-colors">Memories</span>
                        </motion.div>
                      </motion.div>
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/events"} className="hover:bg-purple-100/50 transition-all">
                    <SidebarLink href="/dashboard/events" className="group">
                      <motion.div whileHover={{ rotate: 5 }} className="flex items-center">
                        <motion.div animate={pathname === "/dashboard/events" ? heartbeat : {}} className="flex items-center">
                          <Calendar className="h-5 w-5 text-purple-600 group-hover:text-purple-700 transition-colors" />
                          <span className="text-purple-800 group-hover:text-purple-900 transition-colors">Special Dates</span>
                        </motion.div>
                      </motion.div>
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/messages"} className="hover:bg-red-100/50 transition-all">
                    <SidebarLink href="/dashboard/messages" className="group">
                      <motion.div whileHover={{ rotate: 5 }} className="flex items-center">
                        <motion.div animate={pathname === "/dashboard/messages" ? heartbeat : {}} className="flex items-center">
                          <MessageSquareHeart className="h-5 w-5 text-red-600 group-hover:text-red-700 transition-colors" />
                          <span className="text-red-800 group-hover:text-red-900 transition-colors">Love Notes</span>
                        </motion.div>
                      </motion.div>
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/gifts"} className="hover:bg-pink-100/50 transition-all">
                    <SidebarLink href="/dashboard/gifts" className="group">
                      <motion.div whileHover={{ rotate: 5 }} className="flex items-center">
                        <motion.div animate={pathname === "/dashboard/gifts" ? heartbeat : {}} className="flex items-center">
                          <Gift className="h-5 w-5 text-pink-600 group-hover:text-pink-700 transition-colors" />
                          <span className="text-pink-800 group-hover:text-pink-900 transition-colors">Gift Ideas</span>
                        </motion.div>
                      </motion.div>
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/quiz"} className="hover:bg-pink-100/50 transition-all">
                    <SidebarLink href="/dashboard/quiz" className="group">
                      <motion.div whileHover={{ rotate: 5 }} className="flex items-center">
                        <motion.div animate={pathname === "/dashboard/quiz" ? heartbeat : {}} className="flex items-center">
                          <FileQuestion className="h-5 w-5 text-blue-600 group-hover:text-blue-700 transition-colors" />
                          <span className="text-blue-800 group-hover:text-blue-900 transition-colors">Quizzes</span>
                        </motion.div>
                      </motion.div>
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/games"} className="hover:bg-pink-100/50 transition-all">
                    <SidebarLink href="/dashboard/games" className="group">
                      <motion.div whileHover={{ rotate: 5 }} className="flex items-center">
                        <motion.div animate={pathname === "/dashboard/games" ? heartbeat : {}} className="flex items-center">
                          <Gamepad2 className="h-5 w-5 text-blue-600 group-hover:text-blue-700 transition-colors" />
                          <span className="text-blue-800 group-hover:text-blue-900 transition-colors">Games</span>
                        </motion.div>
                      </motion.div>
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            
            <SidebarFooter className="border-t border-rose-200 p-4 bg-gradient-to-b from-rose-50 to-rose-100/50">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"} className="hover:bg-rose-100/70 transition-all">
                    <SidebarLink href="/dashboard/settings" className="group">
                      <motion.div whileHover={{ rotate: 5 }} className="flex items-center">
                        <Settings className="h-5 w-5 text-gray-600 group-hover:text-gray-700 transition-colors" />
                        <span className="text-gray-800 group-hover:text-gray-900 transition-colors">Settings</span>
                      </motion.div>
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    className="hover:bg-rose-100/70 transition-all"
                    onClick={handleSignOut}
                  >
                    <motion.div whileHover={{ scale: 1.03 }} className="flex items-center gap-2">
                      <LogOut className="h-5 w-5 text-gray-600 group-hover:text-gray-700 transition-colors" />
                      <span className="text-gray-800 group-hover:text-gray-900 transition-colors">Sign Out</span>
                    </motion.div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              
              {/* Connection Status */}
              <motion.div 
                className="mt-4 p-2 rounded-lg bg-gradient-to-r from-pink-100/70 to-rose-100/70 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <HeartHandshake className="h-4 w-4 text-rose-600" />
                <span className="text-xs text-rose-700">
                  {partner ? `Connected with ${partner.name}` : 'Awaiting Connection'}
                </span>
              </motion.div>
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      </motion.div>
    </>
  )
}