class SoundManager {
  constructor() {
    this.ctx = null;
    this.unlocked = false;
    this._ensureContext();
  }

  _ensureContext() {
    if (!this.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
  }

  unlock() {
    this._ensureContext();
    if (!this.ctx) return;
    var state = this.ctx.state;
    if (state === 'suspended') this.ctx.resume();
    this.unlocked = true;
  }

  playTone(frequency, type, duration, options) {
    this._ensureContext();
    if (!this.ctx) return;
    var now = this.ctx.currentTime;
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(frequency || 440, now);
    var attack = (options && options.attack) || 0.005;
    var release = (options && options.release) || 0.08;
    var volume = (options && options.volume) || 0.2;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    var end = now + (duration || 0.12);
    gain.gain.setValueAtTime(volume, end - release);
    gain.gain.linearRampToValueAtTime(0.0001, end);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(end + 0.01);
    return { osc: osc, gain: gain, end: end };
  }

  playKeystroke() {
    this.playTone(1200, 'square', 0.04, { volume: 0.15, attack: 0.002, release: 0.04 });
  }

  playSuccess() {
    var seq = [480, 640, 820];
    var t = 0;
    for (var i = 0; i < seq.length; i++) {
      setTimeout((f => () => this.playTone(f, 'triangle', 0.09, { volume: 0.18 })) (seq[i]), t);
      t += 90;
    }
  }

  playError() {
    var tone = this.playTone(140, 'sawtooth', 0.22, { volume: 0.22 });
    if (tone && tone.osc) {
      var now = this.ctx.currentTime;
      tone.osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);
    }
  }

  playScan() {
    this._ensureContext();
    if (!this.ctx) return;
    var now = this.ctx.currentTime;
    var osc = this.ctx.createOscillator();
    var lfo = this.ctx.createOscillator();
    var lfoGain = this.ctx.createGain();
    var gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 700;
    lfo.type = 'sine';
    lfo.frequency.value = 9;
    lfoGain.gain.value = 25;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.8);
    lfo.stop(now + 0.8);
  }

  playEat() {
    var tone = this.playTone(1200, 'sine', 0.12, { volume: 0.2 });
    if (tone && tone.osc) {
      var now = this.ctx.currentTime;
      tone.osc.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
    }
  }

  playCrash() {
    this._ensureContext();
    if (!this.ctx) return;
    var duration = 0.35;
    var rate = this.ctx.sampleRate;
    var buffer = this.ctx.createBuffer(1, rate * duration, rate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) { data[i] = Math.random() * 2 - 1 }
    var src = this.ctx.createBufferSource();
    src.buffer = buffer;
    var gain = this.ctx.createGain();
    gain.gain.value = 0.18;
    src.connect(gain);
    gain.connect(this.ctx.destination);
    src.start();
  }
}

export default SoundManager;
