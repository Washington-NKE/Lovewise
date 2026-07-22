'use client';

import React, { ReactNode, useEffect, useRef } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Resize handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle class for slow floating rose gold embers
    class Particle {
      x = Math.random() * width;
      y = Math.random() * height;
      size = Math.random() * 2 + 1;
      speedY = Math.random() * 0.25 + 0.05;
      speedX = Math.random() * 0.15 - 0.075;
      opacity = Math.random() * 0.4 + 0.15;
      color = Math.random() > 0.4 ? '#ff7a9a' : '#d4af37'; // Elegant Rose or Rose Gold

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.y > height) {
          this.y = -10;
          this.x = Math.random() * width;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const particles: Particle[] = Array.from({ length: 45 }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Create a smooth dark romantic background vignette
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      gradient.addColorStop(0, '#180711'); // Deep luxury burgundy
      gradient.addColorStop(0.5, '#0b0308'); // Darkest plum
      gradient.addColorStop(1, '#050104'); // Absolute dark
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black select-none">
      {/* Client-side particles layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Decorative ambient backlight glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-md mx-auto flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}