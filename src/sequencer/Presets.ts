import { Preset } from '../grid/HexTypes';

export const PRESETS: Preset[] = [
  {
    id: 'techno-drive',
    name: 'Techno Orbit',
    bpm: 130,
    playheads: [
      { id: 1, active: true }, // Kick
      { id: 2, active: true }, // Snare
      { id: 3, active: true }, // Closed Hat
      { id: 4, active: true }, // Open Hat
      { id: 5, active: true }, // Clap
      { id: 6, active: false }
    ],
    cells: [
      // === KICK LOOP (Sector East) ===
      // Head 1 departs (1,0) heading R -> (2,0)
      { q: 2, r: 0, enabled: true, modifier: 'DIR_R' },
      { q: 3, r: 0, enabled: false, modifier: 'DIR_R' },
      { q: 4, r: 0, enabled: true, modifier: 'DIR_BL' },
      { q: 3, r: 1, enabled: false, modifier: 'DIR_L' },
      { q: 2, r: 1, enabled: false, modifier: 'DIR_TL' },

      // === SNARE & BACKBEATS (Sector SE & S) ===
      // Head 2 departs (0,1) heading BR -> (0,2)
      { q: 0, r: 2, enabled: false, modifier: 'DIR_BR' },
      { q: 0, r: 3, enabled: true, modifier: 'DIR_TR' },
      { q: 1, r: 2, enabled: false, modifier: 'DIR_BL' },
      { q: 0, r: 4, enabled: true, modifier: 'DIR_TR' },
      { q: 1, r: 3, enabled: false, modifier: 'DIR_TL' },
      { q: 1, r: 4, enabled: true, modifier: 'DIR_L' },

      // === CLAP GROOVE (Sector NW & N) ===
      // Head 5 departs (0,-1) heading TL -> (0,-2)
      { q: 0, r: -2, enabled: false, modifier: 'DIR_TL' },
      { q: 0, r: -3, enabled: true, modifier: 'DIR_BL' },
      { q: -1, r: -2, enabled: false, modifier: 'DIR_TR' },
      { q: 0, r: -4, enabled: true, modifier: 'DIR_BL' },
      { q: -1, r: -3, enabled: false, modifier: 'DIR_BR' },
      { q: -1, r: -4, enabled: true, modifier: 'DIR_R' },

      // === CLOSED & OPEN HATS (Sector W & SW) ===
      // Head 3 departs (-1,1) heading BL -> (-2,2)
      // Head 4 departs (-1,0) heading L -> (-2,0)
      { q: -2, r: 2, enabled: true, modifier: 'DIR_BL' },
      { q: -3, r: 3, enabled: false, modifier: 'DIR_TL' },
      { q: -3, r: 2, enabled: true, modifier: 'DIR_TR' },
      { q: -2, r: 1, enabled: false, modifier: 'DIR_R' },

      { q: -2, r: 0, enabled: true, modifier: 'DIR_L' },
      { q: -3, r: 0, enabled: false, modifier: 'DIR_BL' },
      { q: -4, r: 1, enabled: true, modifier: 'DIR_TR' },
      { q: -4, r: 0, enabled: false, modifier: 'DIR_R' },
      { q: -3, r: -1, enabled: true, modifier: 'DIR_BR' },
      { q: -2, r: -1, enabled: false, modifier: 'DIR_L' },

      // Outer Perimeter Walls acting as reflectors
      { q: 5, r: 0, isDead: true, modifier: 'NONE' },
      { q: 5, r: -1, isDead: true, modifier: 'NONE' },
      { q: 0, r: 5, isDead: true, modifier: 'NONE' },
      { q: -1, r: 5, isDead: true, modifier: 'NONE' },
      { q: -5, r: 5, isDead: true, modifier: 'NONE' },
      { q: -5, r: 0, isDead: true, modifier: 'NONE' },
      { q: 0, r: -5, isDead: true, modifier: 'NONE' },
      { q: 1, r: -5, isDead: true, modifier: 'NONE' },
    ]
  },
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
    id: 'ambient-nexus',
    name: 'Melodic Nexus',
    bpm: 98,
    playheads: [
      { id: 1, active: true }, // Kick
      { id: 2, active: false },
      { id: 3, active: true }, // Closed Hat
      { id: 4, active: false },
      { id: 5, active: true }, // Clap
      { id: 6, active: true }  // Synth (Melodic Lead)
    ],
    cells: [
      // Ambient Kick Heartbeat
      { q: 2, r: 0, enabled: true, modifier: 'DIR_R' },
      { q: 3, r: 0, enabled: false, modifier: 'DIR_BL' },
      { q: 2, r: 1, enabled: true, modifier: 'DIR_TL' },

      // Soft Hat Ticking Loop (Sector SW/W)
      { q: -2, r: 2, enabled: true, modifier: 'DIR_L' },
      { q: -3, r: 2, enabled: false, modifier: 'DIR_TL' },
      { q: -3, r: 1, enabled: true, modifier: 'DIR_TR' },
      { q: -2, r: 0, enabled: false, modifier: 'DIR_BR' },
      { q: -2, r: 1, enabled: true, modifier: 'DIR_BL' },

      // Floating Clap Accent Loop (Sector NW/N)
      { q: 0, r: -2, enabled: true, modifier: 'DIR_TL' },
      { q: 0, r: -3, enabled: false, modifier: 'DIR_TR' },
      { q: 1, r: -4, enabled: true, modifier: 'DIR_BR' },
      { q: 1, r: -3, enabled: false, modifier: 'DIR_BL' },

      // Wide Synth Melodic Path (Coordinates generate different pitch tones!)
      { q: 2, r: -2, enabled: true, modifier: 'DIR_TR' },
      { q: 3, r: -3, enabled: true, modifier: 'DIR_R' },
      { q: 4, r: -3, enabled: true, modifier: 'DIR_BR' },
      { q: 4, r: -2, enabled: false, modifier: 'DIR_BL' },
      { q: 3, r: -1, enabled: true, modifier: 'DIR_L' },
      { q: 2, r: -1, enabled: false, modifier: 'DIR_TL' },

      // Lower Synth Nodes
      { q: 1, r: 3, enabled: true, modifier: 'DIR_L' },
      { q: 0, r: 3, enabled: true, modifier: 'DIR_TL' },
      { q: -1, r: 3, enabled: false, modifier: 'DIR_TR' },
      { q: 3, r: -4, enabled: true, modifier: 'DIR_BL' },
      { q: 2, r: -4, enabled: true, modifier: 'DIR_BR' },

      // Harmonic Reflective Barrier Maze
      { q: 4, r: -4, isDead: true, modifier: 'NONE' },
      { q: 5, r: -3, isDead: true, modifier: 'NONE' },
      { q: -2, r: 4, isDead: true, modifier: 'NONE' },
      { q: -3, r: 4, isDead: true, modifier: 'NONE' },
      { q: 0, r: -4, isDead: true, modifier: 'NONE' },
    ]
  },
  {
    id: 'acid-honeycomb',
    name: 'Acid Honeycomb',
    bpm: 128,
    playheads: [
      { id: 1, active: true }, // Kick
      { id: 2, active: true }, // Snare
      { id: 3, active: true }, // Closed Hat
      { id: 4, active: true }, // Open Hat
      { id: 5, active: false },
      { id: 6, active: true }  // Synth Acid Loop
    ],
    cells: [
      // Driving 4-on-floor Kick & Snare Track
      { q: 2, r: 0, enabled: true, modifier: 'DIR_R' },
      { q: 3, r: 0, enabled: false, modifier: 'DIR_R' },
      { q: 4, r: 0, enabled: true, modifier: 'DIR_BL' },
      { q: 3, r: 1, enabled: false, modifier: 'DIR_TL' },
      { q: 0, r: 2, enabled: true, modifier: 'DIR_BR' },
      { q: 0, r: 3, enabled: false, modifier: 'DIR_TR' },
      { q: 1, r: 2, enabled: true, modifier: 'DIR_L' },

      // Acid Synth Arpeggiator (Zig-zagging through high and low coordinate pitches)
      { q: 2, r: -2, enabled: true, modifier: 'DIR_R' },
      { q: 3, r: -2, enabled: true, modifier: 'DIR_TR' },
      { q: 4, r: -3, enabled: true, modifier: 'DIR_TL' },
      { q: 4, r: -4, enabled: true, modifier: 'DIR_L' },
      { q: 3, r: -3, enabled: true, modifier: 'DIR_BL' },
      { q: 2, r: -3, enabled: false, modifier: 'DIR_BR' },
      { q: 1, r: -2, enabled: true, modifier: 'DIR_R' },

      // Sizzling Hats
      { q: -2, r: 2, enabled: true, modifier: 'DIR_BL' },
      { q: -3, r: 3, enabled: true, modifier: 'DIR_TL' },
      { q: -3, r: 2, enabled: false, modifier: 'DIR_R' },
      { q: -2, r: 0, enabled: true, modifier: 'DIR_L' },
      { q: -3, r: 0, enabled: true, modifier: 'DIR_TR' },
      { q: -2, r: -1, enabled: false, modifier: 'DIR_BR' },

      // Acid Walls
      { q: 5, r: -3, isDead: true, modifier: 'NONE' },
      { q: 5, r: -2, isDead: true, modifier: 'NONE' },
      { q: -4, r: 3, isDead: true, modifier: 'NONE' },
      { q: -4, r: -1, isDead: true, modifier: 'NONE' },
      { q: 0, r: 4, isDead: true, modifier: 'NONE' },
      { q: 0, r: -4, isDead: true, modifier: 'NONE' },
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
  },
  {
    id: 'blank',
    name: 'Empty Canvas',
    bpm: 120,
    playheads: [
      { id: 1, active: true },
      { id: 2, active: false },
      { id: 3, active: false },
      { id: 4, active: false },
      { id: 5, active: false },
      { id: 6, active: false }
    ],
    cells: []
  }
];
