import { ModifierType, SoundType } from '../grid/HexTypes';
import { EditorTool } from '../ui/UIController';
import { Translations } from '../i18n/translations';

export interface QuestTarget {
  q: number;
  r: number;
  tool: EditorTool;
  expectedModifier?: ModifierType;
}

export interface QuestStepEvent {
  stepIndex: number;
  triggeredPlayheads: Array<{ id: number; sound: SoundType; q: number; r: number }>;
  playheadPositions: Array<{ id: number; q: number; r: number; dir: number; active: boolean }>;
  isBlockedAt: (q: number, r: number) => boolean;
}

export interface QuestMetrics {
  kicksCount: number;
  snaresCount: number;
  wallBouncesCount: number;
  loopStreak: number;
  distinctSynthFrequencies: Set<number>;
  visitedPositionsHistory: Array<{ q: number; r: number }>;
}

export interface QuestDefinition {
  id: string;
  index: number;
  titleKey: keyof Translations;
  descKey: keyof Translations;
  goalKey: keyof Translations;
  defaultTool: EditorTool;
  initialBpm: number;
  initialActivePlayheadIds: number[];
  initialCells: Array<{
    q: number;
    r: number;
    enabled: boolean;
    isDead: boolean;
    modifier: ModifierType;
  }>;
  targets: QuestTarget[];
  resetMetrics: () => QuestMetrics;
  onStep: (event: QuestStepEvent, metrics: QuestMetrics) => boolean;
  getProgressString: (metrics: QuestMetrics) => string;
  threeStarsMaxSteps: number;
  twoStarsMaxSteps: number;
}
