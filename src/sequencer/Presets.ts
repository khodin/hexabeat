import { Preset } from '../grid/HexTypes';

export const PRESETS: Preset[] = [
  {
    id: 'techno-drive',
    name: 'Techno Drive',
    bpm: 128,
    playheads: [
      { id: 1, active: true },
      { id: 2, active: true },
      { id: 3, active: true },
      { id: 4, active: false },
      { id: 5, active: false },
      { id: 6, active: false }
    ],
    cells: [
      // Ring groove looping around center
      { q: 1, r: 0, enabled: true, modifier: 'DIR_BR' },
      { q: 1, r: 1, enabled: true, modifier: 'DIR_BL' },
      { q: 0, r: 2, enabled: true, modifier: 'DIR_L' },
      { q: -1, r: 1, enabled: true, modifier: 'DIR_TL' },
      { q: -2, r: 0, enabled: true, modifier: 'DIR_TR' },
      { q: -1, r: -1, enabled: true, modifier: 'DIR_R' },
      { q: 0, r: -2, enabled: true, modifier: 'DIR_BR' },
      { q: 1, r: -1, enabled: true, modifier: 'DIR_R' },
      // Melodic accents
      { q: 2, r: 0, enabled: true, modifier: 'DIR_TL' },
      { q: -2, r: 1, enabled: true, modifier: 'DIR_TR' }
    ]
  },
  {
    id: 'polyrhythm-orbit',
    name: 'Hex Polyrhythm',
    bpm: 120,
    playheads: [
      { id: 1, active: true },
      { id: 2, active: true },
      { id: 3, active: true },
      { id: 4, active: true },
      { id: 5, active: false },
      { id: 6, active: false }
    ],
    cells: [
      // Outer ring reflectors
      { q: 2, r: -2, enabled: true, modifier: 'DIR_BR' },
      { q: 2, r: 0, enabled: true, modifier: 'DIR_BL' },
      { q: 0, r: 2, enabled: true, modifier: 'DIR_L' },
      { q: -2, r: 2, enabled: true, modifier: 'DIR_TL' },
      { q: -2, r: 0, enabled: true, modifier: 'DIR_TR' },
      { q: 0, r: -2, enabled: true, modifier: 'DIR_R' },
      // Ring 1 inner deflectors
      { q: 1, r: 0, enabled: true, modifier: 'DIR_TR' },
      { q: -1, r: 0, enabled: true, modifier: 'DIR_BL' },
      { q: 0, r: 1, enabled: true, modifier: 'DIR_TL' },
      { q: 0, r: -1, enabled: true, modifier: 'DIR_BR' },
      { q: 1, r: -1, enabled: true, modifier: 'DIR_L' },
      { q: -1, r: 1, enabled: true, modifier: 'DIR_R' }
    ]
  },
  {
    id: 'idm-glitch',
    name: 'IDM Generative',
    bpm: 135,
    playheads: [
      { id: 1, active: true },
      { id: 2, active: true },
      { id: 3, active: false },
      { id: 4, active: false },
      { id: 5, active: true },
      { id: 6, active: true }
    ],
    cells: [
      // Generative cluster: default unrouted (NONE) moves randomly!
      { q: 1, r: 0, enabled: true, modifier: 'DIR_BR' },
      { q: -1, r: 0, enabled: true, modifier: 'DIR_TL' },
      { q: 0, r: 1, enabled: true, modifier: 'NONE' },
      { q: 0, r: -1, enabled: true, modifier: 'NONE' },
      { q: 1, r: -1, enabled: true, modifier: 'DIR_L' },
      { q: -1, r: 1, enabled: true, modifier: 'DIR_R' },
      { q: 2, r: -1, enabled: true, modifier: 'DIR_BL' },
      { q: -2, r: 1, enabled: true, modifier: 'DIR_TR' },
      { q: 1, r: 1, isDead: true, modifier: 'NONE' },
      { q: -1, r: -1, isDead: true, modifier: 'NONE' }
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
