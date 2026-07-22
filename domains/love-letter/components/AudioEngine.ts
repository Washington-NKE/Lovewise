/**
 * Generative Audio Engine using the Web Audio API.
 * Synthesizes a warm ambient pad and soft, random wind chimes to avoid needing external assets.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private primaryGain: GainNode | null = null;
  private active = false;
  private chordIntervalId: any = null;
  private chimeTimeoutId: any = null;

  // C Major Pentatonic: C4, D4, E4, G4, A4, C5, D5, E5, G5, A5
  private pentatonicFreqs = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

  // Warm chord progressions: Fmaj9, Cmaj9, Am9, G6/9
  private progressions = [
    [174.61, 220.00, 261.63, 329.63, 349.23], // Fmaj7/9
    [130.81, 164.81, 196.00, 246.94, 261.63], // Cmaj7/9
    [110.00, 146.83, 174.61, 220.00, 329.63], // Am9
    [98.00, 146.83, 196.00, 246.94, 293.66],   // G6
  ];
  private currentProgIndex = 0;

  constructor() {}

  public start() {
    if (this.active) return;
    this.active = true;

    // Initialize AudioContext on user interaction
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.primaryGain = this.ctx.createGain();
    this.primaryGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.primaryGain.connect(this.ctx.destination);

    // Fade in primary gain
    this.primaryGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 3);

    // Start synthesis loops
    this.playNextChord();
    this.scheduleNextChime();
  }

  public stop() {
    if (!this.active) return;
    this.active = false;

    if (this.primaryGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.primaryGain.gain.cancelScheduledValues(now);
      this.primaryGain.gain.setValueAtTime(this.primaryGain.gain.value, now);
      this.primaryGain.gain.linearRampToValueAtTime(0, now + 1.5);
    }

    setTimeout(() => {
      if (this.ctx) {
        this.ctx.close();
        this.ctx = null;
      }
      this.primaryGain = null;
    }, 1600);

    if (this.chordIntervalId) clearTimeout(this.chordIntervalId);
    if (this.chimeTimeoutId) clearTimeout(this.chimeTimeoutId);
  }

  private playNextChord = () => {
    if (!this.active || !this.ctx || !this.primaryGain) return;

    const freqs = this.progressions[this.currentProgIndex];
    this.currentProgIndex = (this.currentProgIndex + 1) % this.progressions.length;

    const now = this.ctx.currentTime;
    const duration = 10; // Chords fade in and out over 10 seconds

    freqs.forEach((freq, i) => {
      if (!this.ctx || !this.primaryGain) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Use triangle or sine wave for ultra-soft tones
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450 + Math.random() * 200, now);
      filter.Q.setValueAtTime(1, now);

      gain.gain.setValueAtTime(0, now);
      
      // Lush fade-in envelope
      const attackTime = 3 + Math.random() * 2;
      const releaseTime = 3 + Math.random() * 2;
      
      gain.gain.linearRampToValueAtTime(0.04, now + attackTime);
      
      // Hold phase then fade out
      gain.gain.setValueAtTime(0.04, now + duration - releaseTime);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.primaryGain);

      osc.start(now);
      osc.stop(now + duration);
    });

    // Schedule next chord overlaps slightly (every 8 seconds for a 10s chord)
    this.chordIntervalId = setTimeout(this.playNextChord, 8000);
  };

  private scheduleNextChime = () => {
    if (!this.active) return;

    const delay = 1500 + Math.random() * 3000;
    this.chimeTimeoutId = setTimeout(() => {
      this.playChime();
      this.scheduleNextChime();
    }, delay);
  };

  private playChime() {
    if (!this.active || !this.ctx || !this.primaryGain) return;

    const now = this.ctx.currentTime;
    
    // Choose random note from pentatonic scale
    const freq = this.pentatonicFreqs[Math.floor(Math.random() * this.pentatonicFreqs.length)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const delay = this.ctx.createDelay();
    const delayGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Chime Envelope: fast attack, slow exponential decay
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3);

    // Dynamic delay for chime echo/reverb feel
    delay.delayTime.setValueAtTime(0.35, now);
    delayGain.gain.setValueAtTime(0.3, now);

    osc.connect(gain);
    gain.connect(this.primaryGain);

    // Feedback delay loop
    gain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(delay); // feedback
    delayGain.connect(this.primaryGain);

    osc.start(now);
    osc.stop(now + 4);
  }
}
