'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {Volume2, VolumeX, Sparkles, CheckCircle2, Heart} from 'lucide-react';
import { SorryAudioEngine } from './SorryAudioEngine';

interface Spark {
  id: number;
  x: number;
  y: number;
  destX: number;
  destY: number;
}

interface PolaroidProps {
  title: string;
  shortDesc: string;
  revealText: string;
}

const Polaroid: React.FC<PolaroidProps> = ({ title, shortDesc, revealText }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotate] = useState((Math.random() - 0.5) * 6); // Random tilt angle for realistic look

  return (
    <>
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
      <div 
        onClick={(e) => {
          e.stopPropagation();
          setIsFlipped(!isFlipped);
        }}
        className="w-full aspect-[4/5] cursor-pointer perspective-1000 select-none"
        style={{ transform: `rotate(${rotate}deg)` }}
      >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="w-full h-full relative transform-style-3d shadow-xl rounded-xl border border-[#dfb15b]/20"
      >
        {/* Front side (Polaroid frame) */}
        <div className="absolute inset-0 backface-hidden bg-[#faf8f5] p-3 flex flex-col justify-between rounded-xl">
          {/* Simulated photo slot */}
          <div className="w-full aspect-square bg-gradient-to-br from-[#2c0c16] to-[#0c0408] border border-rose-950/20 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient opacity-40" />
            <Heart className="w-6 h-6 text-[#dfb15b]/40 animate-pulse" />
          </div>
          {/* Polaroid label */}
          <div className="pt-2.5 text-center">
            <p className="font-serif text-[#1b0813] text-sm font-semibold">{title}</p>
            <p className="text-[10px] text-gray-400 font-serif italic mt-0.5">{shortDesc}</p>
          </div>
        </div>

        {/* Back side (Note text) */}
        <div 
          className="absolute inset-0 backface-hidden bg-[#faf8f5] p-4 flex flex-col justify-center items-center text-center rounded-xl"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <p className="font-serif italic text-xs text-[#1b0813] leading-relaxed">
            {revealText}
          </p>
          <div className="mt-4 w-6 h-[1px] bg-[#dfb15b]" />
        </div>
      </motion.div>
    </div>
    </>
  );
};

export const SorryLetterContent: React.FC = () => {
  // Thought Cycler State
  const thoughts = [
    "I lost hope that I could make you happy again.",
    "I lost hope that I could make you feel safe with me.",
    "I lost hope that we'd ever create new memories together."
  ];
  const [thoughtIdx, setThoughtIdx] = useState(0);

  // Audio Engine State
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioEngineRef = useRef<SorryAudioEngine | null>(null);

  // Sparkles state
  const [sparks, setSparks] = useState<Spark[]>([]);

  // 1. Initialize Audio Engine
  useEffect(() => {
    audioEngineRef.current = new SorryAudioEngine();
    return () => {
      audioEngineRef.current?.stop();
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

  // Sparkle on click handler
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const newSparks: Spark[] = Array.from({ length: 6 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 50 + 20;
      return {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        destX: e.clientX + Math.cos(angle) * dist,
        destY: e.clientY + Math.sin(angle) * dist,
      };
    });

    setSparks((prev) => [...prev, ...newSparks]);

    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => !newSparks.includes(s)));
    }, 800);
  };

  // Game state
  const promises = [
    { id: 1, label: "Listening first", gathered: false, desc: "To understand, not just reply." },
    { id: 2, label: "Rebuilding trust", gathered: false, desc: "Grown in action, step by step." },
    { id: 3, label: "Patience in healing", gathered: false, desc: "Giving space without deadline." },
    { id: 4, label: "Unconditional support", gathered: false, desc: "Being there even in quiet times." },
    { id: 5, label: "Honest communication", gathered: false, desc: "No silence, only truth." }
  ];
  const [gameState, setGameState] = useState(promises);
  const [healed, setHealed] = useState(false);

  const handleGatherPromise = (id: number) => {
    setGameState(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, gathered: true } : p);
      if (updated.every(p => p.gathered)) {
        setHealed(true);
      }
      return updated;
    });
  };

  return (
    <div 
      onClick={handlePageClick} 
      className="w-full relative min-h-screen text-[#f3e6d8] pb-24 select-none px-4"
    >
      {/* Floating Audio Controls */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleAudio();
          }}
          className="w-12 h-12 rounded-full bg-[#1b0813]/85 border border-[#ff7a9a]/20 backdrop-blur-md flex items-center justify-center text-[#ff7a9a] hover:bg-[#ff7a9a]/10 hover:text-white transition-all shadow-lg cursor-pointer"
        >
          {isAudioPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Click Sparkles */}
      <AnimatePresence>
        {sparks.map((s) => (
          <motion.div
            key={s.id}
            initial={{ left: s.x - 2, top: s.y - 2, scale: 1, opacity: 1 }}
            animate={{ left: s.destX - 2, top: s.destY - 2, scale: 0, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              width: '4px',
              height: '4px',
              backgroundColor: '#ff4d6d',
              borderRadius: '50%',
              pointerEvents: 'none',
              boxShadow: '0 0 8px #ff4d6d',
              zIndex: 9999,
            }}
          />
        ))}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto space-y-16 mt-16 font-[family:var(--font-jakarta)] leading-relaxed text-center sm:text-left">
        
        {/* Section 1: Intro */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6 max-w-xl mx-auto"
        >
          <p className="text-lg sm:text-xl font-light text-rose-100/90 tracking-wide">
            <span className="font-serif italic text-4xl text-[#dfb15b] pr-2 font-medium">T</span>
            he truth is, we never really broke up. We just... <span className="text-[#ff4d6d] font-semibold">drifted apart</span>. We stopped talking as much. We stopped spending time together. We stopped going on dates. Life quietly placed distance between us until one day, we were no longer what we used to be. But despite all that, a part of me has never truly let go.
          </p>
          <p className="text-rose-100/80 font-light text-sm sm:text-base">
            Meeting you remains one of the most unforgettable moments of my life. I still remember seeing you through the window huko lib, hearing your voice before I could properly see your face. You had this presence that immediately caught my attention. And when I finally saw you clearly, I remember thinking, <em className="italic font-serif text-[#dfb15b]">"Wow... she's beautiful."</em>
          </p>
          <p className="text-rose-100/80 font-light text-sm sm:text-base">
            Little did I know that the girl behind that smile would become someone who would leave such a permanent mark on my heart.
          </p>
        </motion.div>

        {/* Section 2: Memories & 3D Reveal Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <p className="text-rose-100/90 font-light text-sm sm:text-base max-w-xl mx-auto">
            Then came the memories. The conversations, the laughter, the little moments that probably seemed ordinary at the time but have since become priceless to me.
          </p>
          
          {/* 3D Polaroids Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-lg mx-auto">
            <Polaroid 
              title="St. Anne chronicals"
              shortDesc="Tap to reveal memory" 
              revealText="We sat in the quiet, touching each other as the world passed by. Tulikiss kwa hiyo library. In those moments, I felt closer to you than ever before."
            />
            <Polaroid 
              title="Boda Ride"
              shortDesc="Tap to reveal memory" 
              revealText="Cold wind on our faces, but my hand full of your tits was all the warmth I needed."
            />
            <Polaroid 
              title="Soup Date"
              shortDesc="Tap to reveal memory" 
              revealText="Piping hot soup, you giving me clear signals. Iyo time nilikuwa sure unanipenda. Simple times that are now priceless memories."
            />
            <Polaroid
                title="cuerpo a cuerpo"
                shortDesc="Tap to reveal memory"
                revealText="Our sex moments are my most cherished ones as you know. But I'm not going to talk much about that. I miss your moaning."
              />
          </div>

          <p className="text-rose-100/90 font-light text-sm sm:text-base max-w-xl mx-auto">
            I remember them all. And I miss them more than I can put into words.
          </p>
        </motion.div>

        {/* Section 3: Regrets & Mistakes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6 max-w-xl mx-auto"
        >
          <p className="text-rose-100/90 font-light text-sm sm:text-base">
            Then life happened. More truthfully, <strong className="text-[#ff4d6d] font-bold">I happened.</strong>
          </p>
          <p className="text-rose-100/80 font-light text-sm sm:text-base">
            I made mistakes. I hurt you. I failed to love you in the way you deserved to be loved. I was remorseful even then, but I didn't know how to show it, and that is something I regret deeply. Every time I think about what happened, there is still a quiet apology in my heart. Najua huonangi kama ni ukweli but I always wish I'd have held you very close to me during that time.
          </p>

          <div className="font-serif italic border-l-2 border-[#dfb15b] pl-5 my-6 text-[#ebd09b] text-sm sm:text-base leading-relaxed bg-[#dfb15b]/5 py-4 pr-4 rounded-r-lg text-left">
            "You once told me that you forgave me. Thank you for that.<br />
            You also told me you couldn't forget."
          </div>

          <p className="text-rose-100/80 font-light text-sm sm:text-base">
            At first, that hurt to hear. But over time I've come to understand it. Some wounds don't disappear simply because someone says "I'm sorry." Betrayal leaves echoes, and healing has no deadline. I accept that now.
          </p>
          <p className="text-rose-100/80 font-light text-sm sm:text-base">
            What I hope you never doubt is this: <strong>I loved you then, and I still love you now, nakupenda sana</strong>, even though life has carried us in different directions.
          </p>
        </motion.div>

        {/* Section 4: Confession Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6 max-w-xl mx-auto"
        >
          <p className="text-rose-100/90 font-light text-sm sm:text-base">
            I decided to write because silence has never really answered anything. Maybe this letter changes nothing. Maybe it changes everything. Either way, these are words I needed to say.
          </p>
          <p className="text-rose-100/80 font-light text-sm sm:text-base">
            Everything I ever told you about my life after us has been true. I haven't had another relationship since. After kuachana na Risper tulidate nawewe for a few days. And haikuwork. So that's double heartbreaks in a short time frame. There were moments of flirting, perhaps an attempt to distract myself from loneliness, but nothing meaningful, nothing that ever came close to what we had. Right now, my focus is on finishing my degree and rebuilding the man I want to become.
          </p>

          <hr className="border-0 h-[1px] bg-rose-500/20 my-8" />

          <p className="text-[#dfb15b] font-serif italic text-lg">There is something else I need to admit.</p>
          <p className="text-[#ff4d6d] font-serif uppercase tracking-widest text-lg">I don't trust you.</p>
          <p className="text-[#f3e6d8]/75 font-light text-sm sm:text-base">
            Those words sound harsher than I intend them to, but honesty has always felt kinder than pretending. Perhaps it isn't really about you. Perhaps it's about fear.
          </p>
          <p className="text-[#f3e6d8]/75 font-light text-sm sm:text-base">
            The last time I opened my heart to you, I was met with silence. Maybe you had your reasons, I don't know. But silence has a strange way of planting doubt in a person's heart.
          </p>
        </motion.div>

        {/* Section 5: Trust & Cycler */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6 max-w-xl mx-auto"
        >
          <p className="text-rose-100/90 font-light text-sm sm:text-base">
            I've often wondered whether you've found someone else. Someone who gives you the time and attention I failed to give you. Someone who makes you smile the way I once hoped I could. I don't know if that's true, and I'm not accusing you of anything. It's simply where my mind has wandered.
          </p>
          <p className="text-rose-100/80 font-light text-sm sm:text-base">
            Eventually, I stopped trying. Not because I stopped loving you. Because I convinced myself I'd already lost.
          </p>

          {/* Clean Thought Cycler Note */}
          <div className="border border-rose-500/15 bg-[#1b0813]/40 backdrop-blur-xl rounded-2xl p-6 text-center my-8 flex flex-col justify-center items-center shadow-xl">
            <div className="h-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={thoughtIdx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm italic text-[#b39db0] font-serif"
                >
                  "{thoughts[thoughtIdx]}"
                </motion.p>
              </AnimatePresence>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setThoughtIdx((prev) => (prev + 1) % thoughts.length);
              }}
              className="mt-4 bg-transparent border border-[#ff7a9a]/40 hover:bg-[#ff7a9a]/20 text-[#ff7a9a] text-xs px-5 py-2.5 rounded-full cursor-pointer transition-all duration-300 tracking-wider uppercase"
            >
              Tap to read deeper
            </button>
          </div>

          <p className="text-rose-100/80 font-light text-sm sm:text-base">
            Today reminded me that some emotions never really disappear. They simply wait for the right moment to remind you they're still there. Nilikuwa nawish tu ungenihold uniambie you still love me too. You show me your nipples and tell me that they've missed my touch. But maybe naotanga sana.
          </p>
          <p className="text-rose-100/80 font-light text-sm sm:text-base">
            So yes... <strong className="text-[#ff4d6d] font-bold">I love you.</strong> But somewhere along the journey, fear found a place where trust once lived.
          </p>
        </motion.div>

        {/* Section 6: Interactive Kintsugi Heart Game */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="border border-[#dfb15b]/15 bg-black/40 backdrop-blur-xl rounded-2xl p-6 sm:p-10 shadow-2xl max-w-xl mx-auto space-y-6"
        >
          <p className="font-serif italic text-sm text-[#dfb15b] tracking-wider uppercase">
            Interactive: Ningepromise hizi
          </p>
          
          <div className="flex flex-col items-center justify-center py-4 relative">
            {/* SVG Cracked/Healed Heart */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg viewBox="0 0 32 29.6" className="w-full h-full">
                {/* Healed golden kintsugi fill */}
                <motion.path
                  d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2
                  c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"
                  fill="#ff4d6d"
                  fillOpacity={healed ? 0.25 : 0.08}
                  stroke="#ff4d6d"
                  strokeWidth="0.8"
                  className="transition-all duration-1000"
                />
                
                {/* Broken lines / Kintsugi lines */}
                <motion.path
                  d="M16,5 L14,10 L18,14 L14,18 L16,22"
                  fill="none"
                  stroke={healed ? "#dfb15b" : "#ff4d6d"}
                  strokeWidth={healed ? "1.5" : "0.8"}
                  strokeDasharray={healed ? "0" : "2,2"}
                  className="transition-all duration-1000"
                  style={{
                    filter: healed ? 'drop-shadow(0 0 8px #dfb15b)' : 'none'
                  }}
                />
              </svg>

              {/* Heartbeat pulsing glow */}
              <div className={`absolute inset-0 rounded-full border border-rose-500/10 animate-ping pointer-events-none ${healed ? 'block' : 'hidden'}`} />
            </div>

            <p className="text-xs text-[#b39db0] text-center max-w-sm mt-4 font-light">
              {healed 
                ? "The heart is patched with gold. Repair is a deliberate choice." 
                : "Tap tap screen. Tap! tap!, tap! tap!."}
            </p>
          </div>

          {/* Promises Grid selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {gameState.map((p) => (
              <button
                key={p.id}
                disabled={p.gathered}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGatherPromise(p.id);
                }}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-300 flex items-start gap-2.5 ${
                  p.gathered
                    ? 'border-[#dfb15b]/40 bg-[#dfb15b]/5 text-[#dfb15b]'
                    : 'border-rose-950/40 bg-black/20 hover:border-rose-500/40 text-[#f3e6d8]/75'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {p.gathered ? (
                    <CheckCircle2 className="w-4 h-4 text-[#dfb15b]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-rose-500/40 shrink-0" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold font-serif tracking-wider">{p.label}</p>
                  <p className="text-[10px] opacity-60 mt-0.5 leading-normal">{p.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Success Note popup */}
          <AnimatePresence>
            {healed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-4 rounded-xl bg-[#dfb15b]/5 border border-[#dfb15b]/30 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#dfb15b] to-transparent" />
                <p className="font-serif italic text-xs text-[#dfb15b] leading-relaxed">
                  "Ningepromise ku-work on these steps every day, not just to repair what was broken, but to grow into the partner you deserved. Anyways..."
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Section 7: Forgiveness & Growth */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6 max-w-xl mx-auto"
        >
          <p className="text-rose-100/90 font-light text-sm sm:text-base">
            If there is one thing I ask of you, it is this: <strong className="text-[#ff4d6d]">please forgive me</strong>. Not only for what happened last year, but for every moment I've ever made you feel unloved, unimportant, disappointed, or burdened. Those memories weigh on me more than you probably know.
          </p>
          <p className="text-rose-100/80 font-light text-sm sm:text-base">
            You are an extraordinary girl. Unakuanga umeiva sana. You are beautiful, inside and out. Napenda figa yako. Your smile has always been my favourite thing about you. Your nipples too. The smile has a way of making everything around it feel lighter. You carried yourself with confidence, grace, and a spark that made you unforgettable.
          </p>
          <p className="text-rose-100/80 font-light text-sm sm:text-base">
            Sometimes I imagine the life we might have built together. Maybe we would have had beautiful children. Maybe I would have proudly introduced you to everyone I knew, grateful that someone as remarkable as you chose me. Maybe those dreams were never meant to happen.
          </p>
          <p className="italic text-[#dfb15b] font-serif">But they were beautiful dreams nonetheless.</p>
        </motion.div>

        {/* Section 8: Sign off */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6 max-w-xl mx-auto pt-8 border-t border-rose-950/20"
        >
          <p className="text-rose-100/90 font-light text-sm sm:text-base">
            I've reached the end of this letter, not because I've run out of things to say, but because words eventually become too small for certain feelings.
          </p>
          <p className="text-rose-100/80 font-light text-sm sm:text-base">
            If we had met again ile time nilikucall, perhaps I would have said all this in person. Since we couldn't, these pages will have to carry what my voice could not.
          </p>
          <p className="text-rose-100/80 font-light text-sm sm:text-base">
            Thank you for every beautiful memory you gave me.<br />
            Thank you for loving me when you did.<br />
            And thank you for helping shape the person I am still trying to become.
          </p>

          <p className="text-[#dfb15b] font-serif italic text-sm sm:text-base pt-4">
            Take care of yourself, Sarah. Wherever life leads you, I sincerely hope it is kind to you.
          </p>
          <p className="text-rose-100/90 font-light text-sm sm:text-base">
            I will always have love for you, and a part of me always will.
          </p>

          <div className="text-right pt-6">
            <p className="font-serif italic text-xs text-[#b39db0]">With love,</p>
            <p className="font-[family:var(--font-vibes)] text-6xl text-[#ff4d6d] mt-2">Always.</p>
          </div>
        </motion.div>

        <p className="text-center text-[10px] tracking-widest text-[#b39db0]/35 font-serif pt-16">
          ✨ nakupenda sana. not only to have sex with you, or have you touch me, but you're a work of art and I love you! ✨
        </p>

      </div>
    </div>
  );
};
