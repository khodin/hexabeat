import { SoundType } from '../grid/HexTypes';

// Pentatonic scale frequencies for synth notes (A minor pentatonic: A2, C3, D3, E3, G3, A3, C4)
const PENTATONIC_FREQS = [110.0, 130.81, 146.83, 164.81, 196.0, 220.0, 261.63];

export class Synthesizer {
  private noiseBuffer: AudioBuffer | null = null;

  constructor(private ctx: AudioContext) {
    this.createNoiseBuffer();
  }

  private createNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of white noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  public trigger(sound: SoundType, dest: AudioNode, time: number = this.ctx.currentTime, noteSeed: number = 0) {
    switch (sound) {
      case 'KICK':
        this.playKick(dest, time);
        break;
      case 'SNARE':
        this.playSnare(dest, time);
        break;
      case 'CLOSED_HH':
        this.playClosedHiHat(dest, time);
        break;
      case 'OPEN_HH':
        this.playOpenHiHat(dest, time);
        break;
      case 'CLAP':
        this.playClap(dest, time);
        break;
      case 'SYNTH':
        this.playSynth(dest, time, noteSeed);
        break;
      default:
        break;
    }
  }

  public playKick(dest: AudioNode, time: number) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Pitch sweep: 155Hz down to 35Hz
    osc.frequency.setValueAtTime(155, time);
    osc.frequency.exponentialRampToValueAtTime(36, time + 0.25);

    // Amplitude envelope
    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    // Click transient
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(350, time);
    clickGain.gain.setValueAtTime(0.6, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

    osc.connect(gain);
    gain.connect(dest);

    clickOsc.connect(clickGain);
    clickGain.connect(dest);

    osc.start(time);
    clickOsc.start(time);
    osc.stop(time + 0.3);
    clickOsc.stop(time + 0.03);
  }

  public playSnare(dest: AudioNode, time: number) {
    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(75, time + 0.1);
    oscGain.gain.setValueAtTime(0.7, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(oscGain);
    oscGain.connect(dest);

    // Noise snap
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, time);
      filter.Q.setValueAtTime(2.0, time);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.9, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(dest);

      noise.start(time);
      noise.stop(time + 0.25);
    }

    osc.start(time);
    osc.stop(time + 0.15);
  }

  public playClosedHiHat(dest: AudioNode, time: number) {
    this.playMetallicCluster(dest, time, 0.05, 7500);
  }

  public playOpenHiHat(dest: AudioNode, time: number) {
    this.playMetallicCluster(dest, time, 0.35, 6800);
  }

  private playMetallicCluster(dest: AudioNode, time: number, decay: number, filterFreq: number) {
    // 6 metallic ratios (classic 808/909 style)
    const ratios = [205, 305, 415, 460, 570, 715];
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(filterFreq, time);
    filter.Q.setValueAtTime(3.5, time);

    gain.connect(filter);
    filter.connect(dest);

    ratios.forEach(freq => {
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq * 1.8, time);
      osc.connect(gain);
      osc.start(time);
      osc.stop(time + decay + 0.05);
    });
  }

  public playClap(dest: AudioNode, time: number) {
    if (!this.noiseBuffer) return;

    // 3 short pre-claps + main reverb tail
    const burstTimes = [0, 0.012, 0.024];
    burstTimes.forEach((offset, idx) => {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, time + offset);
      filter.Q.setValueAtTime(2.2, time + offset);

      const gain = this.ctx.createGain();
      const isLast = idx === burstTimes.length - 1;
      const decay = isLast ? 0.22 : 0.018;

      gain.gain.setValueAtTime(0.75, time + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, time + offset + decay);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start(time + offset);
      noise.stop(time + offset + decay + 0.02);
    });
  }

  public playSynth(dest: AudioNode, time: number, noteSeed: number) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    const noteIndex = Math.abs(noteSeed) % PENTATONIC_FREQS.length;
    const freq = PENTATONIC_FREQS[noteIndex];

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    // Filter pluck envelope
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, time);
    filter.frequency.exponentialRampToValueAtTime(180, time + 0.35);
    filter.Q.setValueAtTime(4.0, time);

    // Amplitude envelope
    gain.gain.setValueAtTime(0.65, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + 0.45);
  }
}
