/* ─────────────────────────────────────────────────────────────
   MoodHand Audio, Speech & Haptic Tactile Engine
   ───────────────────────────────────────────────────────────── */

export function triggerHaptic(type = 'light') {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    if (type === 'light') navigator.vibrate(12);
    else if (type === 'medium') navigator.vibrate([20, 30, 20]);
    else if (type === 'heavy') navigator.vibrate([40, 50, 40, 50, 60]);
  }
}

export class SoundEngine {
  constructor() { 
    this.ctx = null; 
    this.isMuted = localStorage.getItem('mood_sound_muted') === 'true';
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('mood_sound_muted', this.isMuted ? 'true' : 'false');
    return this.isMuted;
  }
  playPop() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(460, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(920, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch(e) {}
  }
  playWoosh() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(620, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch(e) {}
  }
  playMagic() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.05);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.05);
        osc.stop(this.ctx.currentTime + i * 0.05 + 0.28);
      });
    } catch(e) {}
  }
  playDizzyBoing() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch(e) {}
  }
  playCoin() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      [987.77, 1318.51].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.07);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.07 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.07);
        osc.stop(this.ctx.currentTime + i * 0.07 + 0.22);
      });
    } catch(e) {}
  }
}

export class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.isSpeaking = false;
  }
  speak(text, onStartCallback, onEndCallback) {
    if (!this.synth) return false;
    this.stop();
    const cleanText = text.replace(/["“”]/g, '');
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = 'zh-CN';
    utter.rate = 0.92;
    utter.pitch = 1.05;
    
    utter.onstart = () => {
      this.isSpeaking = true;
      if (onStartCallback) onStartCallback();
    };
    utter.onend = utter.onerror = () => {
      this.isSpeaking = false;
      if (onEndCallback) onEndCallback();
    };
    
    this.synth.speak(utter);
    return true;
  }
  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }
}
