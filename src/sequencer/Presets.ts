import { Preset } from '../grid/HexTypes';

export const PRESETS: Preset[] = [
  {
    id: 'polyrhythm-orbit',
    name: 'Hex Polyrhythm',
    bpm: 120,
    playheads: [
      { id: 1, active: true }, // Kick (Ring 2 loop)
      { id: 2, active: true }, // Snare (Ring 3 loop)
      { id: 3, active: true }, // Closed Hat (Ring 4 loop)
      { id: 4, active: true }, // Open Hat
      { id: 5, active: true }, // Clap
      { id: 6, active: true }  // Synth (Ring 5 perimeter loop)
    ],
    cells: [
      // --- RING 2 INNER HEX ORBIT (Period 6) ---
      // Clockwise orbit visiting all 6 vertices of Ring 2
      { q: 2, r: 0, enabled: true, modifier: 'DIR_BR' },
      { q: 1, r: 1, enabled: false, modifier: 'DIR_BL' },
      { q: -1, r: 2, enabled: true, modifier: 'DIR_L' },
      { q: -2, r: 1, enabled: false, modifier: 'DIR_TL' },
      { q: -1, r: -1, enabled: true, modifier: 'DIR_TR' },
      { q: 1, r: -2, enabled: false, modifier: 'DIR_R' },

      // --- RING 3 MID ORBIT (Period 12) ---
      { q: 3, r: 0, enabled: true, modifier: 'DIR_BR' },
      { q: 3, r: -1, enabled: false, modifier: 'DIR_TR' },
      { q: 2, r: 1, enabled: false, modifier: 'DIR_BR' },
      { q: 0, r: 3, enabled: true, modifier: 'DIR_BL' },
      { q: -1, r: 3, enabled: false, modifier: 'DIR_BL' },
      { q: -3, r: 3, enabled: true, modifier: 'DIR_L' },
      { q: -3, r: 2, enabled: false, modifier: 'DIR_TL' },
      { q: -3, r: 0, enabled: true, modifier: 'DIR_TL' },
      { q: -2, r: -1, enabled: false, modifier: 'DIR_TR' },
      { q: 0, r: -3, enabled: true, modifier: 'DIR_TR' },
      { q: 1, r: -3, enabled: false, modifier: 'DIR_R' },
      { q: 2, r: -2, enabled: false, modifier: 'DIR_R' },

      // --- RING 4 & 5 OUTER CIRCUITS ---
      { q: 4, r: 0, enabled: true, modifier: 'DIR_BL' },
      { q: 3, r: -3, enabled: true, modifier: 'DIR_BR' },
      { q: 0, r: 4, enabled: true, modifier: 'DIR_TL' },
      { q: -4, r: 4, enabled: true, modifier: 'DIR_TR' },
      { q: -4, r: 0, enabled: true, modifier: 'DIR_BR' },
      { q: 0, r: -4, enabled: true, modifier: 'DIR_BL' },

      // Perimeter Synth Nodes (Radius 5)
      { q: 5, r: -2, enabled: true, modifier: 'DIR_BL' },
      { q: 2, r: 3, enabled: true, modifier: 'DIR_TL' },
      { q: -3, r: 5, enabled: true, modifier: 'DIR_TR' },
      { q: -5, r: 2, enabled: true, modifier: 'DIR_R' },
      { q: -2, r: -3, enabled: true, modifier: 'DIR_BR' },
      { q: 3, r: -5, enabled: true, modifier: 'DIR_L' },

      // Strategic Wall Obstacles to maintain orbit stability
      { q: 4, r: -1, isDead: true, modifier: 'NONE' },
      { q: -4, r: 1, isDead: true, modifier: 'NONE' },
      { q: 1, r: -4, isDead: true, modifier: 'NONE' },
      { q: -1, r: 4, isDead: true, modifier: 'NONE' },
    ]
  },
  {
    id: 'idm-generative',
    name: 'IDM Generative',
    bpm: 138,
    playheads: [
      { id: 1, active: true },
      { id: 2, active: true },
      { id: 3, active: true },
      { id: 4, active: false },
      { id: 5, active: true },
      { id: 6, active: true }
    ],
    cells: [
      // Scattered trigger nodes across rings 2, 3, 4, 5 with random branching ('NONE')
      { q: 2, r: 0, enabled: true, modifier: 'DIR_R' },
      { q: 3, r: 1, enabled: true, modifier: 'NONE' },
      { q: 4, r: -1, enabled: true, modifier: 'DIR_BL' },
      { q: 0, r: 2, enabled: true, modifier: 'NONE' },
      { q: 1, r: 3, enabled: true, modifier: 'DIR_TL' },
      { q: -2, r: 2, enabled: true, modifier: 'NONE' },
      { q: -3, r: 1, enabled: true, modifier: 'DIR_TR' },
      { q: -2, r: 0, enabled: true, modifier: 'NONE' },
      { q: -4, r: 2, enabled: true, modifier: 'DIR_R' },
      { q: 0, r: -2, enabled: true, modifier: 'NONE' },
      { q: -1, r: -3, enabled: true, modifier: 'DIR_BR' },
      { q: 2, r: -2, enabled: true, modifier: 'NONE' },
      { q: 3, r: -3, enabled: true, modifier: 'DIR_L' },
      { q: 4, r: -2, enabled: true, modifier: 'NONE' },
      { q: -3, r: 4, enabled: true, modifier: 'DIR_R' },
      { q: 2, r: -4, enabled: true, modifier: 'DIR_BL' },

      // Obstacle walls forcing broken-beat bounces
      { q: 3, r: -1, isDead: true, modifier: 'NONE' },
      { q: -3, r: 2, isDead: true, modifier: 'NONE' },
      { q: 1, r: -3, isDead: true, modifier: 'NONE' },
      { q: -1, r: 3, isDead: true, modifier: 'NONE' },
      { q: 4, r: -3, isDead: true, modifier: 'NONE' },
      { q: -4, r: 3, isDead: true, modifier: 'NONE' },
    ]
  }
];
