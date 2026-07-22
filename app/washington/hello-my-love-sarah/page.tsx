'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Cormorant_Garamond, Playfair_Display, Parisienne } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';

import { ParticleBackground, ParticleType } from '@/domains/love-letter/components/ParticleBackground';
import { Envelope } from '@/domains/love-letter/components/Envelope';
import { LetterContent } from '@/domains/love-letter/components/LetterContent';
import { ReasonCards } from '@/domains/love-letter/components/ReasonCards';
import { AmbienceControls } from '@/domains/love-letter/components/AmbienceControls';
import { LoveUnlocker } from '@/domains/love-letter/components/LoveUnlocker';
import { AudioEngine } from '@/domains/love-letter/components/AudioEngine';
import { PageGuard } from '@/components/PageGuard';

// Import Google Fonts
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
});

const parisienne = Parisienne({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-parisienne',
});

export default function SarahLoveLetter() {
  const [isOpened, setIsOpened] = useState(false);
  const [glowLevel, setGlowLevel] = useState(70);
  const [particleType, setParticleType] = useState<ParticleType>('all');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const audioEngineRef = useRef<AudioEngine | null>(null);

  // Initialize AudioEngine on client mount
  useEffect(() => {
    audioEngineRef.current = new AudioEngine();
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.stop();
      }
    };
  }, []);

  const toggleAudio = () => {
    if (!audioEngineRef.current) return;
    if (isAudioPlaying) {
      audioEngineRef.current.stop();
      setIsAudioPlaying(false);
    } else {
      audioEngineRef.current.start();
      setIsAudioPlaying(true);
    }
  };

  const handleOpenEnvelope = () => {
    setIsOpened(true);
    // Auto-start ambient audio on envelope opening (helps with user interaction requirement)
    if (audioEngineRef.current && !isAudioPlaying) {
      audioEngineRef.current.start();
      setIsAudioPlaying(true);
    }
  };

  // Dynamic backdrops reacting to Love Glow Warmth slider
  const backgroundStyle = {
    background: `
      radial-gradient(ellipse 70% 50% at 50% 0%, rgba(88, 20, 46, ${(glowLevel / 100) * 0.75}), transparent 60%),
      radial-gradient(ellipse 60% 40% at 20% 100%, rgba(58, 15, 34, ${(glowLevel / 100) * 0.65}), transparent 60%),
      #0a060a
    `,
    transition: 'background 0.3s ease-out',
  };

  return (
    <PageGuard pagePath="/washington/hello-my-love-sarah">
      <main
        style={backgroundStyle}
        className={`${cormorant.variable} ${playfair.variable} ${parisienne.variable} min-h-screen text-[#f3e6d8] relative overflow-x-hidden font-[family:var(--font-cormorant)] selection:bg-[#ff7a9a]/25 selection:text-white`}
      >
        {/* 1. Canvas particle layer */}
        <ParticleBackground type={particleType} />

        {/* 2. Floating control panel */}
        <AmbienceControls
          glowLevel={glowLevel}
          setGlowLevel={setGlowLevel}
          particleType={particleType}
          setParticleType={setParticleType}
          isAudioPlaying={isAudioPlaying}
          toggleAudio={toggleAudio}
        />

        {/* 3. Envelope / Letter scene display */}
        <div className="relative min-h-screen flex flex-col justify-between py-12 px-4 z-20">
          <div className="flex-1 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {!isOpened ? (
                <motion.div
                  key="envelope"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.8 } }}
                  className="w-full"
                >
                  <Envelope isOpened={isOpened} onOpen={handleOpenEnvelope} />
                </motion.div>
              ) : (
                <motion.div
                  key="letter"
                  initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.2, duration: 1, ease: 'easeOut' }}
                  className="w-full py-6 flex flex-col items-center"
                >
                  {/* Prose Love Letter & Milestones */}
                  <LetterContent />

                  {/* 3D Tilt Memory Cards */}
                  <ReasonCards />

                  {/* Smile / Heart Burst unlocker */}
                  <LoveUnlocker />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            transition={{ delay: 1 }}
            className="text-center text-xs tracking-widest text-[#e8a6b8]/40 pt-16 mt-auto pointer-events-none select-none font-serif"
          >
            made with a quiet kind of love
          </motion.footer>
        </div>
      </main>
    </PageGuard>
  );
}
