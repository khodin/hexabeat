import { QuestDefinition, QuestMetrics, QuestStepEvent, QuestTarget } from './QuestTypes';
import { QUESTS } from './Quests';
import { Sequencer } from '../sequencer/Sequencer';
import { AudioEngine } from '../audio/AudioEngine';

const COMPLETED_QUESTS_KEY = 'hexabeat_academy_completed';
const STARS_QUESTS_KEY = 'hexabeat_academy_stars';

export interface QuestCallbacks {
  onQuestStarted: (quest: QuestDefinition) => void;
  onProgressUpdated: (progressText: string) => void;
  onQuestVictory: (quest: QuestDefinition, isLast: boolean, stars: number, steps: number) => void;
  onQuestExited: () => void;
}

export class QuestManager {
  private activeQuestIndex: number | null = null;
  private currentMetrics: QuestMetrics | null = null;
  private completedQuestIds: Set<string> = new Set();
  private questStarsMap: Map<string, number> = new Map();
  private callbacks: QuestCallbacks | null = null;
  private isVictoryHandled: boolean = false;
  private stepsInCurrentRun: number = 0;

  constructor(
    private sequencer: Sequencer,
    private audioEngine: AudioEngine
  ) {
    this.loadProgress();
  }

  public setCallbacks(callbacks: QuestCallbacks) {
    this.callbacks = callbacks;
  }

  private loadProgress() {
    try {
      const rawCompleted = localStorage.getItem(COMPLETED_QUESTS_KEY);
      if (rawCompleted) {
        const parsed = JSON.parse(rawCompleted);
        if (Array.isArray(parsed)) {
          this.completedQuestIds = new Set(parsed);
        }
      }
    } catch {}

    try {
      const rawStars = localStorage.getItem(STARS_QUESTS_KEY);
      if (rawStars) {
        const parsedStars = JSON.parse(rawStars);
        if (parsedStars && typeof parsedStars === 'object') {
          for (const [k, v] of Object.entries(parsedStars)) {
            if (typeof v === 'number') {
              this.questStarsMap.set(k, v);
            }
          }
        }
      }
    } catch {}
  }

  private saveProgress() {
    try {
      localStorage.setItem(
        COMPLETED_QUESTS_KEY,
        JSON.stringify(Array.from(this.completedQuestIds))
      );
    } catch {}

    try {
      const starsObj: Record<string, number> = {};
      this.questStarsMap.forEach((v, k) => {
        starsObj[k] = v;
      });
      localStorage.setItem(STARS_QUESTS_KEY, JSON.stringify(starsObj));
    } catch {}
  }

  public isQuestCompleted(questId: string): boolean {
    return this.completedQuestIds.has(questId);
  }

  public getQuestStars(questId: string): number {
    return this.questStarsMap.get(questId) || 0;
  }

  public isQuestUnlocked(index: number): boolean {
    if (index === 0) return true;
    const prevQuest = QUESTS[index - 1];
    return prevQuest ? this.completedQuestIds.has(prevQuest.id) : false;
  }

  public isQuestActive(): boolean {
    return this.activeQuestIndex !== null;
  }

  public getActiveQuest(): QuestDefinition | null {
    if (this.activeQuestIndex === null) return null;
    return QUESTS[this.activeQuestIndex] || null;
  }

  public getTargets(): QuestTarget[] {
    const quest = this.getActiveQuest();
    return quest ? quest.targets : [];
  }

  public startQuest(index: number) {
    const quest = QUESTS[index];
    if (!quest) return;

    this.activeQuestIndex = index;
    this.isVictoryHandled = false;
    this.stepsInCurrentRun = 0;
    this.currentMetrics = quest.resetMetrics();

    // 1. Stop playback & reset playheads
    this.audioEngine.stop();
    this.sequencer.stop();

    // 2. Clear grid and apply initial quest cells
    this.sequencer.clearGrid();
    for (const c of quest.initialCells) {
      this.sequencer.setCell(c.q, c.r, c.enabled, c.isDead, c.modifier);
    }

    // 3. Set active playheads according to quest
    const playheads = this.sequencer.getPlayheads();
    playheads.forEach(p => {
      const shouldBeActive = quest.initialActivePlayheadIds.includes(p.id);
      if (p.active !== shouldBeActive) {
        this.sequencer.togglePlayhead(p.id);
      }
    });

    // 4. Set tempo
    this.audioEngine.setBpm(quest.initialBpm);

    // 5. Notify callbacks
    this.callbacks?.onQuestStarted(quest);
    this.callbacks?.onProgressUpdated(quest.getProgressString(this.currentMetrics));
  }

  public resetCurrentQuest() {
    if (this.activeQuestIndex !== null) {
      this.startQuest(this.activeQuestIndex);
    }
  }

  public exitQuest() {
    this.activeQuestIndex = null;
    this.currentMetrics = null;
    this.isVictoryHandled = false;
    this.stepsInCurrentRun = 0;
    this.callbacks?.onQuestExited();
  }

  public nextQuest() {
    if (this.activeQuestIndex !== null && this.activeQuestIndex < QUESTS.length - 1) {
      this.startQuest(this.activeQuestIndex + 1);
    } else {
      this.exitQuest();
    }
  }

  public countExtraneousModifications(quest: QuestDefinition): number {
    let extras = 0;
    const initialMap = new Map<string, { enabled: boolean; isDead: boolean; modifier: string }>();
    for (const c of quest.initialCells) {
      initialMap.set(`${c.q},${c.r}`, { enabled: c.enabled, isDead: c.isDead, modifier: c.modifier });
    }
    const targetMap = new Map<string, QuestTarget>();
    for (const t of quest.targets) {
      targetMap.set(`${t.q},${t.r}`, t);
    }

    // 1. Check playhead activations
    const playheads = this.sequencer.getPlayheads();
    const expectedPlayheadIds = new Set<number>(quest.initialActivePlayheadIds);
    for (const t of quest.targets) {
      const head = this.sequencer.getDeparturePlayhead(t.q, t.r);
      if (head) {
        expectedPlayheadIds.add(head.id);
      }
    }
    for (const p of playheads) {
      if (p.active && !expectedPlayheadIds.has(p.id)) {
        extras++;
      }
    }

    // 2. Check grid cells
    const grid = this.sequencer.getGrid();
    for (const [key, cell] of grid) {
      const isTarget = targetMap.has(key);
      const initial = initialMap.get(key);

      if (isTarget) {
        const target = targetMap.get(key)!;
        if (target.tool === 'WALL') {
          if (!cell.isDead) extras++;
        } else if (target.tool === 'BEAT') {
          if (!this.sequencer.isDepartureCell(cell.q, cell.r) && !cell.enabled) {
            extras++;
          }
        } else if (target.tool === 'DIRECTION') {
          if (target.expectedModifier && cell.modifier !== target.expectedModifier) {
            extras++;
          }
        }
      } else if (initial) {
        if (quest.id === 'quest-3-infinite-orbit') {
          if (cell.isDead !== initial.isDead || cell.modifier !== initial.modifier) {
            extras++;
          }
        } else {
          if (cell.enabled !== initial.enabled || cell.isDead !== initial.isDead || cell.modifier !== initial.modifier) {
            extras++;
          }
        }
      } else {
        const dist = (Math.abs(cell.q) + Math.abs(cell.r) + Math.abs(cell.q + cell.r)) / 2;
        if (dist <= 1) {
          if (cell.isDead && (cell.q !== 0 || cell.r !== 0)) {
            extras++;
          }
        } else {
          if (quest.id === 'quest-3-infinite-orbit' && dist === 2) {
            if (cell.isDead || (cell.modifier && cell.modifier !== 'NONE')) {
              extras++;
            }
          } else {
            if (cell.enabled || cell.isDead || (cell.modifier && cell.modifier !== 'NONE')) {
              extras++;
            }
          }
        }
      }
    }

    return extras;
  }

  public calculateStars(quest: QuestDefinition, steps: number, extraModifications: number): number {
    if (steps <= quest.threeStarsMaxSteps && extraModifications === 0) {
      return 3;
    }
    if (steps <= quest.twoStarsMaxSteps && extraModifications <= 1) {
      return 2;
    }
    return 1;
  }

  public onSequencerStep(stepIndex?: number) {
    if (stepIndex === 0) {
      this.stepsInCurrentRun = 0;
      return;
    }

    const quest = this.getActiveQuest();
    if (!quest || !this.currentMetrics || this.isVictoryHandled) return;

    if (stepIndex !== undefined) {
      this.stepsInCurrentRun = stepIndex;
    } else {
      this.stepsInCurrentRun++;
    }

    // Build Step Event from current sequencer state
    const playheads = this.sequencer.getPlayheads();
    const triggeredPlayheads: Array<{ id: number; sound: any; q: number; r: number }> = [];

    for (const p of playheads) {
      if (!p.active) continue;
      const cell = this.sequencer.getCell(p.q, p.r);
      const dist = (Math.abs(p.q) + Math.abs(p.r) + Math.abs(p.q + p.r)) / 2;
      if (dist > 1 && cell && (cell.enabled || (cell.sound && cell.sound !== 'NONE' && cell.sound !== 'DEAD'))) {
        triggeredPlayheads.push({ id: p.id, sound: p.sound, q: p.q, r: p.r });
      }
    }

    const event: QuestStepEvent = {
      stepIndex: this.stepsInCurrentRun,
      triggeredPlayheads,
      playheadPositions: playheads.map(p => ({
        id: p.id,
        q: p.q,
        r: p.r,
        dir: p.dir,
        active: p.active
      })),
      isBlockedAt: (q: number, r: number) => {
        const cell = this.sequencer.getCell(q, r);
        const dist = (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
        if (dist <= 1) return true;
        return cell ? (cell.isDead || cell.sound === 'DEAD') : false;
      }
    };

    const isComplete = quest.onStep(event, this.currentMetrics);
    this.callbacks?.onProgressUpdated(quest.getProgressString(this.currentMetrics));

    if (isComplete && !this.isVictoryHandled) {
      this.isVictoryHandled = true;
      const extraEdits = this.countExtraneousModifications(quest);
      const stars = this.calculateStars(quest, this.stepsInCurrentRun, extraEdits);

      const prevStars = this.questStarsMap.get(quest.id) || 0;
      if (stars > prevStars) {
        this.questStarsMap.set(quest.id, stars);
      }
      this.completedQuestIds.add(quest.id);
      this.saveProgress();

      const isLast = quest.index === QUESTS.length;
      this.callbacks?.onQuestVictory(quest, isLast, stars, this.stepsInCurrentRun);
    }
  }
}
