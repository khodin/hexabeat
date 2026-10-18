import { AudioEngine } from '../audio/AudioEngine';
import { Sequencer } from '../sequencer/Sequencer';
import { HexCanvas } from './HexCanvas';
import { SoundType, ModifierType, Cell } from '../grid/HexTypes';
import { PRESETS } from '../sequencer/Presets';

export class UIController {
  private activeSound: SoundType = 'KICK';
  private activeModifier: ModifierType = 'NONE';

  // DOM Elements
  private btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
  private btnStep = document.getElementById('btn-step') as HTMLButtonElement;
  private btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
  private btnClear = document.getElementById('btn-clear') as HTMLButtonElement;
  private bpmSlider = document.getElementById('bpm-slider') as HTMLInputElement;
  private bpmValue = document.getElementById('bpm-value') as HTMLSpanElement;
  private presetSelect = document.getElementById('preset-select') as HTMLSelectElement;
  private cellInfo = document.getElementById('selected-cell-info') as HTMLSpanElement;
  private stepIndicator = document.getElementById('step-indicator') as HTMLSpanElement;

  private soundButtons: HTMLButtonElement[] = [];
  private modifierButtons: HTMLButtonElement[] = [];
  private playheadButtons: HTMLButtonElement[] = [];

  constructor(
    private audioEngine: AudioEngine,
    private sequencer: Sequencer,
    private hexCanvas: HexCanvas
  ) {
    this.initElements();
    this.initEvents();
    this.updatePlayheadButtonStates();
  }

  private initElements() {
    this.soundButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('#sound-palette .sound-btn'));
    this.modifierButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('#modifier-palette .mod-btn'));
    this.playheadButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.playhead-toggles .p-toggle'));
  }

  private initEvents() {
    // 1. Play / Pause
    this.btnPlay.addEventListener('click', () => {
      if (this.audioEngine.getIsPlaying()) {
        this.audioEngine.stop();
        this.btnPlay.textContent = '▶ PLAY';
        this.btnPlay.classList.remove('is-playing');
      } else {
        this.audioEngine.start();
        this.btnPlay.textContent = '⏸ PAUSE';
        this.btnPlay.classList.add('is-playing');
      }
    });

    // 2. Step forward manually
    this.btnStep.addEventListener('click', () => {
      this.sequencer.stepManual();
    });

    // 3. Reset Heads to Center
    this.btnReset.addEventListener('click', () => {
      this.sequencer.resetPlayheadsToCenter();
      this.stepIndicator.textContent = 'Step: 0';
    });

    // 4. Clear Grid
    this.btnClear.addEventListener('click', () => {
      this.sequencer.clearGrid();
      this.stepIndicator.textContent = 'Step: 0';
    });

    // 4. BPM Slider
    this.bpmSlider.addEventListener('input', () => {
      const bpm = parseInt(this.bpmSlider.value, 10);
      this.bpmValue.textContent = `${bpm}`;
      this.audioEngine.setBpm(bpm);
    });

    // 5. Presets
    this.presetSelect.addEventListener('change', () => {
      const presetId = this.presetSelect.value;
      const preset = PRESETS.find(p => p.id === presetId);
      if (preset) {
        this.sequencer.loadPreset(preset);
        this.bpmSlider.value = `${preset.bpm}`;
        this.bpmValue.textContent = `${preset.bpm}`;
        this.updatePlayheadButtonStates();
      }
    });

    // 6. Sound Palette buttons
    this.soundButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const sound = btn.dataset.sound as SoundType;
        this.setActiveSound(sound);
        if (sound !== 'NONE') {
          this.audioEngine.previewSound(sound);
        }
      });
    });

    // 7. Modifier Palette buttons
    this.modifierButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mod = btn.dataset.mod as ModifierType;
        this.setActiveModifier(mod);
      });
    });

    // 8. Playhead Toggles
    this.playheadButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id || '1', 10);
        const isActive = this.sequencer.togglePlayhead(id);
        btn.classList.toggle('active', isActive);
      });
    });

    // 9. Hex Canvas Cell Click / Touch
    this.hexCanvas.setOnCellSelect((q: number, r: number, cell?: Cell) => {
      if (!cell) return;

      const isCenter = q === 0 && r === 0;

      // If cell already matches active sound and active modifier, erase
      if (cell.sound === this.activeSound && cell.modifier === this.activeModifier) {
        this.sequencer.setCell(q, r, 'NONE', 'NONE');
        this.updateCellInfo(q, r, 'NONE', 'NONE');
      } else {
        // Set new sound & modifier (center cell remains sound-free start hub)
        const soundToSet = isCenter ? 'NONE' : this.activeSound;
        this.sequencer.setCell(q, r, soundToSet, this.activeModifier);
        this.updateCellInfo(q, r, soundToSet, this.activeModifier);

        // Preview sound on tap
        if (soundToSet !== 'NONE') {
          this.audioEngine.previewSound(soundToSet, q * 3 + r * 5);
        }
      }
    });

    // 10. Sequencer Step Listener
    this.sequencer.addStepListener((stepIndex: number) => {
      this.stepIndicator.textContent = `Step: ${stepIndex}`;
    });
  }

  private setActiveSound(sound: SoundType) {
    this.activeSound = sound;
    this.soundButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.sound === sound);
    });
  }

  private setActiveModifier(mod: ModifierType) {
    this.activeModifier = mod;
    this.modifierButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.mod === mod);
    });
  }

  private updateCellInfo(q: number, r: number, sound: SoundType, modifier: ModifierType) {
    if (q === 0 && r === 0) {
      this.cellInfo.textContent = `Center Hub (Start) • Routing: ${modifier}`;
    } else {
      this.cellInfo.textContent = `Cell: (${q}, ${r}) • ${sound} • ${modifier}`;
    }
  }

  private updatePlayheadButtonStates() {
    const playheads = this.sequencer.getPlayheads();
    this.playheadButtons.forEach(btn => {
      const id = parseInt(btn.dataset.id || '1', 10);
      const playhead = playheads.find(p => p.id === id);
      if (playhead) {
        btn.classList.toggle('active', playhead.active);
      }
    });
  }
}
