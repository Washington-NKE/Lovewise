'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface EnvelopeProps {
  isOpened: boolean;
  onOpen: () => void;
}

export const Envelope: React.FC<EnvelopeProps> = ({ isOpened, onOpen }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] relative z-25">
      {/* Title block */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isOpened ? 0 : 1, y: isOpened ? -20 : 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="text-center mb-10 select-none pointer-events-none"
      >
        <span className="text-xs uppercase tracking-[0.35em] text-[#e8a6b8] opacity-80 block mb-3 font-serif">
          A little something
        </span>
        <h1 className="text-5xl md:text-6xl font-serif italic text-[#f3e6d8] font-medium drop-shadow-[0_0_20px_rgba(232,166,184,0.15)]">
          for you
        </h1>
      </motion.div>

      {/* 3D Envelope Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateY: -5 }}
        animate={{ 
          opacity: isOpened ? [1, 1, 0] : 1, 
          scale: isOpened ? [1, 1.05, 0.95] : 1, 
          filter: isOpened ? ['blur(0px)', 'blur(0px)', 'blur(10px)'] : 'blur(0px)',
          y: isOpened ? [0, -10, 50] : 0,
        }}
        transition={{ 
          duration: 1.5, 
          times: [0, 0.4, 1],
          ease: 'easeInOut' 
        }}
        className="relative w-[340px] max-w-[85vw] aspect-[3/2] perspective-[1200px] cursor-pointer"
        onClick={onOpen}
      >
        {/* Shadow under the envelope */}
        <div className="absolute -bottom-8 left-10 right-10 h-6 bg-black/40 blur-xl rounded-full pointer-events-none transform scale-95" />

        {/* 1. Letter Peek (inside the envelope) */}
        <motion.div
          animate={{ y: isOpened ? '-60%' : '0%' }}
          transition={{ delay: 0.4, duration: 0.9, ease: 'easeOut' }}
          className="absolute inset-x-[8%] top-[12%] bottom-[8%] bg-gradient-to-b from-[#f5eae0] to-[#e6d0bb] rounded-sm shadow-md border border-amber-900/10 p-4 flex flex-col justify-start z-20 overflow-hidden"
        >
          <div className="w-full h-1 bg-[#3a0f22]/10 rounded mb-2" />
          <div className="w-3/4 h-1 bg-[#3a0f22]/10 rounded mb-2" />
          <div className="w-1/2 h-1 bg-[#3a0f22]/10 rounded" />
        </motion.div>

        {/* 2. Envelope Body (back and sides) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3a0f22] to-[#1c0812] rounded-md shadow-2xl border border-[#d3a768]/20 z-10 overflow-hidden">
          {/* Internal shadow pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(88,20,46,0.2),transparent)]" />
        </div>

        {/* 3. Envelope Flap (top folding triangle) */}
        <motion.div
          style={{ 
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            transformOrigin: 'top center' 
          }}
          animate={{ rotateX: isOpened ? -180 : 0, zIndex: isOpened ? 5 : 30 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-x-0 top-0 h-[56%] bg-gradient-to-b from-[#4a1128] to-[#2e0d1d] shadow-inner border-t border-[#d3a768]/10 z-30"
        />

        {/* 4. Wax Seal (button lock) */}
        <motion.div
          animate={{ 
            scale: isOpened ? 0 : 1, 
            rotate: isOpened ? 35 : 0,
            opacity: isOpened ? 0 : 1
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          whileHover={{ scale: 1.08 }}
          className="absolute top-1/2 left-1/2 w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#c9506f] via-[#6e1230] to-[#3a0b18] border border-[#ff7a9a]/20 shadow-[0_4px_12px_rgba(0,0,0,0.4),0_0_15px_rgba(197,80,111,0.25)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_20px_rgba(197,80,111,0.5)] z-40 flex items-center justify-center text-rose-100 font-serif text-lg font-bold select-none cursor-pointer"
        >
          ♥
        </motion.div>
      </motion.div>

      {/* Opening hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpened ? 0 : [0.45, 0.85, 0.45] }}
        transition={{ 
          opacity: { 
            repeat: Infinity, 
            duration: 2.6, 
            ease: 'easeInOut' 
          }
        }}
        className="text-[#e8a6b8] text-sm tracking-wide mt-8 font-light text-center select-none"
      >
        tap the seal to open it
      </motion.p>
    </div>
  );
};
