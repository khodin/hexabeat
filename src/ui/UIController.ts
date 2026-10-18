import { AudioEngine } from '../audio/AudioEngine';
import { Sequencer } from '../sequencer/Sequencer';
import { HexCanvas } from './HexCanvas';
import { ModifierType, Cell } from '../grid/HexTypes';
import { PRESETS } from '../sequencer/Presets';

export type CellTool = 'ENABLE' | 'DISABLE' | 'DEAD' | 'CLEAR';

export class UIController {
  private activeTool: CellTool = 'ENABLE';
  private activeModifier: ModifierType = 'NONE';

  // DOM Elements
  private btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
  private btnStep = document.getElementById('btn-step') as HTMLButtonElement;
  private btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
  private btnResetHeadsDock = document.getElementById('btn-reset-heads-dock') as HTMLButtonElement | null;
  private btnResetHeadsBottom = document.getElementById('btn-reset-heads-bottom') as HTMLButtonElement | null;
  private btnClear = document.getElementById('btn-clear') as HTMLButtonElement;
  private bpmSlider = document.getElementById('bpm-slider') as HTMLInputElement;
  private bpmValue = document.getElementById('bpm-value') as HTMLSpanElement;
  private presetSelect = document.getElementById('preset-select') as HTMLSelectElement;
  private cellInfo = document.getElementById('selected-cell-info') as HTMLSpanElement;
  private stepIndicator = document.getElementById('step-indicator') as HTMLSpanElement;

  private toolButtons: HTMLButtonElement[] = [];
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
    this.toolButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('#cell-palette .tool-btn'));
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

    // 3. Reset Heads to Circle 1 Starting Positions
    const handleReset = () => {
      this.sequencer.resetPlayheadsToCenter();
      this.stepIndicator.textContent = 'Step: 0';
      this.updatePlayheadButtonStates();
    };
    if (this.btnReset) this.btnReset.addEventListener('click', handleReset);
    if (this.btnResetHeadsDock) this.btnResetHeadsDock.addEventListener('click', handleReset);
    if (this.btnResetHeadsBottom) this.btnResetHeadsBottom.addEventListener('click', handleReset);

    // 4. Clear Grid
    this.btnClear.addEventListener('click', () => {
      this.sequencer.clearGrid();
      this.stepIndicator.textContent = 'Step: 0';
      this.updatePlayheadButtonStates();
    });

    // 5. BPM Slider
    this.bpmSlider.addEventListener('input', () => {
      const bpm = parseInt(this.bpmSlider.value, 10);
      this.bpmValue.textContent = `${bpm}`;
      this.audioEngine.setBpm(bpm);
    });

    // 6. Presets
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

    // 7. Cell Tool Buttons (Enable / Disable / Dead / Clear)
    this.toolButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool as CellTool;
        this.setActiveTool(tool);
      });
    });

    // 8. Modifier Palette buttons
    this.modifierButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mod = btn.dataset.mod as ModifierType;
        this.setActiveModifier(mod);
      });
    });

    // 9. Playhead Toggles
    this.playheadButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id || '1', 10);
        const isActive = this.sequencer.togglePlayhead(id);
        btn.classList.toggle('active', isActive);
        const playhead = this.sequencer.getPlayheads().find(p => p.id === id);
        if (isActive && playhead) {
          this.audioEngine.previewSound(playhead.sound);
        }
      });
    });

    // 10. Hex Canvas Cell Click / Touch
    this.hexCanvas.setOnCellSelect((q: number, r: number, cell?: Cell) => {
      if (!cell) return;

      const isCenter = q === 0 && r === 0;
      if (isCenter) {
        this.updateCellInfo(0, 0, false, true, 'NONE');
        return;
      }

      switch (this.activeTool) {
        case 'ENABLE': {
          if (cell.enabled && this.activeModifier === 'NONE') {
            // Toggle off
            this.sequencer.setCell(q, r, false, false, cell.modifier);
            this.updateCellInfo(q, r, false, false, cell.modifier);
          } else {
            const mod = this.activeModifier !== 'NONE' ? this.activeModifier : cell.modifier;
            this.sequencer.setCell(q, r, true, false, mod);
            this.updateCellInfo(q, r, true, false, mod);
            const activeHead = this.sequencer.getPlayheads().find(p => p.active);
            if (activeHead) {
              this.audioEngine.previewSound(activeHead.sound, q * 3 + r * 5);
            }
          }
          break;
        }
        case 'DISABLE': {
          const mod = this.activeModifier !== 'NONE' ? this.activeModifier : cell.modifier;
          this.sequencer.setCell(q, r, false, false, mod);
          this.updateCellInfo(q, r, false, false, mod);
          break;
        }
        case 'DEAD': {
          const isNowDead = !cell.isDead;
          this.sequencer.setCell(q, r, false, isNowDead, 'NONE');
          this.updateCellInfo(q, r, false, isNowDead, 'NONE');
          break;
        }
        case 'CLEAR': {
          this.sequencer.setCell(q, r, false, false, 'NONE');
          this.updateCellInfo(q, r, false, false, 'NONE');
          break;
        }
      }
    });

    // 11. Sequencer Step Listener
    this.sequencer.addStepListener((stepIndex: number) => {
      this.stepIndicator.textContent = `Step: ${stepIndex}`;
    });
  }

  private setActiveTool(tool: CellTool) {
    this.activeTool = tool;
    this.toolButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.tool === tool);
    });
  }

  private setActiveModifier(mod: ModifierType) {
    this.activeModifier = mod;
    this.modifierButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.mod === mod);
    });
  }

  private updateCellInfo(q: number, r: number, enabled: boolean, isDead: boolean, modifier: ModifierType) {
    if (q === 0 && r === 0) {
      this.cellInfo.textContent = `Center Core (Obstacle)`;
    } else if (isDead) {
      this.cellInfo.textContent = `Cell: (${q}, ${r}) • DEAD WALL`;
    } else {
      const stateStr = enabled ? 'ENABLED' : 'DISABLED';
      this.cellInfo.textContent = `Cell: (${q}, ${r}) • ${stateStr} • ${modifier}`;
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
