import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookHeart, Calendar, Image, MessageSquareHeart, Plus, Sparkles, Flame } from 'lucide-react'
import { format, differenceInDays } from "date-fns"
import { motion } from "framer-motion"
import { getDashboardData } from "./DashboardDataProvider"

export default async function DashboardContent() {
  const data = await getDashboardData();
  
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  const hoverAnimation = {
    whileHover: { scale: 1.02, transition: { duration: 0.2 } }
  }

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const pulseAnimation = {
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity
      }
    }
  }
  
  // Safely calculate journal stats
  const lastWeekEntries = data.journalEntries.filter(entry => {
    try {
      return differenceInDays(new Date(), new Date(entry.createdAt)) <= 7
    } catch {
      return false
    }
  }).length

  return (
    <div className="space-y-8 bg-gradient-to-br from-rose-50 to-purple-50 p-6 rounded-xl">
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div 
          variants={fadeInUp}
          whileHover={hoverAnimation.whileHover}
        >
          <Card className="backdrop-blur-sm bg-white/70 border-rose-200 overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-rose-800">Passionate Entries</CardTitle>
              <BookHeart className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">{data.journalEntries.length}</div>
              <p className="text-xs text-rose-400">
                +{lastWeekEntries} from last week
              </p>
              <motion.div 
                className="absolute bottom-0 right-0 h-16 w-16 bg-gradient-to-t from-rose-200 to-transparent rounded-full opacity-50"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          whileHover={hoverAnimation.whileHover}
        >
          <Card className="backdrop-blur-sm bg-white/70 border-fuchsia-200 overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-fuchsia-800">Intimate Moments</CardTitle>
              <Image className="h-4 w-4 text-fuchsia-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fuchsia-600">{data.memories.length}</div>
              <p className="text-xs text-fuchsia-400">
                Your treasured memories
              </p>
              <motion.div 
                className="absolute bottom-0 right-0 h-16 w-16 bg-gradient-to-t from-fuchsia-200 to-transparent rounded-full opacity-50"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  delay: 0.5,
                  repeat: Infinity,
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          whileHover={hoverAnimation.whileHover}
        >
          <Card className="backdrop-blur-sm bg-white/70 border-purple-200 overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Anticipation</CardTitle>
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{data.events.length}</div>
              <p className="text-xs text-purple-400">
                {data.events[0] ? `${data.events[0].title} in ${differenceInDays(new Date(data.events[0].date), new Date())} days` : 'No upcoming events'}
              </p>
              <motion.div 
                className="absolute bottom-0 right-0 h-16 w-16 bg-gradient-to-t from-purple-200 to-transparent rounded-full opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  delay: 1,
                  repeat: Infinity,
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          whileHover={hoverAnimation.whileHover}
        >
          <Card className="backdrop-blur-sm bg-white/70 border-red-200 overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Sweet Messages</CardTitle>
              <MessageSquareHeart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold text-red-600"
                variants={pulseAnimation}
                animate="animate"
              >
                {data.unreadMessages}
              </motion.div>
              <p className="text-xs text-red-400">
                From your beloved
              </p>
              <motion.div 
                className="absolute bottom-0 right-0 h-16 w-16 bg-gradient-to-t from-red-200 to-transparent rounded-full opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  delay: 1.5,
                  repeat: Infinity,
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div 
          variants={fadeInUp}
          whileHover={hoverAnimation.whileHover}
          className="col-span-1"
        >
          <Card className="backdrop-blur-sm bg-white/70 border-rose-200 overflow-hidden relative h-full">
            <CardHeader>
              <CardTitle className="text-rose-800 flex items-center">
                <Flame className="h-5 w-5 mr-2 text-rose-500" />
                Intimate Thoughts
              </CardTitle>
              <CardDescription className="text-rose-600">
                Your deepest feelings and desires
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {data.journalEntries.length > 0 ? (
                data.journalEntries.map((entry, index) => (
                  <motion.div 
                    key={entry.id} 
                    className="flex items-center gap-4 rounded-lg border border-rose-200 p-3 bg-white/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderColor: "rgba(244, 114, 182, 0.5)",
                      transform: "translateX(5px)"
                    }}
                  >
                    <BookHeart className="h-5 w-5 text-rose-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-rose-800">{entry.title}</p>
                      <p className="text-xs text-rose-500">
                        {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-sm text-rose-400">
                  No intimate thoughts shared yet
                </div>
              )}
              <Link href="/dashboard/journal">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-rose-300 text-rose-700 hover:bg-rose-100 hover:text-rose-800 transition-all"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Intimate Entry
                </Button>
              </Link>
            </CardContent>
            <motion.div 
              className="absolute top-1/2 right-0 h-40 w-40 bg-gradient-radial from-rose-200 to-transparent rounded-full opacity-30"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
              }}
            />
          </Card>
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          whileHover={hoverAnimation.whileHover}
          className="col-span-1"
        >
          <Card className="backdrop-blur-sm bg-white/70 border-fuchsia-200 overflow-hidden relative h-full">
            <CardHeader>
              <CardTitle className="text-fuchsia-800 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-fuchsia-500" />
                Passionate Moments
              </CardTitle>
              <CardDescription className="text-fuchsia-600">
                Your most cherished memories together
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-3 gap-2">
                {data.memories.length > 0 ? (
                  data.memories.map((memory, index) => (
                    <motion.div 
                      key={memory.id} 
                      className="overflow-hidden rounded-md border border-fuchsia-200"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.07 }}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 4px 12px rgba(213, 63, 140, 0.15)"
                      }}
                    >
                      <img
                        src={memory.imageUrl || `/placeholder.svg?height=100&width=100&text=Memory`}
                        alt="Memory"
                        className="aspect-square h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-3 text-center text-sm text-fuchsia-400">
                    No passionate moments captured yet
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Link href="/dashboard/memories">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-fuchsia-300 text-fuchsia-700 hover:bg-fuchsia-100 hover:text-fuchsia-800 transition-all"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Sweet Memory
                  </Button>
                </Link>
              </div>
            </CardContent>
            <motion.div 
              className="absolute top-1/2 right-0 h-40 w-40 bg-gradient-radial from-fuchsia-200 to-transparent rounded-full opacity-30"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{ 
                duration: 4,
                delay: 0.8,
                repeat: Infinity,
              }}
            />
          </Card>
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          whileHover={hoverAnimation.whileHover}
          className="col-span-1"
        >
          <Card className="backdrop-blur-sm bg-white/70 border-purple-200 overflow-hidden relative h-full">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                Romantic Dates
              </CardTitle>
              <CardDescription className="text-purple-600">
                Special moments to look forward to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {data.events.length > 0 ? (
                data.events.map((event, index) => (
                  <motion.div 
                    key={event.id} 
                    className="flex items-center gap-4 rounded-lg border border-purple-200 p-3 bg-white/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderColor: "rgba(168, 85, 247, 0.5)",
                      transform: "translateX(5px)",
                    }}
                  >
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-purple-800">{event.title}</p>
                      <p className="text-xs text-purple-500">
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <motion.div 
                      className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-600"
                      animate={{
                        scale: [1, 1.05, 1],
                        backgroundColor: ["rgba(233, 213, 255, 0.8)", "rgba(233, 213, 255, 1)", "rgba(233, 213, 255, 0.8)"]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {differenceInDays(new Date(event.date), new Date())} days
                    </motion.div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-sm text-purple-400">
                  No romantic dates planned yet
                </div>
              )}
              <Link href="/dashboard/events">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-100 hover:text-purple-800 transition-all"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Plan Special Date
                </Button>
              </Link>
            </CardContent>
            <motion.div 
              className="absolute top-1/2 right-0 h-40 w-40 bg-gradient-radial from-purple-200 to-transparent rounded-full opacity-30"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{ 
                duration: 4,
                delay: 1.6,
                repeat: Infinity,
              }}
            />
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}