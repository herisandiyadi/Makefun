export class AudioFX {
  constructor() { this.context = null; }
  unlock() {
    try {
      this.context ??= new (window.AudioContext || window.webkitAudioContext)();
      if (this.context.state === 'suspended') this.context.resume();
    } catch { this.context = null; }
  }
  tone(start, end, duration, volume = 0.08, type = 'sine', delay = 0) {
    const context = this.context;
    if (!context) return;
    const time = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(start, time);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, end), time + duration);
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.01);
  }
  shoot() { this.tone(620, 280, 0.075, 0.035, 'triangle'); }
  hit() { this.tone(125, 55, 0.08, 0.05, 'square'); }
  death() { this.tone(360, 85, 0.16, 0.07, 'triangle'); }
  hurt() { this.tone(165, 48, 0.29, 0.12, 'sawtooth'); }
  pickup() { this.tone(620, 1000, 0.14, 0.06); }
  clear() { [440, 550, 660, 880].forEach((note, index) => this.tone(note, note * 1.1, 0.22, 0.07, 'sine', index * 0.1)); }
  over() { [440, 330, 220, 110].forEach((note, index) => this.tone(note, note * 0.8, 0.35, 0.09, 'triangle', index * 0.15)); }
}
