import { QuestDefinition, QuestMetrics, QuestStepEvent } from './QuestTypes';
import { formatString, t } from '../i18n/translations';

export const QUESTS: QuestDefinition[] = [
  // -------------------------------------------------------------
  // QUEST 1: The First Beat (Kick & Play)
  // -------------------------------------------------------------
  {
    id: 'quest-1-first-beat',
    index: 1,
    titleKey: 'quest1Title',
    descKey: 'quest1Desc',
    goalKey: 'quest1Goal',
    defaultTool: 'BEAT',
    initialBpm: 120,
    initialActivePlayheadIds: [1], // Alpha only
    initialCells: [
      { q: 1, r: 0, enabled: false, isDead: false, modifier: 'DIR_R' }
    ],
    targets: [
      { q: 2, r: 0, tool: 'BEAT' }
    ],
    resetMetrics: (): QuestMetrics => ({
      kicksCount: 0,
      snaresCount: 0,
      wallBouncesCount: 0,
      loopStreak: 0,
      distinctSynthFrequencies: new Set<number>(),
      visitedPositionsHistory: []
    }),
    onStep: (event: QuestStepEvent, metrics: QuestMetrics): boolean => {
      const alphaTrigger = event.triggeredPlayheads.find(p => p.id === 1 && p.sound === 'KICK');
      if (alphaTrigger) {
        metrics.kicksCount++;
      }
      return metrics.kicksCount >= 1;
    },
    getProgressString: (metrics: QuestMetrics): string => {
      return formatString(t('quest1Goal'), Math.min(1, metrics.kicksCount), 1);
    }
  },

  // -------------------------------------------------------------
  // QUEST 2: Echo Bounce (Wall & Physics)
  // -------------------------------------------------------------
  {
    id: 'quest-2-echo-bounce',
    index: 2,
    titleKey: 'quest2Title',
    descKey: 'quest2Desc',
    goalKey: 'quest2Goal',
    defaultTool: 'BEAT',
    initialBpm: 60,
    initialActivePlayheadIds: [1], // Alpha only
    initialCells: [
      { q: 2, r: 0, enabled: true, isDead: false, modifier: 'NONE' },
      // Guide rails for the bounce corridor:
      { q: 2, r: -1, enabled: false, isDead: true, modifier: 'NONE' },
      { q: 3, r: -1, enabled: false, isDead: true, modifier: 'NONE' },
      { q: 1, r: 1, enabled: false, isDead: true, modifier: 'NONE' },
      { q: 2, r: 1, enabled: false, isDead: true, modifier: 'NONE' }
    ],
    targets: [
      { q: 4, r: -1, tool: 'WALL' },
      { q: 4, r: 0, tool: 'WALL' },
      { q: 3, r: 1, tool: 'WALL' }
    ],
    resetMetrics: (): QuestMetrics => ({
      kicksCount: 0,
      snaresCount: 0,
      wallBouncesCount: 0,
      loopStreak: 0,
      distinctSynthFrequencies: new Set<number>(),
      visitedPositionsHistory: []
    }),
    onStep: (event: QuestStepEvent, metrics: QuestMetrics): boolean => {
      const alphaTrigger = event.triggeredPlayheads.find(p => p.id === 1 && p.sound === 'KICK');
      if (alphaTrigger) {
        metrics.kicksCount++;
      }

      // Check if alpha hit the wall at (4, 0)
      const alpha = event.playheadPositions.find(p => p.id === 1);
      if (alpha && alpha.q === 3 && alpha.r === 0 && event.isBlockedAt(4, 0)) {
        metrics.wallBouncesCount++;
      }

      const totalProgress = Math.max(metrics.wallBouncesCount, metrics.kicksCount);
      return totalProgress >= 4;
    },
    getProgressString: (metrics: QuestMetrics): string => {
      const current = Math.min(4, Math.max(metrics.wallBouncesCount, metrics.kicksCount));
      return formatString(t('quest2Goal'), current, 4);
    }
  },

  // -------------------------------------------------------------
  // QUEST 3: Infinite Orbit (Direction Stamp Loop)
  // -------------------------------------------------------------
  {
    id: 'quest-3-infinite-orbit',
    index: 3,
    titleKey: 'quest3Title',
    descKey: 'quest3Desc',
    goalKey: 'quest3Goal',
    defaultTool: 'DIRECTION',
    initialBpm: 120,
    initialActivePlayheadIds: [1], // Alpha only
    initialCells: [
      // Alpha departure pad guides directly to (2, 0)
      { q: 1, r: 0, enabled: false, isDead: false, modifier: 'DIR_R' },
      // 3 pre-placed alternating vertices of Ring 2 hexagon orbit:
      { q: 0, r: 2, enabled: false, isDead: false, modifier: 'DIR_L' },
      { q: -2, r: 0, enabled: false, isDead: false, modifier: 'DIR_TR' },
      { q: 2, r: -2, enabled: false, isDead: false, modifier: 'DIR_BR' }
    ],
    targets: [
      // 3 vertices to complete by player to close the full 12-cell ring:
      { q: 2, r: 0, tool: 'DIRECTION', expectedModifier: 'DIR_BL' },
      { q: -2, r: 2, tool: 'DIRECTION', expectedModifier: 'DIR_TL' },
      { q: 0, r: -2, tool: 'DIRECTION', expectedModifier: 'DIR_R' }
    ],
    resetMetrics: (): QuestMetrics => ({
      kicksCount: 0,
      snaresCount: 0,
      wallBouncesCount: 0,
      loopStreak: 0,
      distinctSynthFrequencies: new Set<number>(),
      visitedPositionsHistory: []
    }),
    onStep: (event: QuestStepEvent, metrics: QuestMetrics): boolean => {
      const alpha = event.playheadPositions.find(p => p.id === 1);
      if (alpha) {
        // Track whether alpha is staying on ring 2 (dist === 2)
        const dist = (Math.abs(alpha.q) + Math.abs(alpha.r) + Math.abs(alpha.q + alpha.r)) / 2;
        if (dist === 2) {
          metrics.loopStreak++;
        } else {
          metrics.loopStreak = 0;
        }
      }
      return metrics.loopStreak >= 12;
    },
    getProgressString: (metrics: QuestMetrics): string => {
      return formatString(t('quest3Goal'), Math.min(12, metrics.loopStreak), 12);
    }
  },

  // -------------------------------------------------------------
  // QUEST 4: Kick & Snare Duo (Wake Bay & Polyrhythm)
  // -------------------------------------------------------------
  {
    id: 'quest-4-kick-snare-duo',
    index: 4,
    titleKey: 'quest4Title',
    descKey: 'quest4Desc',
    goalKey: 'quest4Goal',
    defaultTool: 'BEAT',
    initialBpm: 120,
    initialActivePlayheadIds: [1], // Alpha active, Beta (2) waiting at (0, 1)
    initialCells: [
      // Alpha start route from departure pad
      { q: 1, r: 0, enabled: false, isDead: false, modifier: 'DIR_R' },
      // Ring 2 hexagon orbit with Kick on (2, 0)
      { q: 2, r: 0, enabled: true, isDead: false, modifier: 'DIR_BL' },
      // Corner 2 (0, 2) is target for player to place Snare
      { q: 0, r: 2, enabled: false, isDead: false, modifier: 'DIR_L' },
      // Other corners of Ring 2 to complete continuous dual loop
      { q: -2, r: 2, enabled: false, isDead: false, modifier: 'DIR_TL' },
      { q: -2, r: 0, enabled: false, isDead: false, modifier: 'DIR_TR' },
      { q: 0, r: -2, enabled: false, isDead: false, modifier: 'DIR_R' },
      { q: 2, r: -2, enabled: false, isDead: false, modifier: 'DIR_BR' }
    ],
    targets: [
      { q: 0, r: 1, tool: 'BEAT' }, // Beta launch pad
      { q: 0, r: 2, tool: 'BEAT' }  // Snare trigger node
    ],
    resetMetrics: (): QuestMetrics => ({
      kicksCount: 0,
      snaresCount: 0,
      wallBouncesCount: 0,
      loopStreak: 0,
      distinctSynthFrequencies: new Set<number>(),
      visitedPositionsHistory: []
    }),
    onStep: (event: QuestStepEvent, metrics: QuestMetrics): boolean => {
      for (const p of event.triggeredPlayheads) {
        if (p.sound === 'KICK') metrics.kicksCount++;
        if (p.sound === 'SNARE') metrics.snaresCount++;
      }
      return metrics.kicksCount >= 4 && metrics.snaresCount >= 4;
    },
    getProgressString: (metrics: QuestMetrics): string => {
      return formatString(
        t('quest4Goal'),
        Math.min(4, metrics.kicksCount),
        4,
        Math.min(4, metrics.snaresCount),
        4
      );
    }
  },

  // -------------------------------------------------------------
  // QUEST 5: Spatial Melody (Zeta & Synth Arpeggios)
  // -------------------------------------------------------------
  {
    id: 'quest-5-spatial-melody',
    index: 5,
    titleKey: 'quest5Title',
    descKey: 'quest5Desc',
    goalKey: 'quest5Goal',
    defaultTool: 'BEAT',
    initialBpm: 128,
    initialActivePlayheadIds: [6], // Zeta (Synth) active
    initialCells: [],
    targets: [
      { q: 2, r: -2, tool: 'BEAT' }, // Frequency Sol 3
      { q: 3, r: -2, tool: 'BEAT' }, // Frequency Do 3
      { q: 3, r: -3, tool: 'BEAT' }  // Frequency Do 4
    ],
    resetMetrics: (): QuestMetrics => ({
      kicksCount: 0,
      snaresCount: 0,
      wallBouncesCount: 0,
      loopStreak: 0,
      distinctSynthFrequencies: new Set<number>(),
      visitedPositionsHistory: []
    }),
    onStep: (event: QuestStepEvent, metrics: QuestMetrics): boolean => {
      for (const p of event.triggeredPlayheads) {
        if (p.sound === 'SYNTH') {
          const noteIndex = Math.abs(p.q * 3 + p.r * 5) % 7;
          metrics.distinctSynthFrequencies.add(noteIndex);
        }
      }
      return metrics.distinctSynthFrequencies.size >= 3;
    },
    getProgressString: (metrics: QuestMetrics): string => {
      return formatString(
        t('quest5Goal'),
        Math.min(3, metrics.distinctSynthFrequencies.size),
        3
      );
    }
  }
];
