'use client';

import React, { useEffect, useRef } from 'react';

export type ParticleType = 'petals' | 'sparks' | 'hearts' | 'all';

interface ParticleBackgroundProps {
  type?: ParticleType;
  density?: 'low' | 'medium' | 'high';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  angle?: number;
  spin?: number;
  swayOffset?: number;
  swaySpeed?: number;
  colorType?: number; // to vary colors slightly
  pType: 'petal' | 'spark' | 'heart';
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  type = 'all',
  density = 'medium',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    // Scale canvas to device pixel ratio for sharp rendering
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseLeave);

    // Particle Generation helper
    const createParticle = (initY = false): Particle => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      const x = Math.random() * w;
      // If initializing, scatter across Y. If updating, spawn at edges.
      let y = initY ? Math.random() * h : -20;
      
      // Determine what particle type to create
      let pType: 'petal' | 'spark' | 'heart' = 'petal';
      if (type === 'all') {
        const rand = Math.random();
        if (rand < 0.4) pType = 'petal';
        else if (rand < 0.85) pType = 'spark';
        else pType = 'heart';
      } else if (type === 'petals') {
        pType = 'petal';
      } else if (type === 'sparks') {
        pType = 'spark';
        if (!initY) y = h + 20; // Sparks float up, so spawn at bottom
      } else if (type === 'hearts') {
        pType = 'heart';
        if (!initY) y = h + 20; // Hearts float up
      }

      // Configure based on type
      if (pType === 'petal') {
        return {
          x,
          y,
          vx: (Math.random() - 0.5) * 0.8,
          vy: 0.8 + Math.random() * 1.2,
          size: 6 + Math.random() * 10,
          opacity: 0.35 + Math.random() * 0.45,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.02,
          swayOffset: Math.random() * Math.PI * 2,
          swaySpeed: 0.01 + Math.random() * 0.02,
          colorType: Math.random() > 0.5 ? 0 : 1,
          pType,
        };
      } else if (pType === 'spark') {
        const floatUp = type === 'sparks' || type === 'all';
        return {
          x,
          y: initY ? Math.random() * h : (floatUp ? h + 10 : -10),
          vx: (Math.random() - 0.5) * 0.4,
          vy: floatUp ? -(0.3 + Math.random() * 0.6) : (0.3 + Math.random() * 0.6),
          size: 1.5 + Math.random() * 2,
          opacity: 0.15 + Math.random() * 0.6,
          swayOffset: Math.random() * Math.PI * 2,
          swaySpeed: 0.02 + Math.random() * 0.03,
          pType,
        };
      } else {
        // Hearts float up
        return {
          x,
          y: initY ? Math.random() * h : h + 15,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -(0.5 + Math.random() * 0.8),
          size: 8 + Math.random() * 8,
          opacity: 0.2 + Math.random() * 0.4,
          swayOffset: Math.random() * Math.PI * 2,
          swaySpeed: 0.015 + Math.random() * 0.02,
          pType,
        };
      }
    };

    // Calculate count based on density
    let countMultiplier = 1;
    if (density === 'low') countMultiplier = 0.5;
    else if (density === 'high') countMultiplier = 1.8;

    const baseCount = type === 'all' ? 70 : 45;
    const maxParticles = Math.floor(baseCount * countMultiplier);

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    // Draw Heart shape on canvas
    const drawHeartShape = (c: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      c.beginPath();
      c.moveTo(x, y + size / 4);
      c.quadraticCurveTo(x, y, x + size / 2, y);
      c.quadraticCurveTo(x + size, y, x + size, y + size / 3);
      c.quadraticCurveTo(x + size, y + (size * 2) / 3, x + size / 2, y + size);
      c.quadraticCurveTo(x, y + (size * 2) / 3, x, y + size / 3);
      c.quadraticCurveTo(x, y, x, y + size / 4);
      c.closePath();
    };

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const w = window.innerWidth;
      const h = window.innerHeight;
      const mouse = mouseRef.current;

      particles.forEach((p, idx) => {
        // Apply wind/drift & sway
        p.swayOffset! += p.swaySpeed!;
        
        let currentVx = p.vx;
        if (p.pType === 'petal') {
          // Petals sway back and forth
          currentVx += Math.sin(p.swayOffset!) * 0.3;
          p.angle! += p.spin!;
        } else if (p.pType === 'heart') {
          currentVx += Math.sin(p.swayOffset!) * 0.25;
        } else if (p.pType === 'spark') {
          currentVx += Math.sin(p.swayOffset!) * 0.15;
        }

        // Mouse avoidance physics
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const forceRadius = 130;

          if (dist < forceRadius) {
            const force = (forceRadius - dist) / forceRadius; // 0 to 1
            const angle = Math.atan2(dy, dx);
            // Push away
            p.x += Math.cos(angle) * force * 4;
            p.y += Math.sin(angle) * force * 4;
          }
        }

        // Standard movement
        p.x += currentVx;
        p.y += p.vy;

        // Render based on type
        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (p.pType === 'petal') {
          // Rose petal
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle || 0);

          const grad = ctx.createLinearGradient(0, 0, p.size, p.size);
          if (p.colorType === 0) {
            grad.addColorStop(0, '#e8a6b8'); // var(--rose)
            grad.addColorStop(1, '#58142e'); // var(--wine-light)
          } else {
            grad.addColorStop(0, '#ff8fa3'); 
            grad.addColorStop(1, '#3a0f22'); // var(--wine)
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          // Draw organic leaf/petal shape
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(p.size / 2, -p.size / 3, p.size, p.size / 3, p.size, p.size);
          ctx.bezierCurveTo(p.size / 2, p.size + p.size / 3, -p.size / 3, p.size / 2, 0, 0);
          ctx.fill();

        } else if (p.pType === 'spark') {
          // Twinkling golden spark
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          
          // Twinkle effect (vary opacity slightly)
          const twinkle = 0.8 + Math.sin(Date.now() * 0.003 + idx) * 0.2;
          ctx.globalAlpha = Math.max(0.1, p.opacity * twinkle);

          // Spark glow
          const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          glowGrad.addColorStop(0, 'rgba(230, 201, 154, 1)'); // var(--gold-soft)
          glowGrad.addColorStop(0.3, 'rgba(230, 201, 154, 0.4)');
          glowGrad.addColorStop(1, 'rgba(230, 201, 154, 0)');
          
          ctx.fillStyle = glowGrad;
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();

        } else if (p.pType === 'heart') {
          // Translucent rising heart
          ctx.translate(p.x - p.size / 2, p.y - p.size / 2);
          
          const grad = ctx.createLinearGradient(0, 0, p.size, p.size);
          grad.addColorStop(0, 'rgba(255, 122, 154, 0.8)'); // var(--glow)
          grad.addColorStop(1, 'rgba(110, 18, 48, 0.5)');

          ctx.fillStyle = grad;
          // Apply a drop shadow glow to heart
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#ff7a9a';
          
          drawHeartShape(ctx, 0, 0, p.size);
          ctx.fill();
        }

        ctx.restore();

        // Recycle particles when they go off screen
        const goesDown = p.vy > 0;
        const offScreenY = goesDown ? (p.y > h + 30) : (p.y < -30);
        const offScreenX = p.x < -30 || p.x > w + 30;

        if (offScreenY || offScreenX) {
          particles[idx] = createParticle(false);
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseLeave);
    };
  }, [type, density]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 block"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
