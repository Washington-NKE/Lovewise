'use client';

import React, { useState } from 'react';
import { Cinzel, Great_Vibes, Plus_Jakarta_Sans } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';

import { PageGuard } from '@/components/PageGuard';
import { SorryBackground } from '@/domains/sorry-letter/components/SorryBackground';
import { SorryEnvelope } from '@/domains/sorry-letter/components/SorryEnvelope';
import { SorryLetterContent } from '@/domains/sorry-letter/components/SorryLetterContent';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cinzel',
});

const vibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-vibes',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jakarta',
});

export default function SorrySarahPage() {
  const [isOpened, setIsOpened] = useState(false);

  const handleOpenLetter = () => {
    setIsOpened(true);
  };

  return (
    <PageGuard pagePath="/washington/sorry-my-love-sarah">
      <main className={`${cinzel.variable} ${vibes.variable} ${jakarta.variable} min-h-screen w-full relative overflow-x-hidden font-[family:var(--font-jakarta)] selection:bg-rose-500/25 selection:text-white`}>
        {/* 1. Rising Sparks Particle Layer */}
        <SorryBackground />

        <div className="relative min-h-screen flex flex-col justify-between py-12 z-10">
          <div className="flex-1 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {!isOpened ? (
                /* Header / Envelope Display */
                <motion.div
                  key="envelope"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.8 } }}
                  className="w-full max-w-lg px-4"
                >
                  <div className="text-center mb-8">
                    <p className="font-serif italic text-xs text-[#dfb15b] tracking-[4px] uppercase mb-2">
                      A Letter From The Heart
                    </p>
                    <h1 className="font-[family:var(--font-vibes)] text-6xl text-white drop-shadow-[0_0_20px_rgba(230,57,86,0.4)] mb-3">
                      Hey Love...
                    </h1>
                    <p className="text-xs text-[#b39db0] max-w-[320px] mx-auto leading-relaxed">
                      Or perhaps I should simply call you <span className="text-[#dfb15b]">Sarah</span>.
                    </p>
                  </div>

                  <SorryEnvelope isOpened={isOpened} onOpen={handleOpenLetter} />
                </motion.div>
              ) : (
                /* Letter Body Display */
                <motion.div
                  key="letter"
                  initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.2, duration: 1, ease: 'easeOut' }}
                  className="w-full"
                >
                  <div className="text-center pt-8 pb-4">
                    <h1 className="font-[family:var(--font-vibes)] text-6xl text-white drop-shadow-[0_0_20px_rgba(230,57,86,0.3)]">
                      Sarah
                    </h1>
                    <p className="text-[10px] tracking-widest text-[#dfb15b] uppercase font-serif mt-1">
                      Always
                    </p>
                  </div>

                  <SorryLetterContent />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer branding */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1 }}
            className="text-center text-[10px] tracking-[3px] text-[#e8a6b8]/20 mt-auto select-none pointer-events-none font-serif"
          >
            made with a quiet kind of love
          </motion.footer>
        </div>
      </main>
    </PageGuard>
  );
}
