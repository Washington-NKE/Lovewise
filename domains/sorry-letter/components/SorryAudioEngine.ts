export class SorryAudioEngine {
  private ctx: AudioContext | null = null;
  private primaryGain: GainNode | null = null;
  private isRunning: boolean = false;
  private intervalId: any = null;

  // D-minor pentatonic scale frequencies (chimes)
  private scale = [146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 392.00, 440.00, 523.25];
  // Chords: Dm, F, C, Gm
  private chords = [
    [73.42, 110.00, 146.83, 174.61], // Dm
    [87.31, 130.81, 174.61, 209.30], // F
    [65.41, 98.00, 130.81, 164.81],  // C
    [98.00, 146.83, 196.00, 233.08]  // Gm
  ];
  private currentChordIndex = 0;

  constructor() {}

  public start() {
    if (this.isRunning) return;
    
    // Initialize audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Master Gain
    this.primaryGain = this.ctx.createGain();
    this.primaryGain.gain.setValueAtTime(0.08, this.ctx.currentTime); // Low volume
    this.primaryGain.connect(this.ctx.destination);
    
    this.isRunning = true;
    this.playChordLoop();
    this.startChimes();
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }

  private playChordLoop() {
    if (!this.isRunning || !this.ctx || !this.primaryGain) return;

    const playNextChord = () => {
      if (!this.ctx || !this.primaryGain) return;
      const now = this.ctx.currentTime;
      const chord = this.chords[this.currentChordIndex];

      chord.forEach((freq) => {
        if (!this.ctx || !this.primaryGain) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now); // Warm, dark sound

        gain.gain.setValueAtTime(0, now);
        // Soft attack & long decay
        gain.gain.linearRampToValueAtTime(0.02, now + 2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.primaryGain);

        osc.start(now);
        osc.stop(now + 12);
      });

      this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;
      
      // Schedule next chord in 10 seconds
      if (this.isRunning) {
        setTimeout(playNextChord, 10000);
      }
    };

    playNextChord();
  }

  private startChimes() {
    const triggerChime = () => {
      if (!this.isRunning || !this.ctx || !this.primaryGain) return;

      const now = this.ctx.currentTime;
      // Select random chime frequency
      const freq = this.scale[Math.floor(Math.random() * this.scale.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.015, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4);

      osc.connect(gain);
      gain.connect(this.primaryGain);

      osc.start(now);
      osc.stop(now + 4);

      // Random scheduling
      if (this.isRunning) {
        const nextTime = Math.random() * 4000 + 1500;
        this.intervalId = setTimeout(triggerChime, nextTime);
      }
    };

    triggerChime();
  }
}
