'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Volume2, VolumeX, Flame, Sparkles, Heart, Settings, X, EyeOff } from 'lucide-react';
import { ParticleType } from './ParticleBackground';

interface AmbienceControlsProps {
  glowLevel: number;
  setGlowLevel: (level: number) => void;
  particleType: ParticleType;
  setParticleType: (type: ParticleType) => void;
  isAudioPlaying: boolean;
  toggleAudio: () => void;
}

export const AmbienceControls: React.FC<AmbienceControlsProps> = ({
  glowLevel,
  setGlowLevel,
  particleType,
  setParticleType,
  isAudioPlaying,
  toggleAudio,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-6 right-6 z-50">
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-[#3a0f22]/80 backdrop-blur-md border border-[#d3a768]/30 shadow-lg text-[#f3e6d8] hover:bg-[#58142e] hover:border-[#e6c99a] transition-all cursor-pointer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open ambiance dashboard"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5 animate-spin-slow" />}
      </motion.button>

      {/* Control Dashboard Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute top-16 right-0 w-80 bg-black/40 backdrop-blur-xl border border-[#d3a768]/20 rounded-2xl p-5 shadow-2xl text-[#f3e6d8] overflow-hidden"
          >
            {/* Background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#3a0f22]/10 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div>
                <h3 className="font-semibold text-sm tracking-wider uppercase text-[#d3a768] mb-1">
                  Ambiance Dashboard
                </h3>
                <p className="text-xs text-[#e8a6b8]/70">Customize your sensory experience</p>
              </div>

              {/* Music Synthesizer Toggle */}
              <div className="p-3 bg-[#3a0f22]/20 border border-[#d3a768]/10 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full bg-rose-950/50 flex items-center justify-center border border-[#e8a6b8]/10">
                    <Music className={`w-4 h-4 ${isAudioPlaying ? 'text-[#ff7a9a] animate-pulse' : 'text-gray-400'}`} />
                    {isAudioPlaying && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold">Generative Soundscape</h4>
                    <p className="text-[10px] text-gray-400">Pure Web Audio synthesizer</p>
                  </div>
                </div>
                
                <button
                  onClick={toggleAudio}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                    isAudioPlaying
                      ? 'bg-rose-500/20 border-rose-500/40 text-[#ff7a9a]'
                      : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {isAudioPlaying ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Off</span>
                    </>
                  )}
                </button>
              </div>

              {/* Glow Intensity Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#ff7a9a]" /> Love Glow Warmth
                  </span>
                  <span className="text-[#d3a768]">{glowLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={glowLevel}
                  onChange={(e) => setGlowLevel(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#170a14] rounded-lg appearance-none cursor-pointer accent-[#ff7a9a] border border-[#d3a768]/10"
                />
              </div>

              {/* Particles Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d3a768]" /> Floating Atmosphere
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['all', 'petals', 'sparks', 'hearts'] as const).map((type) => {
                    const label =
                      type === 'all'
                        ? 'All'
                        : type === 'petals'
                        ? 'Rose Petals'
                        : type === 'sparks'
                        ? 'Gold Sparks'
                        : 'Hearts';
                    
                    const icon =
                      type === 'all' ? (
                        <Sparkles className="w-3 h-3" />
                      ) : type === 'petals' ? (
                        <span className="text-xs">🌸</span>
                      ) : type === 'sparks' ? (
                        <Sparkles className="w-3 h-3 text-[#d3a768]" />
                      ) : (
                        <Heart className="w-3 h-3 text-[#ff7a9a]" />
                      );

                    return (
                      <button
                        key={type}
                        onClick={() => setParticleType(type)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          particleType === type
                            ? 'bg-[#3a0f22]/70 border-[#d3a768]/60 text-[#e6c99a] shadow-inner'
                            : 'bg-transparent border-[#d3a768]/10 text-[#f3e6d8]/75 hover:bg-white/5'
                        }`}
                      >
                        {icon}
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
