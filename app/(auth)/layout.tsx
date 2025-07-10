'use client'

import { ReactNode } from 'react'
import { useState, useEffect } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [time, setTime] = useState(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }

    const animationInterval = setInterval(() => {
      setTime(prev => prev + 0.1)
    }, 50)

    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearInterval(animationInterval)
    }
  }, [])

  return (
    <>
      <style jsx>{`
        @keyframes morphingBlob {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: translate(-50%, -50%) rotate(90deg) scale(1.1);
          }
          50% {
            border-radius: 50% 60% 30% 60% / 60% 40% 60% 30%;
            transform: translate(-50%, -50%) rotate(180deg) scale(0.9);
          }
          75% {
            border-radius: 60% 40% 60% 30% / 30% 70% 40% 60%;
            transform: translate(-50%, -50%) rotate(270deg) scale(1.05);
          }
        }
        
        @keyframes floatingOrbs {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }
        
        @keyframes pulseRing {
          0% {
            transform: scale(0.33);
            opacity: 1;
          }
          80%, 100% {
            transform: scale(2.33);
            opacity: 0;
          }
        }
        
        @keyframes particleFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }
        
        .morphing-blob {
          position: absolute;
          width: 500px;
          height: 500px;
          background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff, #06ffa5);
          animation: morphingBlob 8s ease-in-out infinite;
          filter: blur(40px);
          opacity: 0.7;
          left: 50%;
          top: 50%;
        }
        
        .floating-orb {
          position: absolute;
          border-radius: 50%;
          animation: floatingOrbs 6s ease-in-out infinite;
          filter: blur(2px);
        }
        
        .pulse-ring {
          position: absolute;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: particleFloat 4s ease-in-out infinite;
        }
        
        .glass-morphism {
          backdrop-filter: blur(16px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .interactive-glow {
          position: fixed;
          pointer-events: none;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255, 0, 110, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          transition: all 0.3s ease;
          z-index: 1;
        }
      `}</style>
      
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-hidden relative">
        {/* Interactive mouse glow */}
        <div 
          className="interactive-glow"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Morphing background blob */}
        <div className="morphing-blob" />
        
        {/* Secondary smaller blob */}
        <div 
          className="morphing-blob"
          style={{
            width: '300px',
            height: '300px',
            background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1)',
            animationDelay: '4s',
            animationDuration: '12s',
            left: '30%',
            top: '30%'
          }}
        />
        
        {/* Floating orbs */}
        <div 
          className="floating-orb"
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(45deg, #ff9a9e, #fecfef)',
            top: '20%',
            left: '10%',
            animationDelay: '0s'
          }}
        />
        <div 
          className="floating-orb"
          style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(45deg, #a8edea, #fed6e3)',
            top: '70%',
            right: '15%',
            animationDelay: '2s'
          }}
        />
        <div 
          className="floating-orb"
          style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(45deg, #ff758c, #ff7eb3)',
            top: '15%',
            right: '25%',
            animationDelay: '4s'
          }}
        />
        
        {/* Pulse rings */}
        <div 
          className="pulse-ring"
          style={{
            width: '100px',
            height: '100px',
            top: '25%',
            left: '20%',
            animationDelay: '0s'
          }}
        />
        <div 
          className="pulse-ring"
          style={{
            width: '150px',
            height: '150px',
            bottom: '30%',
            right: '20%',
            animationDelay: '1s'
          }}
        />
        
        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          />
        ))}
        
        <div className="relative z-10">
          {/* Glowing border effect */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-60"
            style={{
              background: `conic-gradient(from ${time * 2}deg, #ff006e, #8338ec, #3a86ff, #06ffa5, #ff006e)`,
              padding: '3px',
              filter: 'blur(8px)',
              animation: 'spin 10s linear infinite'
            }}
          />
          
          {/* Inner glow ring */}
          <div 
            className="absolute inset-0 rounded-3xl"
            style={{
              background: `linear-gradient(${time * 3}deg, rgba(255, 0, 110, 0.3), rgba(131, 56, 236, 0.3), rgba(58, 134, 255, 0.3))`,
              padding: '2px',
              filter: 'blur(4px)'
            }}
          />
          
          <main className="relative glass-morphism rounded-3xl p-1">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}