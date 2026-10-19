import { Cell, Playhead, Preset, SoundType, ModifierType, ProjectData } from '../grid/HexTypes';
import { generateGrid, cellKey, calculateBounce, getAccessibleDirections, COMPASS_DIR_MAP, HEX_RADIUS, getHexDistance } from '../grid/HexMath';
import { AudioEngine } from '../audio/AudioEngine';
import { PRESETS } from './Presets';

export type StepListener = (stepIndex: number, triggeredCells: Cell[]) => void;

// 6 Playheads: each starts on its own position on circle 1 around center with its own dedicated sound
export const PLAYHEAD_INITIAL_CONFIGS = [
  { id: 1, name: 'Alpha', sound: 'KICK' as SoundType, startQ: 1, startR: 0, startDir: 0, color: '#00ffff', glowColor: 'rgba(0, 255, 255, 0.7)', active: true },
  { id: 2, name: 'Beta', sound: 'SNARE' as SoundType, startQ: 0, startR: 1, startDir: 1, color: '#ff007f', glowColor: 'rgba(255, 0, 127, 0.7)', active: true },
  { id: 3, name: 'Gamma', sound: 'CLOSED_HH' as SoundType, startQ: -1, startR: 1, startDir: 2, color: '#39ff14', glowColor: 'rgba(57, 255, 20, 0.7)', active: false },
  { id: 4, name: 'Delta', sound: 'OPEN_HH' as SoundType, startQ: -1, startR: 0, startDir: 3, color: '#ffe600', glowColor: 'rgba(255, 230, 0, 0.7)', active: false },
  { id: 5, name: 'Epsilon', sound: 'CLAP' as SoundType, startQ: 0, startR: -1, startDir: 4, color: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.7)', active: false },
  { id: 6, name: 'Zeta', sound: 'SYNTH' as SoundType, startQ: 1, startR: -1, startDir: 5, color: '#ff6b2b', glowColor: 'rgba(255, 107, 43, 0.7)', active: false },
];

export class Sequencer {
  private grid: Map<string, Cell>;
  private playheads: Playhead[];
  private currentStepIndex: number = 0;
  private onStepListeners: StepListener[] = [];

  constructor(private audioEngine: AudioEngine) {
    this.grid = generateGrid();
    this.playheads = PLAYHEAD_INITIAL_CONFIGS.map(cfg => ({
      ...cfg,
      q: cfg.startQ,
      r: cfg.startR,
      dir: cfg.startDir,
      prevQ: cfg.startQ,
      prevR: cfg.startR,
      stepProgress: 1.0
    }));

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

  public isDepartureCell(q: number, r: number): boolean {
    return getHexDistance(q, r) === 1;
  }

  public getDeparturePlayhead(q: number, r: number): Playhead | undefined {
    return this.playheads.find(p => p.startQ === q && p.startR === r);
  }

  public setCell(
    q: number,
    r: number,
    enabled: boolean,
    isDead: boolean,
    modifier: ModifierType
  ): Cell | undefined {
    const key = cellKey(q, r);
    const cell = this.grid.get(key);
    if (cell) {
      if (q === 0 && r === 0) {
        // Center core remains dead / blocker
        cell.isDead = true;
        cell.enabled = false;
        cell.sound = 'DEAD';
        cell.modifier = 'NONE';
      } else if (this.isDepartureCell(q, r)) {
        // Radius 1 cells are reserved launch bays and contain NO sound
        cell.enabled = false;
        cell.isDead = false;
        cell.sound = 'NONE';
        cell.modifier = 'NONE';
      } else {
        cell.enabled = enabled;
        cell.isDead = isDead;
        cell.sound = isDead ? 'DEAD' : (enabled ? 'KICK' : 'NONE');
        cell.modifier = modifier;
      }
      return cell;
    }
    return undefined;
  }

  public clearGrid() {
    this.grid.forEach(cell => {
      const isCenter = cell.q === 0 && cell.r === 0;
      cell.enabled = false;
      cell.isDead = isCenter;
      cell.sound = isCenter ? 'DEAD' : 'NONE';
      cell.modifier = 'NONE';
      cell.lastTriggerTime = 0;
      cell.triggerIntensity = 0;
    });
    this.resetPlayheadsToCenter();
  }

  public resetPlayheadsToCenter() {
    this.playheads.forEach((p) => {
      p.q = p.startQ;
      p.r = p.startR;
      p.prevQ = p.startQ;
      p.prevR = p.startR;
      p.dir = p.startDir;
      p.stepProgress = 1.0;
    });
    this.currentStepIndex = 0;
  }

  public stop() {
    this.audioEngine.stop();
    this.resetPlayheadsToCenter();
    this.onStepListeners.forEach(listener => listener(0, []));
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
        if (item.q === 0 && item.r === 0) {
          cell.isDead = true;
          cell.enabled = false;
          cell.sound = 'DEAD';
          cell.modifier = 'NONE';
        } else if (this.isDepartureCell(item.q, item.r)) {
          cell.enabled = false;
          cell.isDead = false;
          cell.sound = 'NONE';
          cell.modifier = 'NONE';
        } else if (item.isDead || item.sound === 'DEAD') {
          cell.isDead = true;
          cell.enabled = false;
          cell.sound = 'DEAD';
          cell.modifier = item.modifier || 'NONE';
        } else if (item.enabled || (item.sound !== undefined && item.sound !== 'NONE')) {
          cell.enabled = true;
          cell.isDead = false;
          cell.sound = 'KICK';
          cell.modifier = item.modifier || 'NONE';
        } else {
          cell.enabled = false;
          cell.isDead = false;
          cell.sound = 'NONE';
          cell.modifier = item.modifier || 'NONE';
        }
      }
    }

    // Reset all playheads to their dedicated initial positions on circle 1
    this.playheads.forEach((p) => {
      p.q = p.startQ;
      p.r = p.startR;
      p.prevQ = p.startQ;
      p.prevR = p.startR;
      p.dir = p.startDir;
      p.active = false;
      p.stepProgress = 1.0;
    });

    // Apply preset playheads
    for (const pConfig of preset.playheads) {
      const playhead = this.playheads.find(p => p.id === pConfig.id);
      if (playhead) {
        if (pConfig.q !== undefined && pConfig.r !== undefined) {
          playhead.q = pConfig.q;
          playhead.r = pConfig.r;
          playhead.prevQ = pConfig.q;
          playhead.prevR = pConfig.r;
        }
        if (pConfig.dir !== undefined) {
          playhead.dir = pConfig.dir;
        }
        playhead.active = pConfig.active;
        playhead.stepProgress = 1.0;
      }
    }
  }

  public createProjectData(name: string, bpm: number): ProjectData {
    const cells: ProjectData['cells'] = [];
    this.grid.forEach(cell => {
      // Omit center core and radius 1 departure bays from project cells (they are fixed)
      if (getHexDistance(cell.q, cell.r) > 1) {
        if (cell.enabled || cell.isDead || cell.modifier !== 'NONE') {
          cells.push({
            q: cell.q,
            r: cell.r,
            enabled: cell.enabled,
            isDead: cell.isDead,
            modifier: cell.modifier
          });
        }
      }
    });

    const playheads = this.playheads.map(p => ({
      id: p.id,
      active: p.active,
      q: p.q,
      r: p.r,
      dir: p.dir
    }));

    return {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim() || 'Untitled Project',
      bpm,
      updatedAt: Date.now(),
      gridRadius: HEX_RADIUS,
      cells,
      playheads
    };
  }

  public loadProject(project: ProjectData) {
    this.clearGrid();
    this.audioEngine.setBpm(project.bpm);

    // Apply cells
    for (const item of project.cells) {
      const cell = this.grid.get(cellKey(item.q, item.r));
      if (cell) {
        if (item.q === 0 && item.r === 0) {
          cell.isDead = true;
          cell.enabled = false;
          cell.sound = 'DEAD';
          cell.modifier = 'NONE';
        } else if (this.isDepartureCell(item.q, item.r)) {
          cell.enabled = false;
          cell.isDead = false;
          cell.sound = 'NONE';
          cell.modifier = 'NONE';
        } else if (item.isDead) {
          cell.isDead = true;
          cell.enabled = false;
          cell.sound = 'DEAD';
          cell.modifier = item.modifier || 'NONE';
        } else if (item.enabled) {
          cell.enabled = true;
          cell.isDead = false;
          cell.sound = 'KICK';
          cell.modifier = item.modifier || 'NONE';
        } else {
          cell.enabled = false;
          cell.isDead = false;
          cell.sound = 'NONE';
          cell.modifier = item.modifier || 'NONE';
        }
      }
    }

    // Reset playheads to circle 1
    this.playheads.forEach((p) => {
      p.q = p.startQ;
      p.r = p.startR;
      p.prevQ = p.startQ;
      p.prevR = p.startR;
      p.dir = p.startDir;
      p.active = false;
      p.stepProgress = 1.0;
    });

    // Apply playheads active states
    if (project.playheads && project.playheads.length > 0) {
      for (const pConfig of project.playheads) {
        const playhead = this.playheads.find(p => p.id === pConfig.id);
        if (playhead) {
          playhead.active = !!pConfig.active;
        }
      }
    } else {
      // Default: Head 1 and Head 2 active
      if (this.playheads[0]) this.playheads[0].active = true;
      if (this.playheads[1]) this.playheads[1].active = true;
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
      const dist = getHexDistance(playhead.q, playhead.r);
      // Departure cells (dist 1) and center (dist 0) contain NO sound
      const isDeparture = dist <= 1;
      const isEnabled = !isDeparture && cell && (cell.enabled || (cell.sound !== 'NONE' && cell.sound !== 'DEAD'));

      if (isEnabled && cell) {
        const noteSeed = playhead.q * 3 + playhead.r * 5;
        // Each head has its dedicated sound!
        this.audioEngine.triggerSound(playhead.sound, stepAudioTime, noteSeed);

        cell.lastTriggerTime = performance.now();
        cell.lastTriggerColor = playhead.color;
        cell.triggerIntensity = 1.0;
        triggeredCells.push(cell);
      }

      // Obstacle / Dead Cell predicate
      const isBlocked = (testQ: number, testR: number) => {
        // Center cell (0, 0) is an impassable core
        if (testQ === 0 && testR === 0) return true;
        const target = this.grid.get(cellKey(testQ, testR));
        return target ? (target.isDead || target.sound === 'DEAD') : false;
      };

      // 1. Check if cell has explicit modifier direction
      let nextDir = playhead.dir;
      if (cell && cell.modifier in COMPASS_DIR_MAP) {
        nextDir = COMPASS_DIR_MAP[cell.modifier];
      } else {
        // Stochastic random branching among accessible non-blocked neighbors
        const accessible = getAccessibleDirections(playhead.q, playhead.r, HEX_RADIUS, isBlocked);
        if (accessible.length > 0) {
          const randIdx = Math.floor(Math.random() * accessible.length);
          nextDir = accessible[randIdx];
        } else {
          nextDir = (playhead.dir + 3) % 6;
        }
      }

      // 2. Physics bounce calculation
      const bounceResult = calculateBounce(playhead.q, playhead.r, nextDir, HEX_RADIUS, isBlocked);

      // 3. Update playhead positions
      playhead.prevQ = playhead.q;
      playhead.prevR = playhead.r;
      playhead.q = bounceResult.nextQ;
      playhead.r = bounceResult.nextR;
      playhead.dir = bounceResult.nextDir;
      playhead.stepProgress = 0.0;
    }

    this.currentStepIndex++;
    this.onStepListeners.forEach(listener => listener(this.currentStepIndex, triggeredCells));
  }

  public stepManual() {
    this.executeStep(this.audioEngine.getCurrentTime() + 0.02);
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }
}
