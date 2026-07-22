'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Heart, MapPin, Stars } from 'lucide-react';

interface TimelineItem {
  date: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const LetterContent: React.FC = () => {
  const [activeTimeline, setActiveTimeline] = useState<number | null>(null);

  const paragraphs = [
    "I keep starting sentences to you in my head, long before I ever get the chance to say them out loud. This is one of the ones that made it onto paper.",
    "I don't think I've ever told you how much steadier everything feels since you've been in it. The ordinary days somehow got warmer. The hard ones got easier to carry, simply because you were somewhere in them.",
    "You have this way of noticing things, small things, and turning them into moments I remember for weeks. I don't know if you realize how rare that is. I notice it every time.",
    "I'm not always good at saying this in person, so let me say it here, slowly, where I can't rush it: I love you. Not the version of you I imagined, the real one, the one who's a little messy and a little stubborn and entirely, irreplaceably you.",
    "Wherever today finds you, I hope it finds you knowing this: you are loved, quietly and completely, by me."
  ];

  const timelineData: TimelineItem[] = [
    {
      date: 'Our First Spark',
      title: 'When Everything Changed',
      description: 'The moment our paths crossed, and the world got a little brighter, warmer, and full of promise.',
      icon: <Stars className="w-4 h-4 text-[#d3a768]" />,
    },
    {
      date: 'Late Night Echoes',
      title: 'Shared Hopes & Whispers',
      description: 'Hours lost in conversation, sharing dreams, vulnerabilities, and finding an comfort in each other.',
      icon: <Calendar className="w-4 h-4 text-[#e8a6b8]" />,
    },
    {
      date: 'Hand in Hand',
      title: 'Here & Forevermore',
      description: 'Building our daily canvas, laughing through ordinary moments, and growing steadier in love.',
      icon: <Heart className="w-4 h-4 text-[#ff7a9a]" />,
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.35,
        delayChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  } as const;

  return (
    <div className="w-full max-w-[620px] mx-auto z-20 relative">
      {/* The Letter Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative bg-gradient-to-b from-[#1c0d16] to-[#13070f] border border-[#d3a768]/20 rounded-lg p-6 sm:p-12 shadow-[0_45px_100px_rgba(0,0,0,0.65),inset_0_0_60px_rgba(88,20,46,0.25)] overflow-hidden"
      >
        {/* Artistic Corner Ornaments */}
        <div className="absolute top-3.5 left-3.5 w-8 h-8 border-t border-l border-[#d3a768]/30 pointer-events-none" />
        <div className="absolute bottom-3.5 right-3.5 w-8 h-8 border-b border-r border-[#d3a768]/30 pointer-events-none" />

        {/* Salutation */}
        <motion.p 
          variants={itemVariants} 
          className="font-serif italic text-2xl md:text-3xl text-[#e8a6b8] mb-8 select-none"
        >
          My love,
        </motion.p>

        {/* Body Text */}
        <div className="space-y-6 text-[#f3e6d8]/90 font-serif leading-[1.85] text-[1.12rem] md:text-[1.24rem] text-justify select-text">
          {paragraphs.map((p, index) => (
            <motion.p key={index} variants={itemVariants}>
              {p}
            </motion.p>
          ))}
        </div>

        {/* Closing Signature */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 text-right select-none"
        >
          <span className="block text-sm text-[#e8a6b8]/60 font-serif mb-1">Always yours</span>
          <span className="font-parisienne text-4xl text-[#d3a768] font-medium tracking-wide">
            Washington
          </span>
        </motion.div>
      </motion.div>

      {/* Embedded Love Journey Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="mt-16 text-center select-none"
      >
        <span className="text-xs uppercase tracking-[0.2em] text-[#e8a6b8]/70 block mb-2 font-serif">
          Our Special Path
        </span>
        <h3 className="font-serif italic text-xl md:text-2xl text-[#f3e6d8]/90 mb-8">
          milestones along the way
        </h3>

        {/* Timeline visualization */}
        <div className="relative border-l border-[#d3a768]/20 pl-6 ml-4 md:ml-8 space-y-8 text-left max-w-md mx-auto">
          {timelineData.map((item, index) => (
            <div key={index} className="relative group">
              {/* Timeline Pin */}
              <div 
                className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-[#1c0d16] border border-[#d3a768]/45 flex items-center justify-center shadow-lg group-hover:border-[#ff7a9a] transition-all cursor-pointer z-10"
                onClick={() => setActiveTimeline(activeTimeline === index ? null : index)}
              >
                {item.icon}
              </div>

              {/* Content box */}
              <div 
                className="cursor-pointer"
                onClick={() => setActiveTimeline(activeTimeline === index ? null : index)}
              >
                <span className="text-xs font-serif text-[#d3a768] block mb-1">
                  {item.date}
                </span>
                <h4 className="font-serif italic text-[#f3e6d8] text-base group-hover:text-[#ff7a9a] transition-colors">
                  {item.title}
                </h4>
                
                {/* Expandable memory description */}
                <motion.div
                  initial={false}
                  animate={{ 
                    height: activeTimeline === index ? 'auto' : 0, 
                    opacity: activeTimeline === index ? 1 : 0 
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-[#f3e6d8]/75 leading-relaxed pt-2 pr-4 font-serif">
                    {item.description}
                  </p>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
