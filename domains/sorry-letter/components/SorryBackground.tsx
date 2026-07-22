'use client';

import React, { useEffect, useRef } from 'react';

export const SorryBackground: React.FC = () => {
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

    class Particle {
      x = 0;
      y = 0;
      size = 0;
      speedY = 0;
      speedX = 0;
      opacity = 0;
      color = '';

      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        // Start from bottom or disperse initially
        this.y = init ? Math.random() * height : height + 10;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 0.6 + 0.15;
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.opacity = Math.random() * 0.45 + 0.15;
        this.color = Math.random() > 0.5 ? '#e63956' : '#dfb15b'; // Crimson Rose or Soft Gold
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        if (this.y < -10) {
          this.reset(false);
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

      // Create a smooth dark vignette background
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.9
      );
      gradient.addColorStop(0, '#0f050b'); // Very dark burgundy center
      gradient.addColorStop(0.6, '#050204'); // Near black
      gradient.addColorStop(1, '#020002'); // Pure black
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Ambient warm backlights
      const backlight1 = ctx.createRadialGradient(width * 0.1, height * 0.8, 10, width * 0.1, height * 0.8, 400);
      backlight1.addColorStop(0, 'rgba(230, 57, 86, 0.03)');
      backlight1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = backlight1;
      ctx.fillRect(0, 0, width, height);

      const backlight2 = ctx.createRadialGradient(width * 0.9, height * 0.4, 10, width * 0.9, height * 0.4, 400);
      backlight2.addColorStop(0, 'rgba(139, 0, 43, 0.04)');
      backlight2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = backlight2;
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

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
};
export default SorryBackground;
