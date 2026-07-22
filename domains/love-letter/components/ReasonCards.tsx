'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface CardData {
  front: string;
  back: string;
}

export const ReasonCards: React.FC = () => {
  const cards: CardData[] = [
    {
      front: 'Your laugh',
      back: "It's the first thing I fell for, and it still gets me every single time.",
    },
    {
      front: 'The little things',
      back: 'The way you remember details I forgot I even said. You always do.',
    },
    {
      front: 'Your strength',
      back: 'The quiet kind, the kind that shows up on the hardest days without asking for credit.',
    },
    {
      front: 'Just... you',
      back: "No specific reason needed. It's just always been you.",
    },
  ];

  return (
    <div className="w-full max-w-[620px] mx-auto mt-20 select-none">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="font-serif italic text-2xl md:text-3xl text-[#e8a6b8] text-center mb-8"
      >
        a few reasons, of many
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 px-2">
        {cards.map((card, idx) => (
          <TiltCard key={idx} card={card} />
        ))}
      </div>
    </div>
  );
};

interface TiltCardProps {
  card: CardData;
}

const TiltCard: React.FC<TiltCardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Motion values for tilt effect
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Smooth springs for rotation
  const rotateXSpring = useSpring(useTransform(y, [0, 1], [15, -15]), { damping: 20, stiffness: 200 });
  const rotateYSpring = useSpring(useTransform(x, [0, 1], [-15, 15]), { damping: 20, stiffness: 200 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize coordinates to [0, 1] range
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    // Reset to center
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div 
      className="h-[160px] perspective-[1000px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full relative duration-200 transition-shadow rounded-lg"
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.65, ease: [0.4, 0.2, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full h-full absolute inset-0 rounded-lg shadow-lg border border-[#d3a768]/15 bg-transparent"
        >
          {/* Front Face */}
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0 bg-gradient-to-br from-[#2b0c1a] to-[#14050e] rounded-lg p-5 flex flex-col items-center justify-center border border-[#d3a768]/20 text-[#d3a768] hover:border-[#e6c99a]/40 transition-colors shadow-inner"
          >
            {/* Soft backdrop radial light */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(211,167,104,0.06),transparent_70%)] pointer-events-none" />
            <h4 className="font-serif italic text-lg md:text-xl font-medium tracking-wide relative z-10">
              {card.front}
            </h4>
            <div className="mt-3 text-[#e8a6b8]/50 text-[10px] uppercase tracking-wider relative z-10">
              click to flip
            </div>
          </div>

          {/* Back Face */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 bg-gradient-to-br from-[#58142e] to-[#3a0f22] rounded-lg p-5 flex items-center justify-center border border-[#ff7a9a]/20 text-[#f3e6d8] text-center shadow-inner"
          >
            <p className="font-serif text-[0.98rem] md:text-[1.05rem] leading-relaxed italic">
              {card.back}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
