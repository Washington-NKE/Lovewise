'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';

interface BurstHeart {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  scale: number;
  rotate: number;
}

export const LoveUnlocker: React.FC = () => {
  const [loveCount, setLoveCount] = useState(0);
  const [bursts, setBursts] = useState<BurstHeart[]>([]);
  const [unlockedMsg, setUnlockedMsg] = useState<string | null>(null);

  // Load count on mount
  useEffect(() => {
    const saved = localStorage.getItem('love_sarah_count');
    if (saved) {
      setLoveCount(Number(saved));
    }
  }, []);

  const handleSendLove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newCount = loveCount + 1;
    setLoveCount(newCount);
    localStorage.setItem('love_sarah_count', String(newCount));

    // Define milestones and unlock messages
    if (newCount === 1) {
      setUnlockedMsg('A tiny spark is lit. ♥ Thank you, my love.');
    } else if (newCount === 10) {
      setUnlockedMsg('A warm fire... You make my ordinary days feel special.');
    } else if (newCount === 30) {
      setUnlockedMsg('To the moon and back. I feel so incredibly lucky to walk through life with you.');
    } else if (newCount === 50) {
      setUnlockedMsg("Always and forever. There's nobody in this universe like you, Sarah.");
    }

    // Capture click coordinates relative to window
    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    // Generate burst particles
    const newBursts: BurstHeart[] = Array.from({ length: 18 }).map((_, idx) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 150;
      return {
        id: Date.now() + idx,
        x: originX,
        y: originY,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance - 80, // float upwards slightly more
        scale: 0.6 + Math.random() * 0.8,
        rotate: Math.random() * 360,
      };
    });

    setBursts((prev) => [...prev, ...newBursts]);
  };

  // Clean up bursts
  useEffect(() => {
    if (bursts.length === 0) return;
    const timer = setTimeout(() => {
      setBursts([]);
    }, 1800);
    return () => clearTimeout(timer);
  }, [bursts]);

  return (
    <div className="w-full max-w-[620px] mx-auto mt-20 pb-20 text-center select-none relative">
      <p className="text-xs uppercase tracking-[0.15em] text-[#e8a6b8]/60 mb-3 font-serif">
        Press this if you feel like smiling
      </p>

      {/* Love Button */}
      <motion.button
        onClick={handleSendLove}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-3.5 rounded-full border border-[#d3a768]/40 bg-transparent text-[#e6c99a] font-serif tracking-widest text-sm hover:bg-[#3a0f22]/20 hover:border-[#e6c99a]/60 shadow-[0_0_15px_rgba(232,166,184,0.05)] hover:shadow-[0_0_25px_rgba(232,166,184,0.15)] transition-all cursor-pointer inline-flex items-center gap-2 group"
      >
        <Heart className="w-4 h-4 text-[#ff7a9a] group-hover:scale-125 transition-transform" />
        <span>send a little love back</span>
      </motion.button>

      {/* Counter */}
      <div className="mt-4 text-[11px] text-[#e8a6b8]/40 uppercase tracking-widest">
        love sent: {loveCount}
      </div>

      {/* Milestone Unlock Dialog */}
      <AnimatePresence>
        {unlockedMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-gradient-to-br from-[#2b0c1a]/95 to-[#1c0812]/95 border border-[#d3a768]/30 rounded-xl p-4 shadow-2xl backdrop-blur-md text-[#f3e6d8]"
          >
            <div className="flex gap-3 items-start">
              <div className="p-2 rounded-lg bg-[#3a0f22] border border-[#ff7a9a]/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#d3a768]" />
              </div>
              <div className="text-left space-y-1">
                <h5 className="text-xs uppercase font-semibold text-[#d3a768] tracking-wider">
                  Love Message Unlocked
                </h5>
                <p className="text-sm font-serif leading-relaxed text-[#f3e6d8]/90">
                  {unlockedMsg}
                </p>
              </div>
            </div>
            <button
              onClick={() => setUnlockedMsg(null)}
              className="mt-3 w-full py-1 bg-white/5 hover:bg-white/10 border border-[#d3a768]/15 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Burst Heart Particles */}
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.div
            key={b.id}
            initial={{ 
              opacity: 1, 
              scale: 0.2, 
              x: b.x, 
              y: b.y,
              rotate: 0
            }}
            animate={{ 
              opacity: [1, 0.9, 0], 
              scale: b.scale, 
              x: b.x + b.dx, 
              y: b.y + b.dy,
              rotate: b.rotate
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="fixed pointer-events-none z-45 text-[#ff7a9a] font-serif text-lg font-bold drop-shadow-[0_0_8px_rgba(255,122,154,0.6)]"
            style={{ left: 0, top: 0 }}
          >
            ♥
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
