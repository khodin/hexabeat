import { QuestDefinition, QuestMetrics, QuestStepEvent, QuestTarget } from './QuestTypes';
import { QUESTS } from './Quests';
import { Sequencer } from '../sequencer/Sequencer';
import { AudioEngine } from '../audio/AudioEngine';

const COMPLETED_QUESTS_KEY = 'hexabeat_academy_completed';

export interface QuestCallbacks {
  onQuestStarted: (quest: QuestDefinition) => void;
  onProgressUpdated: (progressText: string) => void;
  onQuestVictory: (quest: QuestDefinition, isLast: boolean) => void;
  onQuestExited: () => void;
}

export class QuestManager {
  private activeQuestIndex: number | null = null;
  private currentMetrics: QuestMetrics | null = null;
  private completedQuestIds: Set<string> = new Set();
  private callbacks: QuestCallbacks | null = null;
  private isVictoryHandled: boolean = false;

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
      const raw = localStorage.getItem(COMPLETED_QUESTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.completedQuestIds = new Set(parsed);
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
  }

  public isQuestCompleted(questId: string): boolean {
    return this.completedQuestIds.has(questId);
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
    this.callbacks?.onQuestExited();
  }

  public nextQuest() {
    if (this.activeQuestIndex !== null && this.activeQuestIndex < QUESTS.length - 1) {
      this.startQuest(this.activeQuestIndex + 1);
    } else {
      this.exitQuest();
    }
  }

  public onSequencerStep() {
    const quest = this.getActiveQuest();
    if (!quest || !this.currentMetrics || this.isVictoryHandled) return;

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
      stepIndex: 0,
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
      this.completedQuestIds.add(quest.id);
      this.saveProgress();
      const isLast = quest.index === QUESTS.length;
      this.callbacks?.onQuestVictory(quest, isLast);
    }
  }
}
