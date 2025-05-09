"use client";

import { useEffect, useRef, useState } from "react";

// Create a style element to contain our scoped styles
const createStyleElement = () => {
  const styleEl = document.createElement('style');
  styleEl.id = 'letter-page-styles';
  styleEl.innerHTML = `
    :root {
      --primary: #ff79c6;
      --secondary: #bd93f9;
      --background: #282a36;
      --text: #f8f8f2;
      --accent1: #8be9fd;
      --accent2: #50fa7b;
      --accent3: #ffb86c;
    }
    
    /* Letter page specific styles */
    .letter-page .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      position: relative;
    }
    
    .letter-page header {
      text-align: center;
      margin-bottom: 2rem;
      position: relative;
    }
    
    .letter-page header h1 {
      font-size: 3rem;
      color: var(--primary);
      margin-bottom: 1rem;
      animation: letter-pulse 2s infinite;
    }
    
    .letter-page header h2 {
      font-size: 1.8rem;
      color: var(--secondary);
      margin-bottom: 1.5rem;
    }
    
    .letter-page .section {
      margin-bottom: 3rem;
      padding: 1.5rem;
      border-radius: 1rem;
      background: rgba(40, 42, 54, 0.6);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 121, 198, 0.2);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .letter-page .section:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 40px rgba(255, 121, 198, 0.3);
    }
    
    .letter-page .section p {
      font-size: 1.2rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    
    .letter-page .section h2 {
      font-size: 1.8rem;
      color: var(--secondary);
      margin-bottom: 1.5rem;
    }
    
    .letter-page .highlight {
      color: var(--accent1);
      font-weight: bold;
    }
    
    .letter-page button {
      background-color: var(--primary);
      color: var(--background);
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 2rem;
      font-size: 1.1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      margin: 0.5rem;
    }
    
    .letter-page button:hover {
      background-color: var(--accent3);
      transform: scale(1.05);
    }
    
    .letter-page .heart {
      position: absolute;
      font-size: 2rem;
      animation: letter-float 3s ease-in-out infinite;
      opacity: 0.8;
      z-index: -1;
    }
    
    .letter-page #hearts-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
    }
    
    .letter-page .quiz-container {
      background-color: rgba(189, 147, 249, 0.1);
      padding: 1.5rem;
      border-radius: 1rem;
      margin-bottom: 2rem;
    }
    
    .letter-page .quiz-question {
      font-size: 1.3rem;
      margin-bottom: 1rem;
      color: var(--accent1);
    }
    
    .letter-page .quiz-options {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    
    .letter-page .quiz-option {
      padding: 0.8rem;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .letter-page .quiz-option:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .letter-page .result {
      margin-top: 1rem;
      font-weight: bold;
      color: var(--accent2);
      height: 1.5rem;
    }
    
    .letter-page .game-container {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .letter-page .target {
      width: 60px;
      height: 60px;
      background-color: var(--accent3);
      border-radius: 50%;
      position: relative;
      margin: 2rem auto;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    
    .letter-page .target:hover {
      transform: scale(1.1);
    }
    
    .letter-page .message-display {
      height: 3rem;
      text-align: center;
      font-size: 1.2rem;
      margin-top: 1rem;
      color: var(--accent2);
    }
    
    .letter-page .sparkles {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
    }
    
    @keyframes letter-pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
      }
    }
    
    @keyframes letter-float {
      0% {
        transform: translateY(0) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(10deg);
      }
      100% {
        transform: translateY(0) rotate(0deg);
      }
    }
    
    .letter-page .emoji-rain {
      position: fixed;
      top: -50px;
      font-size: 24px;
      animation: letter-fall linear;
      z-index: -1;
    }
    
    @keyframes letter-fall {
      0% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(100vh);
      }
    }
    
    .letter-page .final-message {
      padding: 2rem;
      background: linear-gradient(45deg, rgba(255, 184, 108, 0.2), rgba(255, 121, 198, 0.2));
      border-radius: 1rem;
      text-align: center;
      margin-top: 2rem;
      transform: scale(0);
      transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    .letter-page .final-message.show {
      transform: scale(1);
    }
    
    .letter-page .emoji-bounce {
      display: inline-block;
      animation: letter-bounce 1s infinite alternate;
    }
    
    @keyframes letter-bounce {
      0% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(-10px);
      }
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .letter-page header h1 {
        font-size: 2.2rem;
      }
      .letter-page header h2 {
        font-size: 1.5rem;
      }
      .letter-page .section p {
        font-size: 1.1rem;
      }
    }
  `;
  return styleEl;
};

export default function Letter() {
  // Add styles when component mounts
  useEffect(() => {
    if (!document.getElementById('letter-page-styles')) {
      document.head.appendChild(createStyleElement());
    }
    
    // Clean up on unmount
    return () => {
      const styleEl = document.getElementById('letter-page-styles');
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, []);
  const [gameRunning, setGameRunning] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [gameMessage, setGameMessage] = useState("");
  const [finalMessageVisible, setFinalMessageVisible] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const heartsContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize hearts background
  useEffect(() => {
    createHearts();
    initSparkles();
    
    // Initial emoji rain
    setTimeout(() => {
      createEmojiRain(['💖', '✨'], 15);
    }, 1000);
    
    // Cleanup
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  function createHearts() {
    const container = heartsContainerRef.current;
    if (!container) return;
    
    const emojis = ['❤️', '💖', '💕', '💓', '💗', '💘', '💝'];
    
    for (let i = 0; i < 20; i++) {
      const heart = document.createElement('div');
      heart.classList.add('heart');
      heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      
      // Random positioning
      heart.style.left = `${Math.random() * 100}vw`;
      heart.style.top = `${Math.random() * 100}vh`;
      
      // Random animation duration and delay
      const duration = 3 + Math.random() * 5;
      const delay = Math.random() * 5;
      heart.style.animationDuration = `${duration}s`;
      heart.style.animationDelay = `${delay}s`;
      
      container.appendChild(heart);
    }
  }
  
  function handleQuizOptionClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.currentTarget;
    const parent = target.parentElement;
    if (!parent) return;
    
    const resultElement = parent.nextElementSibling as HTMLParagraphElement;
    const isCorrect = target.getAttribute('data-correct') === 'true';
    
    // Reset all options in this question
    const siblings = parent.querySelectorAll('.quiz-option');
    siblings.forEach(sib => {
      (sib as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    
    if (isCorrect) {
      target.style.backgroundColor = 'rgba(80, 250, 123, 0.3)';
      resultElement.textContent = 'Absolutely correct! Your wisdom is boundless! 🎉';
      createEmojiRain(['🎉', '✨', '💯'], 10);
    } else {
      target.style.backgroundColor = 'rgba(255, 121, 198, 0.3)';
      resultElement.textContent = 'I must respectfully disagree with your selection. 🤔';
    }
  }
  
  function startGame() {
    if (gameRunning) return;
    
    setGameRunning(true);
    setClicks(0);
    setCountdown(10);
    setGameMessage("");
    
    // Start countdown
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Animate target
    animateTarget();
  }
  
  function handleTargetClick() {
    if (!gameRunning) return;
    
    setClicks(prev => prev + 1);
    if (targetRef.current) {
      targetRef.current.style.transform = 'scale(0.9)';
      setTimeout(() => {
        if (targetRef.current) targetRef.current.style.transform = 'scale(1)';
      }, 100);
    }
    
    // Create small heart on click
    createEmojiRain(['❤️'], 1);
  }
  
  function endGame() {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameRunning(false);
    
    let message;
    if (clicks < 5) {
      message = `${clicks} taps? Are your fingers made of lead? Nevertheless, I adore your effort! 💝`;
    } else if (clicks < 15) {
      message = `${clicks} taps! An admirable display of devotion! My heart is fluttering! 💓`;
    } else {
      message = `${clicks} taps! Great galaxies of love! Your finger speed is as impressive as your beauty! 💖✨`;
      createEmojiRain(['💖', '✨', '💕', '🌟'], 30);
    }
    
    setGameMessage(message);
  }
  
  function animateTarget() {
    if (!gameRunning || !targetRef.current) return;
    
    const containerWidth = targetRef.current.parentElement?.offsetWidth || 300;
    const containerHeight = 100;
    
    const newX = Math.random() * (containerWidth - 60);
    const newY = Math.random() * containerHeight - 50;
    
    targetRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
    
    setTimeout(animateTarget, 1000);
  }
  
  function createEmojiRain(emojis: string[], count: number) {
    for (let i = 0; i < count; i++) {
      const emoji = document.createElement('div');
      emoji.classList.add('emoji-rain');
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      
      // Position randomly across the screen
      emoji.style.left = `${Math.random() * 100}vw`;
      
      // Random speed
      const duration = 3 + Math.random() * 2;
      emoji.style.animationDuration = `${duration}s`;
      
      // Set a random size
      const size = 16 + Math.random() * 16;
      emoji.style.fontSize = `${size}px`;
      
      document.body.appendChild(emoji);
      
      // Remove after animation
      setTimeout(() => {
        emoji.remove();
      }, duration * 1000);
    }
  }
  
  function initSparkles() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const particles: Particle[] = [];
    const colors = ['#ff79c6', '#bd93f9', '#8be9fd', '#50fa7b', '#ffb86c'];
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      width: number;
      height: number;
      
      constructor() {
        const width = canvas?.width || window.innerWidth;
        const height = canvas?.height || window.innerHeight;
        this.width = width;
        this.height = height;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0) this.x = this.width;
        if (this.x > this.width) this.x = 0;
        if (this.y < 0) this.y = this.height;
        if (this.y > this.height) this.y = 0;
        if (this.x < 0) this.x = this.width;
        if (this.x > this.width) this.x = 0;
        if (this.y < 0) this.y = this.height;
        if (this.y > this.height) this.y = 0;
      }
      
      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    function init() {
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
      }
    }
    
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        if (particles[i].size <= 0.2) {
          particles.splice(i, 1);
          i--;
          particles.push(new Particle());
        }
      }
      
      requestAnimationFrame(animate);
    }
    
    init();
    animate();
    
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }
  
  function showFinalMessage() {
    setFinalMessageVisible(true);
    createEmojiRain(['💖', '✨', '💕', '🌟', '💘', '💝', '🎉'], 50);
  }
  
  return (
    <div className="letter-page">
      <div ref={heartsContainerRef} id="hearts-container"></div>
      <canvas ref={canvasRef} className="sparkles"></canvas>
      
      <div className="container">
        <header>
          <h1>To My Extraordinary Paramour, <span className="highlight">Njoki</span> 💖</h1>
          <h2>A Digital Proclamation of Undying Affection</h2>
        </header>
        
        <div className="section">
          <p>Dearest <span className="highlight">Heart-Holder</span> and <span className="highlight">Soul-Stabilizer</span>,</p>
          <p>In the grand tapestry of existential happenstance that constitutes our temporal coexistence, I find myself perpetually <span className="highlight">flabbergasted</span> by the serendipitous fortune of having you as my significant other. 🌟</p>
          <p>Your support has been nothing short of <span className="highlight">phantasmagorical</span> — a veritable bulwark against life&apos;s various vicissitudes and vexations. 🛡️</p>
          <p>The way you <span className="highlight">metamorphose</span> my darkest days into illuminated jubilation makes my cardiac muscle perform the most vigorous of calisthenics. 💓</p>
        </div>
        
        <div className="section">
          <h2>The Quiz of Devotion 📝</h2>
          <p>Test your knowledge of our spectacular love saga!</p>
          <div className="quiz-container">
            <p className="quiz-question">1. What makes you the most stupendous girlfriend in the entire cosmic continuum?</p>
            <div className="quiz-options">
              <div className="quiz-option" data-correct="true" onClick={handleQuizOptionClick}>
                You&apos;re an ethereal combination of brilliance, compassion, and unparalleled beauty
              </div>
              <div className="quiz-option" onClick={handleQuizOptionClick}>
                You&apos;re merely adequate
              </div>
              <div className="quiz-option" onClick={handleQuizOptionClick}>
                You occasionally remember my birthday
              </div>
            </div>
            <p className="result"></p>
          </div>
          
          <div className="quiz-container">
            <p className="quiz-question">2. How would one accurately quantify my affection for you?</p>
            <div className="quiz-options">
              <div className="quiz-option" onClick={handleQuizOptionClick}>
                Roughly equivalent to my fondness for pizza
              </div>
              <div className="quiz-option" data-correct="true" onClick={handleQuizOptionClick}>
                Immeasurable by conventional metrics; transcending the boundaries of euclidean space
              </div>
              <div className="quiz-option" onClick={handleQuizOptionClick}>
                A solid 7/10
              </div>
            </div>
            <p className="result"></p>
          </div>
          
          <div className="quiz-container">
            <p className="quiz-question">3. When I&apos;m with you, I feel...</p>
            <div className="quiz-options">
              <div className="quiz-option" onClick={handleQuizOptionClick}>
                Mildly entertained
              </div>
              <div className="quiz-option" onClick={handleQuizOptionClick}>
                Like checking my phone
              </div>
              <div className="quiz-option" data-correct="true" onClick={handleQuizOptionClick}>
                As though the universe has aligned in perfect harmonic resonance, creating a symphony of euphoria
              </div>
            </div>
            <p className="result"></p>
          </div>
        </div>
        
        <div className="section">
          <h2>The Love-Tap Challenge 💕</h2>
          <p>Demonstrate your digital dexterity by tapping the heart as many times as possible in 10 seconds! Each tap represents a quantum of my undying devotion.</p>
          
          <div className="game-container">
            {!gameRunning && (
              <button id="start-game" onClick={startGame}>Begin Affection Assessment</button>
            )}
            {gameRunning && (
              <>
                <div 
                  ref={targetRef} 
                  id="target" 
                  className="target" 
                  onClick={handleTargetClick}
                >❤️</div>
                <div id="countdown">{countdown}</div>
              </>
            )}
            <div className="message-display">{gameMessage}</div>
          </div>
        </div>
        
        <div className="section">
          <h2>The Verbose Vocabulary of Veneration 📚</h2>
          <p>My perspicacious paramour, your pulchritudinous presence perpetually permeates my psyche, provoking profoundly pleasant palpitations. 🧠💘</p>
          <p>The ineffable jubilation I experience in your company transcends the quotidian and ventures into the realm of the <span className="highlight">sublime</span> and <span className="highlight">metaphysical</span>. ✨</p>
          <p>Your laughter — an <span className="highlight">euphonious</span> cacophony of melodious reverberations — stimulates my auditory receptors like the most <span className="highlight">mellifluous</span> symphony ever orchestrated. 🎵</p>
        </div>
        
        <div className="section">
          <h2>Final Gratitude Transmission ✉️</h2>
          <p>For your unwavering <span className="highlight">perseverance</span> through my occasional bouts of illogical behavior...</p>
          <p>For your <span className="highlight">magnanimous</span> emotional sustenance during periods of existential uncertainty...</p>
          <p>For your <span className="highlight">indefatigable</span> belief in my capabilities, even when I&apos;m behaving like a nincompoop of the highest order...</p>
          <p>I extend my most profound and heartfelt appreciation. You truly are the <span className="highlight">quintessential</span> embodiment of everything wonderful in this chaotic universe. 🌌</p>
          <button id="show-final-message" onClick={showFinalMessage}>Reveal Ultimate Affection Declaration</button>
        </div>
        
        <div className={`final-message ${finalMessageVisible ? 'show' : ''}`}>
          <h2>
            <span className="emoji-bounce">I</span>
            <span className="emoji-bounce">💖</span>
            <span className="emoji-bounce">Y</span>
            <span className="emoji-bounce">O</span>
            <span className="emoji-bounce">U</span>
          </h2>
          <p>Ad infinitum, ad aeternum, and beyond all conceivable dimensional constructs.</p>
          <p>Forever yours in this and all possible parallel universes,</p>
          <p>Your Besotted Admirer, <span className="highlight">Washington ❤️</span></p>
        </div>
      </div>
    </div>
  );
}