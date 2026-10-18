import { SoundType } from '../grid/HexTypes';
import { Synthesizer } from './Synthesizer';

export type StepCallback = (stepTime: number) => void;

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private synth: Synthesizer | null = null;

  private isRunning: boolean = false;
  private bpm: number = 125;
  private timerWorkerId: number | null = null;

  // Lookahead timing configuration (Chris Wilson scheduling model)
  private lookaheadMs: number = 25.0; // How frequently to call scheduler (ms)
  private scheduleAheadSec: number = 0.1; // How far ahead to schedule audio (sec)
  private nextNoteTime: number = 0.0; // When the next 16th note is due
  private onStepScheduled: StepCallback | null = null;

  constructor() {}

  public async init(): Promise<void> {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Compressor / Limiter
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);

      this.synth = new Synthesizer(this.ctx);
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public setStepCallback(cb: StepCallback) {
    this.onStepScheduled = cb;
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(40, Math.min(300, newBpm));
  }

  public getBpm(): number {
    return this.bpm;
  }

  public start() {
    if (this.isRunning) return;
    this.init().then(() => {
      if (!this.ctx) return;
      this.isRunning = true;
      // Start note slightly in the future to avoid missed beats
      this.nextNoteTime = this.ctx.currentTime + 0.05;
      this.schedulerLoop();
    });
  }

  public stop() {
    this.isRunning = false;
    if (this.timerWorkerId !== null) {
      window.clearTimeout(this.timerWorkerId);
      this.timerWorkerId = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public triggerSound(sound: SoundType, time: number = 0, noteSeed: number = 0) {
    if (!this.ctx || !this.synth || !this.masterGain) return;
    const playTime = time > 0 ? time : this.ctx.currentTime;
    this.synth.trigger(sound, this.masterGain, playTime, noteSeed);
  }

  public previewSound(sound: SoundType, noteSeed: number = 0) {
    this.init().then(() => {
      this.triggerSound(sound, 0, noteSeed);
    });
  }

  private schedulerLoop = () => {
    if (!this.isRunning || !this.ctx) return;

    // While there are notes that will need to play before the next interval, schedule them
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadSec) {
      if (this.onStepScheduled) {
        this.onStepScheduled(this.nextNoteTime);
      }
      this.advanceStepTime();
    }

    this.timerWorkerId = window.setTimeout(this.schedulerLoop, this.lookaheadMs);
  };

  private advanceStepTime() {
    // 16th note interval = (60.0 / bpm) * 0.25
    const secondsPer16th = (60.0 / this.bpm) * 0.25;
    this.nextNoteTime += secondsPer16th;
  }

  public getCurrentTime(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }
}
