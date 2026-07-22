'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface SorryEnvelopeProps {
  isOpened: boolean;
  onOpen: () => void;
}

export const SorryEnvelope: React.FC<SorryEnvelopeProps> = ({ isOpened, onOpen }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-[4/3] flex items-center justify-center p-4">
      {/* Outer Envelope Card Container */}
      <motion.div
        className="w-full h-full relative cursor-pointer select-none rounded-2xl overflow-visible bg-gradient-to-br from-[#1b0811] to-[#0c0408] border border-rose-950/40 shadow-2xl flex flex-col items-center justify-center p-6 text-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onOpen}
        whileHover={{ scale: 1.01, translateY: -2 }}
        transition={{ duration: 0.4 }}
      >
        {/* Decorative corner borders */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-rose-500/20" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-rose-500/20" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-rose-500/20" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-rose-500/20" />

        {/* Ambient Backlight glow */}
        <div className={`absolute w-48 h-48 rounded-full bg-rose-500/5 blur-3xl pointer-events-none transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-40'}`} />

        {/* Wax Seal Container */}
        <motion.div
          animate={{
            scale: isHovered ? 1.08 : 1,
            rotate: isHovered ? [0, 5, -5, 0] : 0,
          }}
          transition={{ duration: 0.6 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-[#dfb15b] to-[#b88c3a] border border-[#ffea9f]/30 flex items-center justify-center shadow-xl shadow-black/60 relative z-10"
        >
          {/* Inner details of seal */}
          <div className="w-13 h-13 rounded-full border border-[#9a752a]/40 flex items-center justify-center">
            <Heart className="w-6 h-6 text-[#7d5d1c] fill-[#7d5d1c]/10" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Text descriptions */}
        <div className="mt-8 space-y-2 z-10">
          <h3 className="font-serif italic text-[#dfb15b] tracking-wider text-sm uppercase">
            A Letter For Sarah
          </h3>
          <h2 className="font-serif text-[#f3e6d8] text-2xl font-medium tracking-wide">
            Hey Love...
          </h2>
          <p className="text-[11px] text-[#e8a6b8]/40 font-serif tracking-widest uppercase pt-2">
            click wax seal to break silence
          </p>
        </div>
      </motion.div>
    </div>
  );
};
