import { Cell, Playhead, Preset, SoundType, ModifierType } from '../grid/HexTypes';
import { generateGrid, cellKey, calculateBounce, getAccessibleDirections, COMPASS_DIR_MAP } from '../grid/HexMath';
import { AudioEngine } from '../audio/AudioEngine';
import { PRESETS } from './Presets';

export type StepListener = (stepIndex: number, triggeredCells: Cell[]) => void;

export class Sequencer {
  private grid: Map<string, Cell>;
  private playheads: Playhead[];
  private currentStepIndex: number = 0;
  private onStepListeners: StepListener[] = [];

  constructor(private audioEngine: AudioEngine) {
    this.grid = generateGrid();
    this.playheads = [
      {
        id: 1,
        name: 'Alpha',
        q: 0,
        r: 0,
        dir: 0,
        color: '#00ffff',
        glowColor: 'rgba(0, 255, 255, 0.7)',
        active: true,
        prevQ: 0,
        prevR: 0,
        stepProgress: 1.0
      },
      {
        id: 2,
        name: 'Beta',
        q: 0,
        r: 0,
        dir: 1,
        color: '#ff007f',
        glowColor: 'rgba(255, 0, 127, 0.7)',
        active: true,
        prevQ: 0,
        prevR: 0,
        stepProgress: 1.0
      },
      {
        id: 3,
        name: 'Gamma',
        q: 0,
        r: 0,
        dir: 2,
        color: '#39ff14',
        glowColor: 'rgba(57, 255, 20, 0.7)',
        active: false,
        prevQ: 0,
        prevR: 0,
        stepProgress: 1.0
      },
      {
        id: 4,
        name: 'Delta',
        q: 0,
        r: 0,
        dir: 3,
        color: '#ffe600',
        glowColor: 'rgba(255, 230, 0, 0.7)',
        active: false,
        prevQ: 0,
        prevR: 0,
        stepProgress: 1.0
      },
      {
        id: 5,
        name: 'Epsilon',
        q: 0,
        r: 0,
        dir: 4,
        color: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.7)',
        active: false,
        prevQ: 0,
        prevR: 0,
        stepProgress: 1.0
      },
      {
        id: 6,
        name: 'Zeta',
        q: 0,
        r: 0,
        dir: 5,
        color: '#ff6b2b',
        glowColor: 'rgba(255, 107, 43, 0.7)',
        active: false,
        prevQ: 0,
        prevR: 0,
        stepProgress: 1.0
      }
    ];

    // Connect audio engine lookahead tick to sequencer step
    this.audioEngine.setStepCallback((stepAudioTime: number) => {
      this.executeStep(stepAudioTime);
    });

    // Load initial preset
    this.loadPreset(PRESETS[0]);
  }

  public getGrid(): Map<string, Cell> {
    return this.grid;
  }

  public getCell(q: number, r: number): Cell | undefined {
    return this.grid.get(cellKey(q, r));
  }

  public setCell(q: number, r: number, sound: SoundType, modifier: ModifierType): Cell | undefined {
    const key = cellKey(q, r);
    const cell = this.grid.get(key);
    if (cell) {
      // Middle cell (0, 0) is always sound-free (start cell)
      cell.sound = (q === 0 && r === 0) ? 'NONE' : sound;
      cell.modifier = modifier;
      return cell;
    }
    return undefined;
  }

  public clearGrid() {
    this.grid.forEach(cell => {
      cell.sound = 'NONE';
      cell.modifier = 'NONE';
      cell.lastTriggerTime = 0;
      cell.triggerIntensity = 0;
    });
    this.resetPlayheadsToCenter();
  }

  public resetPlayheadsToCenter() {
    this.playheads.forEach((p, idx) => {
      p.q = 0;
      p.r = 0;
      p.prevQ = 0;
      p.prevR = 0;
      p.dir = idx % 6;
      p.stepProgress = 1.0;
    });
    this.currentStepIndex = 0;
  }

  public getPlayheads(): Playhead[] {
    return this.playheads;
  }

  public togglePlayhead(id: number, active?: boolean): boolean {
    const playhead = this.playheads.find(p => p.id === id);
    if (playhead) {
      playhead.active = active !== undefined ? active : !playhead.active;
      return playhead.active;
    }
    return false;
  }

  public setPlayheadPosition(id: number, q: number, r: number, dir?: number) {
    const playhead = this.playheads.find(p => p.id === id);
    if (playhead) {
      playhead.q = q;
      playhead.r = r;
      playhead.prevQ = q;
      playhead.prevR = r;
      if (dir !== undefined) {
        playhead.dir = (dir + 6) % 6;
      }
      playhead.stepProgress = 1.0;
    }
  }

  public loadPreset(preset: Preset) {
    this.clearGrid();
    this.audioEngine.setBpm(preset.bpm);

    // Apply cells
    for (const item of preset.cells) {
      const cell = this.grid.get(cellKey(item.q, item.r));
      if (cell) {
        cell.sound = item.sound;
        cell.modifier = item.modifier;
      }
    }

    // Reset all playheads to inactive at center
    this.playheads.forEach((p, idx) => {
      p.q = 0;
      p.r = 0;
      p.prevQ = 0;
      p.prevR = 0;
      p.dir = idx % 6;
      p.active = false;
      p.stepProgress = 1.0;
    });

    // Apply preset playheads
    for (const pConfig of preset.playheads) {
      const playhead = this.playheads.find(p => p.id === pConfig.id);
      if (playhead) {
        playhead.q = pConfig.q;
        playhead.r = pConfig.r;
        playhead.prevQ = pConfig.q;
        playhead.prevR = pConfig.r;
        playhead.dir = pConfig.dir;
        playhead.active = pConfig.active;
        playhead.stepProgress = 1.0;
      }
    }
  }

  public addStepListener(listener: StepListener) {
    this.onStepListeners.push(listener);
  }

  public removeStepListener(listener: StepListener) {
    this.onStepListeners = this.onStepListeners.filter(l => l !== listener);
  }

  public executeStep(stepAudioTime: number) {
    const triggeredCells: Cell[] = [];

    for (const playhead of this.playheads) {
      if (!playhead.active) continue;

      const cell = this.grid.get(cellKey(playhead.q, playhead.r));
      if (cell && cell.sound !== 'NONE') {
        const noteSeed = playhead.q * 3 + playhead.r * 5;
        this.audioEngine.triggerSound(cell.sound, stepAudioTime, noteSeed);

        cell.lastTriggerTime = performance.now();
        cell.triggerIntensity = 1.0;
        triggeredCells.push(cell);
      }

      // Obstacle / Dead Cell predicate
      const isBlocked = (testQ: number, testR: number) => {
        // Center cell (0, 0) is an impassable dead cell once heads have left it
        if (testQ === 0 && testR === 0 && (playhead.q !== 0 || playhead.r !== 0)) {
          return true;
        }
        // User-placed dead cells
        const targetCell = this.grid.get(cellKey(testQ, testR));
        if (targetCell && targetCell.sound === 'DEAD') {
          return true;
        }
        return false;
      };

      // 1. Determine next direction from modifier
      let nextDir = playhead.dir;
      if (cell && cell.modifier !== 'NONE' && cell.modifier in COMPASS_DIR_MAP) {
        // Explicit compass route (Top-Left, Top-Right, Left, Right, Bottom-Left, Bottom-Right)
        nextDir = COMPASS_DIR_MAP[cell.modifier];
      } else {
        // When NOT routing (modifier is NONE / unrouted), movement is default RANDOM among accessible neighbors!
        const accessible = getAccessibleDirections(playhead.q, playhead.r, 3, isBlocked);
        if (accessible.length > 0) {
          nextDir = accessible[Math.floor(Math.random() * accessible.length)];
        } else {
          nextDir = (playhead.dir + 3) % 6;
        }
      }

      // 2. Calculate movement with boundary and dead cell collision bounce
      const bounceResult = calculateBounce(playhead.q, playhead.r, nextDir, 3, isBlocked);

      // 3. Update playhead positions
      playhead.prevQ = playhead.q;
      playhead.prevR = playhead.r;
      playhead.q = bounceResult.nextQ;
      playhead.r = bounceResult.nextR;
      playhead.dir = bounceResult.nextDir;
      playhead.stepProgress = 0.0;
    }

    this.currentStepIndex++;
    for (const listener of this.onStepListeners) {
      listener(this.currentStepIndex, triggeredCells);
    }
  }

  public stepManual() {
    this.executeStep(this.audioEngine.getCurrentTime());
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }
}
